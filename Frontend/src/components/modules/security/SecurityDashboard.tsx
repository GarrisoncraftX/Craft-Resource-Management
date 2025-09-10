
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, AlertTriangle, CreditCard, Eye, UserPlus } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';

export const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const recentVisitors = [
    { name: 'John Client', company: 'ABC Corp', purpose: 'Business Meeting', checkIn: '09:30', status: 'In Building', hostEmployee: 'Jane Manager' },
    { name: 'Mary Vendor', company: 'Supply Co', purpose: 'Delivery', checkIn: '10:15', status: 'Checked Out', hostEmployee: 'Bob Receiver' },
    { name: 'Tom Consultant', company: 'Consulting LLC', purpose: 'IT Consultation', checkIn: '11:00', status: 'In Building', hostEmployee: 'Alice IT' },
  ];

  const securityIncidents = [
    { id: 'INC-001', type: 'Unauthorized Access', location: 'Server Room', time: '14:30', severity: 'High', status: 'Investigating' },
    { id: 'INC-002', type: 'Tailgating', location: 'Main Entrance', time: '09:45', severity: 'Medium', status: 'Resolved' },
    { id: 'INC-003', type: 'Lost ID Card', location: 'Reported by Employee', time: '12:15', severity: 'Low', status: 'Card Deactivated' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Security Management Module</h1>
          <p className="text-gray-600">Access control and security monitoring</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Currently in building</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active ID Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">2 pending activation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Points</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visitors">Visitor Management</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
            <TabsTrigger value="cards">ID Card Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Visitors</CardTitle>
                  <CardDescription>Current and recent visitor activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentVisitors.map((visitor, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{visitor.name}</TableCell>
                          <TableCell>{visitor.company}</TableCell>
                          <TableCell>{visitor.purpose}</TableCell>
                          <TableCell>
                            <Badge variant={visitor.status === 'In Building' ? 'default' : 'secondary'}>
                              {visitor.status}
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
                  <CardTitle>Security Incidents</CardTitle>
                  <CardDescription>Recent security events and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityIncidents.map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{incident.type}</p>
                          <p className="text-sm text-gray-600">{incident.location} - {incident.time}</p>
                          <p className="text-xs text-gray-500">ID: {incident.id}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={incident.severity === 'High' ? 'destructive' : incident.severity === 'Medium' ? 'default' : 'secondary'}>
                            {incident.severity}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{incident.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Management</CardTitle>
                <CardDescription>Comprehensive visitor tracking and management</CardDescription>
                <PermissionGuard requiredPermissions={['security.visitors.manage']}>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register New Visitor
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Detailed visitor management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Access Control Configuration</CardTitle>
                <CardDescription>Manage access permissions and security zones</CardDescription>
                <PermissionGuard requiredPermissions={['security.access.configure']}>
                  <Button>
                    <Shield className="h-4 w-4 mr-2" />
                    Configure Access Rules
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Access control configuration interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>Security Incidents Reporting</CardTitle>
                <CardDescription>Report and track security incidents</CardDescription>
                <PermissionGuard requiredPermissions={['security.incidents.create']}>
                  <Button>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report New Incident
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Security incidents reporting interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards">
            <Card>
              <CardHeader>
                <CardTitle>ID Card Management</CardTitle>
                <CardDescription>Manage employee ID cards and access credentials</CardDescription>
                <PermissionGuard requiredPermissions={['security.cards.manage']}>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Issue New Card
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">ID card management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
