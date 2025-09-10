import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, Users, ClipboardList, Plus, FileText } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const HealthSafetyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const safetyInspections = [
    { id: 'INS-001', facility: 'City Hall', type: 'Fire Safety', inspector: 'John Safety', date: '2024-01-20', status: 'Passed', score: 95 },
    { id: 'INS-002', facility: 'Public Library', type: 'Building Safety', inspector: 'Sarah Inspector', date: '2024-01-18', status: 'Failed', score: 72 },
    { id: 'INS-003', facility: 'Community Center', type: 'Health & Safety', inspector: 'Mike Auditor', date: '2024-01-22', status: 'Pending', score: 0 },
  ];

  const incidents = [
    { id: 'INC-001', type: 'Workplace Injury', location: 'Maintenance Dept', reporter: 'Bob Worker', date: '2024-01-21', severity: 'Minor', status: 'Under Investigation' },
    { id: 'INC-002', type: 'Chemical Spill', location: 'Lab Building', reporter: 'Jane Scientist', date: '2024-01-19', severity: 'Major', status: 'Resolved' },
    { id: 'INC-003', type: 'Equipment Failure', location: 'Generator Room', reporter: 'Tom Tech', date: '2024-01-20', severity: 'Medium', status: 'Investigating' },
  ];

  const trainingPrograms = [
    { name: 'Fire Safety Training', participants: 120, completion: 95, nextSession: '2024-02-15', status: 'Active' },
    { name: 'First Aid Certification', participants: 85, completion: 88, nextSession: '2024-03-01', status: 'Active' },
    { name: 'Emergency Response', participants: 200, completion: 76, nextSession: '2024-02-20', status: 'Scheduled' },
  ];

  const healthSafetyMetrics = {
    totalInspections: 45,
    incidentRate: 2.3,
    trainingCompletion: 86,
    complianceScore: 94
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Health & Safety Module</h1>
          <p className="text-gray-600">Workplace safety and environmental health</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthSafetyMetrics.totalInspections}</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incident Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthSafetyMetrics.incidentRate}</div>
              <p className="text-xs text-muted-foreground">Per 100 employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthSafetyMetrics.trainingCompletion}%</div>
              <p className="text-xs text-muted-foreground">Above target (80%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthSafetyMetrics.complianceScore}%</div>
              <p className="text-xs text-muted-foreground">+2% from last quarter</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inspections">Safety Inspections</TabsTrigger>
            <TabsTrigger value="incidents">Incident Reporting</TabsTrigger>
            <TabsTrigger value="training">Safety Training</TabsTrigger>
            <TabsTrigger value="environmental">Environmental Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Safety Inspections</CardTitle>
                  <CardDescription>Latest facility safety inspections</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Facility</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safetyInspections.map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell className="font-medium">{inspection.facility}</TableCell>
                          <TableCell>{inspection.type}</TableCell>
                          <TableCell>{inspection.date}</TableCell>
                          <TableCell>
                            <Badge variant={inspection.status === 'Passed' ? 'default' : inspection.status === 'Failed' ? 'destructive' : 'secondary'}>
                              {inspection.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{inspection.score || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Safety Training Programs</CardTitle>
                  <CardDescription>Employee training completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainingPrograms.map((program, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{program.name}</span>
                          <Badge variant={program.status === 'Active' ? 'default' : 'secondary'}>
                            {program.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{program.participants} participants</span>
                          <span>{program.completion}% complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${program.completion}%` }} />
                        </div>
                        <p className="text-xs text-gray-500">Next session: {program.nextSession}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inspections">
            <Card>
              <CardHeader>
                <CardTitle>Safety Inspections</CardTitle>
                <CardDescription>Schedule and manage safety inspections</CardDescription>
                <PermissionGuard requiredPermissions={['health.inspections.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Inspection
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Safety inspection management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reporting</CardTitle>
                <CardDescription>Report and track safety incidents</CardDescription>
                <PermissionGuard requiredPermissions={['health.incidents.create']}>
                  <Button>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Incident
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{incident.type}</p>
                        <p className="text-sm text-gray-600">{incident.location} • Reporter: {incident.reporter}</p>
                        <p className="text-xs text-gray-500">{incident.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={incident.severity === 'Major' ? 'destructive' : incident.severity === 'Medium' ? 'default' : 'secondary'}>
                          {incident.severity}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{incident.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Safety Training Management</CardTitle>
                <CardDescription>Organize and track safety training programs</CardDescription>
                <PermissionGuard requiredPermissions={['health.training.manage']}>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Create Training Program
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Training management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environmental">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Health</CardTitle>
                <CardDescription>Monitor environmental health factors</CardDescription>
                <PermissionGuard requiredPermissions={['health.environmental.manage']}>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Environmental Report
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Environmental health monitoring interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};