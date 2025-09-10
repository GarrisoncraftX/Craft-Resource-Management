
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Calendar, DollarSign, Award, UserPlus} from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';

export const HRDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const recentHires = [
    { name: 'John Smith', department: 'IT', position: 'Software Engineer', startDate: '2024-01-15', status: 'Active' },
    { name: 'Jane Doe', department: 'Marketing', position: 'Marketing Specialist', startDate: '2024-01-10', status: 'Onboarding' },
    { name: 'Mike Johnson', department: 'Finance', position: 'Financial Analyst', startDate: '2024-01-08', status: 'Active' },
  ];

  const leaveRequests = [
    { employee: 'Alice Brown', type: 'Annual Leave', dates: '2024-02-01 to 2024-02-05', status: 'Pending', days: 5 },
    { employee: 'Bob Wilson', type: 'Sick Leave', dates: '2024-01-20 to 2024-01-22', status: 'Approved', days: 3 },
    { employee: 'Carol Davis', type: 'Personal Leave', dates: '2024-02-10 to 2024-02-12', status: 'Pending', days: 3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Human Resources Module</h1>
          <p className="text-gray-600">Employee management and HR operations</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">+3 new hires this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Requires manager approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$485,200</div>
              <p className="text-xs text-muted-foreground">Processing in 5 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Q1 compliance training</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employee Profiles</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="leave">Leave Management</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Hires</CardTitle>
                  <CardDescription>New employees this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentHires.map((hire, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{hire.name}</TableCell>
                          <TableCell>{hire.department}</TableCell>
                          <TableCell>{hire.position}</TableCell>
                          <TableCell>
                            <Badge variant={hire.status === 'Active' ? 'default' : 'secondary'}>
                              {hire.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave Requests</CardTitle>
                  <CardDescription>Pending approval requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaveRequests.map((request, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{request.employee}</p>
                          <p className="text-sm text-gray-600">{request.type} - {request.days} days</p>
                          <p className="text-xs text-gray-500">{request.dates}</p>
                        </div>
                        <Badge variant={request.status === 'Approved' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>Manage employee profiles and information</CardDescription>
                <PermissionGuard requiredPermissions={['hr.employees.create']}>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Employee
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Employee management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Processing</CardTitle>
                <CardDescription>Manage employee compensation and payroll</CardDescription>
                <PermissionGuard requiredPermissions={['hr.payroll.process']}>
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payroll
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Payroll processing interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader>
                <CardTitle>Leave Management</CardTitle>
                <CardDescription>Manage employee leave requests and approvals</CardDescription>
                <PermissionGuard requiredPermissions={['hr.leave.approve']}>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Review Leave Requests
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Leave management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle>Benefits Administration</CardTitle>
                <CardDescription>Manage employee benefits and insurance</CardDescription>
                <PermissionGuard requiredPermissions={['hr.benefits.manage']}>
                  <Button>Manage Benefits</Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Benefits administration interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Training & Development</CardTitle>
                <CardDescription>Manage employee training programs</CardDescription>
                <PermissionGuard requiredPermissions={['hr.training.manage']}>
                  <Button>
                    <Award className="h-4 w-4 mr-2" />
                    Create Training Program
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Training management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
