import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Clock, CheckCircle, XCircle, Calendar as CalendarIcon, Users } from 'lucide-react';

const leaveRequests = [
  {
    id: 'LR001',
    employee: 'John Doe',
    type: 'Annual Leave',
    startDate: '2024-02-15',
    endDate: '2024-02-19',
    days: 5,
    status: 'Pending',
    reason: 'Family vacation',
    appliedDate: '2024-01-20'
  },
  {
    id: 'LR002',
    employee: 'Jane Smith',
    type: 'Sick Leave',
    startDate: '2024-02-12',
    endDate: '2024-02-13',
    days: 2,
    status: 'Approved',
    reason: 'Medical appointment',
    appliedDate: '2024-02-10'
  },
  {
    id: 'LR003',
    employee: 'Mike Johnson',
    type: 'Personal Leave',
    startDate: '2024-02-20',
    endDate: '2024-02-22',
    days: 3,
    status: 'Rejected',
    reason: 'Personal matters',
    appliedDate: '2024-02-05'
  },
];

const leaveBalances = [
  {
    employee: 'John Doe',
    annualLeave: { total: 25, used: 8, remaining: 17 },
    sickLeave: { total: 12, used: 2, remaining: 10 },
    personalLeave: { total: 5, used: 1, remaining: 4 }
  },
  {
    employee: 'Jane Smith',
    annualLeave: { total: 25, used: 12, remaining: 13 },
    sickLeave: { total: 12, used: 4, remaining: 8 },
    personalLeave: { total: 5, used: 0, remaining: 5 }
  },
  {
    employee: 'Mike Johnson',
    annualLeave: { total: 25, used: 15, remaining: 10 },
    sickLeave: { total: 12, used: 1, remaining: 11 },
    personalLeave: { total: 5, used: 2, remaining: 3 }
  },
];

export const LeaveManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
            <p className="text-muted-foreground">Manage employee leave requests and balances</p>
          </div>
          <Button>
            <CalendarDays className="h-4 w-4 mr-2" />
            New Leave Request
          </Button>
        </div>

        {/* Leave Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Requests approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees on Leave</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently away</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Leave Days</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.5</div>
              <p className="text-xs text-muted-foreground">Days per employee</p>
            </CardContent>
          </Card>
        </div>

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
                    {leaveRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.employee}</TableCell>
                        <TableCell>{request.type}</TableCell>
                        <TableCell>{request.startDate} to {request.endDate}</TableCell>
                        <TableCell>{request.days}</TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              request.status === 'Approved' ? 'default' : 
                              request.status === 'Pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {request.status === 'Pending' && (
                              <>
                                <Button variant="ghost" size="sm">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
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
            <Card>
              <CardHeader>
                <CardTitle>Employee Leave Balances</CardTitle>
                <CardDescription>Track remaining leave days for each employee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {leaveBalances.map((balance, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-4">{balance.employee}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Annual Leave</span>
                            <span className="text-sm font-medium">{balance.annualLeave.remaining}/{balance.annualLeave.total}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(balance.annualLeave.remaining / balance.annualLeave.total) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Sick Leave</span>
                            <span className="text-sm font-medium">{balance.sickLeave.remaining}/{balance.sickLeave.total}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-secondary h-2 rounded-full"
                              style={{ width: `${(balance.sickLeave.remaining / balance.sickLeave.total) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Personal Leave</span>
                            <span className="text-sm font-medium">{balance.personalLeave.remaining}/{balance.personalLeave.total}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full"
                              style={{ width: `${(balance.personalLeave.remaining / balance.personalLeave.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-sm text-muted-foreground">Sick Leave - 2 days</p>
                      </div>
                      <Badge variant="secondary">Approved</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Alex Johnson</p>
                        <p className="text-sm text-muted-foreground">Annual Leave - 5 days</p>
                      </div>
                      <Badge variant="default">Approved</Badge>
                    </div>
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