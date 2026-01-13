import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from './ui/ModuleLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Users, FileText, Settings, Plus, Calendar, DollarSign, HelpCircle, Loader2, LogOut} from 'lucide-react';
import { leaveApiService } from '@/services/nodejsbackendapi/leaveApi';
import { LeaveBalance, LeaveRequest } from '@/types/nodejsbackendapi/leaveTypes';
import { mockAttendanceHistory, mockDashboardKPIs, mockPayrollHistory } from '@/services/mockData/hr';
import { fetchAttendance, fetchPayslips, mapAttendanceToUI, mapPayrollToUI, fetchRecentActivities } from '@/services/api';
import { attendanceApiService } from '@/services/pythonbackendapi/attendanceApi';
import LeaveRequestForm from './modules/hr/LeaveRequestForm';
import { ITSupportForm } from './modules/hr/ITSupportForm';
import { DashboardKPIs } from '@/types/api';
import { AttendanceRecord } from '@/types/pythonbackendapi/attendanceTypes';
import { Payslip as JavaPayslip, User } from '@/types/javabackendapi/hrTypes';
import { AuditLog as JavaAuditLog } from '@/services/javabackendapi/systemApi';
import { formatAttendanceMethod } from '@/utils/attendanceUtils';



const calculateFormattedLeaveBalance = (totalDays: number): string => {
  if (totalDays >= 30) {
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    let formattedBalance = `${months} month${months !== 1 ? 's' : ''}`;
    if (days > 0) {
      formattedBalance += ` ${days} day${days !== 1 ? 's' : ''}`;
    }
    return formattedBalance;
  } else {
    return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
  }
};

