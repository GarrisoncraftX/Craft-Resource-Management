import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from './ui/ModuleLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Users, Settings, Plus, Calendar, DollarSign, HelpCircle, Loader2, LogOut} from 'lucide-react';
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
import { DataTableDialog } from './ui/DataTableDialog';
import { Separator } from '@/components/ui/separator';
import { LogoSpinner } from '@/components/ui/LogoSpinner';



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
  const [dashboardKPIs, setDashboardKPIs] = useState<DashboardKPIs | null>(null);
  const [formattedLeaveBalance, setFormattedLeaveBalance] = useState<string>('');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLeaveRequestFormOpen, setIsLeaveRequestFormOpen] = useState(false);
  const [isITSupportFormOpen, setIsITSupportFormOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState<User | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [payrollData, setPayrollData] = useState<JavaPayslip[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ id: string; message: string; timestamp: string; color: string }[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState(false);
  const [payrollError, setPayrollError] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



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
      'ADMIN': '/admin/dashboard',
      'FINANCE': '/finance/dashboard',
      'HR': '/hr/dashboard',
      'PROCUREMENT': '/procurement/dashboard',
      'SECURITY': '/security/dashboard',
      'ASSETS': '/assets/dashboard',
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
      setIsLoading(true);
      if (!user?.userId) {
        console.error('User or User ID is undefined, skipping API call.');
        setDashboardKPIs({
          ...mockDashboardKPIs,
          nextPayrollDate: mockDashboardKPIs.nextPayrollDate || 'N/A',
          pendingTasks: mockDashboardKPIs.pendingTasks || 0
        });
        setFormattedLeaveBalance(calculateFormattedLeaveBalance(mockDashboardKPIs.leaveBalance));
        setIsLoading(false);
        return;
      }

      try {
        const { fetchEmployeeById } = await import('@/services/api');
        const employee = await fetchEmployeeById(user.userId);
        setEmployeeData(employee);

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

        const leaveRequestsResponse = await leaveApiService.getLeaveRequests(Number(user.userId));
        console.log("Fetch leave requests: ", leaveRequestsResponse)
        setLeaveRequests(leaveRequestsResponse);

        try {
          const attendanceResponse = await fetchAttendance(user.userId) as AttendanceRecord[];
          console.log("Attendace records", attendanceResponse)
          setAttendanceData(attendanceResponse);
          setAttendanceError(false);
        } catch (error) {
          console.error('Failed to fetch attendance data:', error);
          setAttendanceError(true);
        }

        try {
          const payrollResponse = await fetchPayslips(user.userId);
          console.log("Payroll response", payrollResponse)
          setPayrollData(payrollResponse);
          setPayrollError(false);
        } catch (error) {
          console.error('Failed to fetch payroll data:', error);
          setPayrollError(true);
        }

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
      } finally {
        setIsLoading(false);
      }

    };

    fetchDashboardData();
  }, [user]);

  if (!user || !dashboardKPIs) return <LogoSpinner size="lg" className="min-h-screen" />;

  if (isLoading) return <LogoSpinner size="lg" className="min-h-screen" />;


  return (
    <ModuleLayout
      onViewDashboard={handleViewSystem}
      onLogout={handleLogout}
      isEmployeeDashboard={true}
      showSidebar={false}
    >
      <Card className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="flex flex-col lg:flex-row justify-between p-2 items-center bg-blue-500">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white text-center lg:text-left">Welcome back, {user.firstName} {user.lastName}</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white text-center lg:text-right">Employee Portal</h1>
        </Card>

        {/* Main Layout: 30% Left, 70% Right */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* Left Section - 30% */}
          <div className="lg:w-[30%] space-y-6">
            {/* User Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 ring-4 ring-blue-400/50">
                    {employeeData?.profilePictureUrl ? (
                      <AvatarImage src={employeeData.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
                    ) : (
                      <AvatarFallback className="text-3xl font-bold bg-blue-500 text-white">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="mt-4 text-center w-full">
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="font-semibold">{user.employeeId}</p>
                    <p className="font-bold text-lg mt-2">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="w-full space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-semibold">{user.department}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-semibold">{user.role}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">Hire Date</p>
                      <p className="font-semibold">
                        {user.hiredDate ? new Date(user.hiredDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Management Buttons */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="w-full justify-start bg-amber-500 hover:bg-amber-600 text-white" 
                    onClick={() => setIsAttendanceDialogOpen(true)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Attendance
                  </Button>
                  <Button 
                    className="w-full justify-start bg-amber-500 hover:bg-amber-600 text-white" 
                    onClick={() => setIsLeaveDialogOpen(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Leave
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button 
                    className="w-full justify-center bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => setIsPayrollDialogOpen(true)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payroll
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - 70% */}
          <div className="lg:w-[70%] space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent>
                <div className="flex justify-left mb-3">
                  <span className="text-xs font-semibold bg-blue-500 text-white px-3 py-1 rounded">Quick Actions</span>
                </div>
                <div className="space-y-2">
                  <Button className="w-full justify-center bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/employee/profile')}>
                    <Users className="h-4 w-4 mr-2" />
                    Update Your Profile
                  </Button>
                  <Separator />
                  <Button className="w-full justify-center bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setIsITSupportFormOpen(true)}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Contact IT Support 
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submit Leave */}
            <Card>
              <CardContent>
                <div className="flex justify-left space-x-4 items-center">
                  <span className="text-xs font-semibold bg-blue-500 text-white px-3 py-1 rounded">Submit Leave</span>
                    <Plus className="h-10 w-10 bg-amber-500 rounded-50" onClick={() => setIsLeaveRequestFormOpen(true)}/>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards - 2 per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Card className="bg-blue-500 text-white">
                <CardHeader>
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

      

              <Card className="bg-amber-500 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-100 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Last Pay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {payrollData.length > 0 ? payrollData[0].netPay : (payrollError && mockPayrollHistory.length > 0 ? mockPayrollHistory[0].netPay : 'N/A')}
                  </div>
                  <p className="text-orange-100 text-sm">Net salary received</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
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

        {/* Dialogs for Tables */}
        <DataTableDialog
          isOpen={isAttendanceDialogOpen}
          onClose={() => setIsAttendanceDialogOpen(false)}
          title="My Attendance History"
        >
          <div className="flex justify-end mb-4">
            <Button onClick={refreshAttendance} variant="secondary" size="sm">
              Refresh
            </Button>
          </div>
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
        </DataTableDialog>

        <DataTableDialog
          isOpen={isLeaveDialogOpen}
          onClose={() => setIsLeaveDialogOpen(false)}
          title="My Leave Applications"
        >
          <div className="flex justify-end mb-4">
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
        </DataTableDialog>

        <DataTableDialog
          isOpen={isPayrollDialogOpen}
          onClose={() => setIsPayrollDialogOpen(false)}
          title="My Payroll History"
        >
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
        </DataTableDialog>
      </Card>
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
