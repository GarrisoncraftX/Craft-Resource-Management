import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock, CheckCircle, XCircle, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { leaveApiService } from '@/services/leaveApi';
import type { LeaveRequest, LeaveBalance, LeaveStatistics, LeaveType } from '@/types/leave';

export const LeaveManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('requests');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [statistics, setStatistics] = useState<LeaveStatistics | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter leave requests based on status
  const filteredLeaveRequests = (leaveRequests || []).filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [requestsData, balancesData, statsData, typesData] = await Promise.all([
        leaveApiService.getAllLeaveRequests(),
        leaveApiService.getAllLeaveBalances(),
        leaveApiService.getLeaveStatistics(),
        leaveApiService.getLeaveTypes()
      ]);

      // Ensure data is in expected format before setting state
      const requests = Array.isArray(requestsData) ? requestsData : [];
      const types = Array.isArray(typesData) ? typesData : [];

      // Map leave types to requests based on leaveTypeId
      const requestsWithTypes = requests.map(request => ({
        ...request,
        leaveType: types.find(type => type.id === request.leaveTypeId) || request.leaveType
      }));

      setLeaveRequests(requestsWithTypes);
      setLeaveBalances(Array.isArray(balancesData) ? balancesData : []);
      setStatistics(statsData);
      setLeaveTypes(types);
    } catch (err) {
      setError('Failed to load leave management data');
      console.error('Error loading leave data:', err);
      setLeaveRequests([]);
      setLeaveBalances([]);
      setStatistics(null);
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  };


  const handleApproveRequest = async (requestId: string) => {
    try {
      await leaveApiService.approveLeaveRequest(requestId);
      await loadData();
    } catch (err) {
      console.error('Error approving leave request:', err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await leaveApiService.rejectLeaveRequest(requestId, 1, 'Request rejected');
      await loadData();
    } catch (err) {
      console.error('Error rejecting leave request:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leave management data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
            <p className="text-muted-foreground">Manage employee leave requests and balances</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Leave Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.approvedToday}</div>
                <p className="text-xs text-muted-foreground">Requests approved</p>
              </CardContent>
            </Card>

              <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Approved Leaves</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalApprovedLeaves}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Leave (This Month)</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.averageLeaveDaysThisMonth}</div>
                <p className="text-xs text-muted-foreground">Days per employee</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
            <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
            <TabsTrigger value="policies">Leave Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Manage and approve employee leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaveRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.User ? `${request.User.firstName} ${request.User.lastName}` : `Employee ${request.userId}`}
                        </TableCell>
                        <TableCell>{request.leaveType?.name || `Leave Type ${request.leaveTypeId}`}</TableCell>
                        <TableCell>{request.startDate} to {request.endDate}</TableCell>
                        <TableCell>{request.totalDays}</TableCell>
                        <TableCell>{request.reason || 'No reason provided'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === 'approved' ? 'default' :
                                request.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproveRequest(request.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRejectRequest(request.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            {leaveBalances && leaveBalances.length > 0 ? (
              Object.entries(
                leaveBalances.reduce((acc, balance) => {
                  const employeeId = balance.userId || 'unknown';
                  if (!acc[employeeId]) {
                    acc[employeeId] = {
                      firstName: balance.firstName,
                      middleName: balance.middleName,
                      lastName: balance.lastName,
                      employeeName: balance.employeeName,
                      balances: []
                    };
                  }
                  acc[employeeId].balances.push(balance);
                  return acc;
                }, {} as Record<string, { firstName?: string; middleName?: string; lastName?: string; employeeName?: string; balances: LeaveBalance[] }>
              )
              ).map(([employeeId, employeeData]) => {
                const displayName = employeeData.employeeName ||
                  `${employeeData.firstName || ''} ${employeeData.middleName ? employeeData.middleName + ' ' : ''}${employeeData.lastName || ''}`.trim() ||
                  `Employee ${employeeId}`;

                return (
                  <Card key={employeeId}>
                    <CardHeader>
                      <CardTitle>
                        <h3 className="text-xl font-semibold">
                          {displayName}
                        </h3>
                      </CardTitle>
                      <CardDescription>Leave balances for {employeeData.firstName || displayName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {employeeData.balances.map((balance) => (
                          <div key={balance.leaveTypeId} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{balance.leaveTypeName}</span>
                              <span className="text-lg font-bold">{balance.remainingDaysFormatted}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${balance.allocatedDays > 0 ? (balance.remainingDays / balance.allocatedDays) * 100 : 0}%`
                                }}
                              />
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Used: {balance.usedDays} days
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p>No leave balances found.</p>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Calendar</CardTitle>
                  <CardDescription>View leave schedules and availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Leave Schedule</CardTitle>
                  <CardDescription>Employees currently on leave</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaveRequests
                      .filter(request => request.status === 'approved')
                      .map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {request.User ? `${request.User.firstName} ${request.User.lastName}` : `Employee ${request.userId}`}
                            </p>
                            <p className="text-sm text-muted-foreground">{request.leaveType?.name} - {request.totalDays} days</p>
                          </div>
                          <Badge variant="default">Approved</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Leave Policy</CardTitle>
                  <CardDescription>Configure annual leave entitlements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">Entitlement: 25 days per year</p>
                    <p className="text-sm">Carryover: 5 days maximum</p>
                    <p className="text-sm">Advance: 5 days allowed</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">Edit Policy</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sick Leave Policy</CardTitle>
                  <CardDescription>Configure sick leave provisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">Entitlement: 12 days per year</p>
                    <p className="text-sm">Medical certificate: After 3 days</p>
                    <p className="text-sm">Carryover: Not allowed</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">Edit Policy</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Leave Policy</CardTitle>
                  <CardDescription>Configure personal leave provisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">Entitlement: 5 days per year</p>
                    <p className="text-sm">Notice required: 2 weeks</p>
                    <p className="text-sm">Carryover: Not allowed</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">Edit Policy</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