const processLeaveBalances = (data: LeaveBalance[]): { totalLeaveBalance: number; mostRecentBalances: LeaveBalance[] } => {
  let mostRecentDate: Date | null = null;
  if (Array.isArray(data) && data.length > 0) {
    mostRecentDate = data.reduce((latest, item) => {
      const itemDate = new Date(item.updatedAt);
      return itemDate > latest ? itemDate : latest;
    }, new Date(0));
  }

  const mostRecentBalances = Array.isArray(data) && mostRecentDate
    ? data.filter(item => new Date(item.updatedAt).getTime() === mostRecentDate.getTime())
    : [];

  const totalLeaveBalance = mostRecentBalances.length > 0
    ? mostRecentBalances.reduce((sum, item) => {
      const parsedRemainingDays = Number.parseFloat(item.remainingDays.toString().split('.')[0]);
      return sum + (Number.isNaN(parsedRemainingDays) ? 0 : parsedRemainingDays);
    }, 0)
    : 0;

  return { totalLeaveBalance, mostRecentBalances };
};

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance');
  const [dashboardKPIs, setDashboardKPIs] = useState<DashboardKPIs | null>(null);
  const [formattedLeaveBalance, setFormattedLeaveBalance] = useState<string>('');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLeaveRequestFormOpen, setIsLeaveRequestFormOpen] = useState(false);
  const [isITSupportFormOpen, setIsITSupportFormOpen] = useState(false);
  const [employeeData] = useState<User | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [payrollData, setPayrollData] = useState<JavaPayslip[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ id: string; message: string; timestamp: string; color: string }[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState(false);
  const [payrollError, setPayrollError] = useState(false);



  const refreshRecentActivities = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const auditLogsResponse = await fetchRecentActivities(user.userId);
      const activities = auditLogsResponse.map((log: JavaAuditLog) => ({
        id: `audit-${log.id || 'unknown'}`,
        message: log.action,
        timestamp: log.timestamp,
        color: 'bg-green-500'
      }));
      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to refresh recent activities:', error);
    }
  }, [user?.userId]);

  const refreshLeaveRequests = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const response = await leaveApiService.getLeaveRequests(Number(user.userId));
      setLeaveRequests(response);
    } catch {
      setLeaveRequests([]);
    }
  }, [user?.userId]);

  const refreshAttendance = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const attendanceResponse = await fetchAttendance(user.userId) as AttendanceRecord[];
      setAttendanceData(attendanceResponse);
    } catch (error) {
      console.error('Failed to refresh attendance data:', error);
    }
  }, [user?.userId]);

  const handleCheckOut = useCallback(async (recordDate: string) => {
    if (!user?.userId) return;

    setIsCheckingOut(recordDate);
    try {
      const response = await attendanceApiService.clockOut({
        user_id: user.userId,
        method: 'manual' 
      });

      if (response.success) {
        await refreshAttendance();
        await refreshRecentActivities();
      } else {
        console.error('Checkout failed:', response.message);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsCheckingOut(null);
    }
  }, [user?.userId, refreshAttendance, refreshRecentActivities]);

  const getModuleRoute = useCallback((departmentCode: string, roleCode: string) => {
    const departmentRoutes: Record<string, string> = {
      'FINANCE': '/finance/dashboard',
      'HR': '/hr/dashboard',
      'PROCUREMENT': '/procurement/dashboard',
      'LEGAL': '/legal/dashboard',
      'PLANNING': '/planning/dashboard',
      'TRANSPORTATION': '/transportation/dashboard',
      'HEALTH_SAFETY': '/health-safety/dashboard',
      'PUBLIC_RELATIONS': '/public-relations/dashboard',
      'REVENUE_TAX': '/revenue-tax/dashboard',
      'SECURITY': '/security/dashboard',
      'ASSETS': '/assets/dashboard',
      'OPERATIONS': '/operations/dashboard',
      'INFORMATION_TECHNOLOGY': '/admin/dashboard',
    };

    const roleOverrides: Record<string, string> = {
      'ADMIN': '/admin/dashboard',
      'SYSTEM_ADMIN': '/admin/dashboard', 
    };

    if (roleOverrides[roleCode]) {
      return roleOverrides[roleCode];
    }

    return departmentRoutes[departmentCode] || '/employee-dashboard';
  }, []);

  const handleViewSystem = useCallback(() => {
    if (user) {
      const route = getModuleRoute(user.departmentCode, user.roleCode);
      console.log(`Navigating to: ${route} for department: ${user.departmentCode}, role: ${user.roleCode}`);
      navigate(route);
    }
  }, [user, getModuleRoute, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/signin');
  }, [logout, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.userId) {
        console.error('User or User ID is undefined, skipping API call.');
        setDashboardKPIs({
          ...mockDashboardKPIs,
          nextPayrollDate: mockDashboardKPIs.nextPayrollDate || 'N/A',
          pendingTasks: mockDashboardKPIs.pendingTasks || 0
        });
        setFormattedLeaveBalance(calculateFormattedLeaveBalance(mockDashboardKPIs.leaveBalance));
        return;
      }

      try {
        const leaveBalanceResponse = await leaveApiService.getLeaveBalances(Number(user.userId));
        console.log('Fetched leave balance data:', leaveBalanceResponse);
        const leaveBalanceData = leaveBalanceResponse;

        const { totalLeaveBalance } = processLeaveBalances(leaveBalanceData);
        const formattedBalance = calculateFormattedLeaveBalance(totalLeaveBalance);

        setDashboardKPIs((prev) => ({
          ...(prev || mockDashboardKPIs),
          leaveBalance: totalLeaveBalance,
          nextPayrollDate: prev?.nextPayrollDate || mockDashboardKPIs.nextPayrollDate || 'N/A',
          pendingTasks: prev?.pendingTasks || mockDashboardKPIs.pendingTasks || 0,
        }));
        setFormattedLeaveBalance(formattedBalance);

        // Fetch leave requests
        const leaveRequestsResponse = await leaveApiService.getLeaveRequests(Number(user.userId));
        console.log("Fetch leave requests: ", leaveRequestsResponse)
        setLeaveRequests(leaveRequestsResponse);

        // Fetch attendance data
        try {
          const attendanceResponse = await fetchAttendance(user.userId) as AttendanceRecord[];
          console.log("Attendace records", attendanceResponse)
          setAttendanceData(attendanceResponse);
          setAttendanceError(false);
        } catch (error) {
          console.error('Failed to fetch attendance data:', error);
          setAttendanceError(true);
        }

        // Fetch payroll data
        try {
          const payrollResponse = await fetchPayslips(user.userId);
          console.log("Payroll response", payrollResponse)
          setPayrollData(payrollResponse);
          setPayrollError(false);
        } catch (error) {
          console.error('Failed to fetch payroll data:', error);
          setPayrollError(true);
        }

        // Fetch recent activities from audit logs
        const auditLogsResponse = await fetchRecentActivities(user.userId);
        console.log("Audit logs response", auditLogsResponse);
        const activities = auditLogsResponse.map((log: JavaAuditLog) => ({
          id: `audit-${log.id || 'unknown'}`,
          message: log.action,
          timestamp: log.timestamp,
          color: 'bg-green-500'
        }));
        setRecentActivities(activities.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch dashboard data, using mock data fallback.', error);
        setDashboardKPIs({
          ...mockDashboardKPIs,
          nextPayrollDate: 'N/A',
          pendingTasks: 0
        });
        setFormattedLeaveBalance(calculateFormattedLeaveBalance(mockDashboardKPIs.leaveBalance));
        setLeaveRequests([]);
        setRecentActivities([]);
      }

    };

    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      refreshAttendance();
    }
  }, [activeTab, refreshAttendance]);

  if (!user || !dashboardKPIs) return null;


  return (
    <ModuleLayout
      onViewDashboard={handleViewSystem}
      onLogout={handleLogout}
      isEmployeeDashboard={true}
      showSidebar={false}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Employee Portal</h1>
          <p className="text-white">Welcome back, {user.firstName} {user.lastName}</p>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <CardHeader className="text-white">
            <CardTitle className="flex items-center text-white">
              <Users className="h-5 w-5 mr-2" />
             <span className="text-yellow-400 mr-2">{user.firstName} {user.lastName} </span> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white flex items-center gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-yellow-400/50 hover:ring-yellow-400 transition-all cursor-pointer">
              {employeeData?.profilePictureUrl ? (
                <AvatarImage src={employeeData.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
              ) : (
                <AvatarFallback className="text-4xl font-extrabold bg-yellow-400 text-white">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 flex-1">
              <div>
                <p className="text-blue-100 text-sm">Employee ID</p>
                <p className="font-semibold text-sm sm:text-base">{user.employeeId}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Department</p>
                <p className="font-semibold text-sm sm:text-base">{user.department}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Position</p>
                <p className="font-semibold text-sm sm:text-base">{user.role}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Email</p>
                <p className="font-semibold text-sm sm:text-base break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Hire Date</p>
                <p className="font-semibold text-sm sm:text-base">
                  {user.hiredDate ? new Date(user.hiredDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-green-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                This Month Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="w-full bg-green-600 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-100 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formattedLeaveBalance}</div>
              <p className="text-blue-100 text-sm">Total leave remaining</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-100 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Overtime This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12.5h</div>
              <p className="text-purple-100 text-sm">Extra hours worked</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-100 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Last Pay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$5,722.92</div>
              <p className="text-orange-100 text-sm">Net salary received</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex w-full overflow-x-auto justify-between border-b p-0 h-auto rounded-none">
            <TabsTrigger value="attendance" className="whitespace-nowrap px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 font-semibold transition-colors">
              <Clock className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave" className="whitespace-nowrap px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-green-600 font-semibold transition-colors">
              <Calendar className="h-4 w-4 mr-2" />
              Leave Management
            </TabsTrigger>
            <TabsTrigger value="payroll" className="whitespace-nowrap px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-purple-600 font-semibold transition-colors">
              <DollarSign className="h-4 w-4 mr-2" />
              Payroll
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
              <div>
                <Card className="bg-blue-600 text-white mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <Clock className="h-5 w-5 mr-2" />                      
                      My Attendance History
                      <Button onClick={refreshAttendance} variant="secondary" size="sm">
                        Refresh
                      </Button>
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Check In</TableHead>
                          <TableHead>Check Out</TableHead>
                          <TableHead>Total Hours</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          {(attendanceError ? mapAttendanceToUI(mockAttendanceHistory as unknown as AttendanceRecord[]) : mapAttendanceToUI(attendanceData)).some(record => record.checkIn !== '-' && record.checkOut === '-') && (
                            <TableHead>Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>{(attendanceError ? mapAttendanceToUI(mockAttendanceHistory as unknown as AttendanceRecord[]) : mapAttendanceToUI(attendanceData)).map((record, index) => (
                        <TableRow key={`${record.date}-${index}`}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{(record.checkIn)}</TableCell>
                          <TableCell>{record.checkOut === '-' ? '-' : record.checkOut}</TableCell>
                          <TableCell>{record.totalHours}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>In: {formatAttendanceMethod(record.checkIn === '-' ? 'N/A' : record.clock_in_method || 'N/A')}</div>
                              <div>Out: {formatAttendanceMethod(record.checkOut === '-' ? 'N/A' : record.clock_out_method || 'N/A')}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'Present' ? 'default' : 'secondary'}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          {(attendanceError ? mapAttendanceToUI(mockAttendanceHistory as unknown as AttendanceRecord[]) : mapAttendanceToUI(attendanceData)).some(r => r.checkIn !== '-' && r.checkOut === '-') && (
                            <TableCell>
                              {record.checkIn !== '-' && record.checkOut === '-' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCheckOut(record.date)}
                                disabled={isCheckingOut === record.date}
                              >
                                {isCheckingOut === record.date ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Checking Out...
                                  </>
                                ) : (
                                  <>
                                    <LogOut className="mr-2 h-3 w-3" />
                                    Check Out
                                  </>
                                )}
                              </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}</TableBody>
                    </Table>
                    <div className="flex justify-between items-center p-4 border-t">
                      <span className="text-sm text-gray-600">Page 1 of 1</span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </TabsContent>

          <TabsContent value="leave">
            <Card className="bg-green-600 text-white mb-4">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calendar className="h-5 w-5 mr-2" />
                  My Leave Applications
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
          <CardContent className="p-0">
            <div className="flex justify-end p-4">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsLeaveRequestFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Apply for Leave
              </Button>
            </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{leaveRequests.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.leaveType?.name || 'N/A'}</TableCell>
                      <TableCell>{leave.startDate}</TableCell>
                      <TableCell>{leave.endDate}</TableCell>
                      <TableCell>{leave.totalDays} days</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-gray-800">
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{leave.reviewComments || '-'}</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
                <div className="flex justify-between items-center p-4 border-t">
                  <span className="text-sm text-gray-600">Page 1 of 1</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <Card className="bg-purple-600 text-white mb-4">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <DollarSign className="h-5 w-5 mr-2" />
                  My Payroll History
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Overtime</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{(payrollError ? mockPayrollHistory : mapPayrollToUI(payrollData as JavaPayslip[])).map((payroll, index) => (
                    <TableRow key={payroll.period || index}>
                      <TableCell>{payroll.period}</TableCell>
                      <TableCell>{payroll.basicSalary}</TableCell>
                      <TableCell>{payroll.allowances}</TableCell>
                      <TableCell>{payroll.overtime}</TableCell>
                      <TableCell>{payroll.deductions}</TableCell>
                      <TableCell>{payroll.netPay}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-gray-800">
                          {payroll.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
                <div className="flex justify-between items-center p-4 border-t">
                  <span className="text-sm text-gray-600">Page 1 of 1</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Frequently used employee services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setIsLeaveRequestFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Submit Leave</div>
                    <div className="text-xs text-muted-foreground">Request time off</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setActiveTab('payroll')}>
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">View Payslips</div>
                    <div className="text-xs text-muted-foreground">Download payslips</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => navigate('/profile')}>
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Update Profile</div>
                    <div className="text-xs text-muted-foreground">Edit personal info</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => setIsITSupportFormOpen(true)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">IT Support</div>
                    <div className="text-xs text-muted-foreground">Request assistance</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-green-600">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activities
                </div>
                <Button onClick={refreshRecentActivities} variant="ghost" size="sm">
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                Your latest system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${activity.color} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <LeaveRequestForm
        userId={Number(user.userId)}
        isOpen={isLeaveRequestFormOpen}
        onClose={() => setIsLeaveRequestFormOpen(false)}
        onSuccess={() => {
          setIsLeaveRequestFormOpen(false);
          refreshLeaveRequests();
          refreshRecentActivities();
        }}
      />
      <ITSupportForm
        isOpen={isITSupportFormOpen}
        onClose={() => setIsITSupportFormOpen(false)}
        onSuccess={() => {
          setIsITSupportFormOpen(false);
          refreshRecentActivities();
        }}
      />
    </ModuleLayout>
  );
};

export default EmployeeDashboard;