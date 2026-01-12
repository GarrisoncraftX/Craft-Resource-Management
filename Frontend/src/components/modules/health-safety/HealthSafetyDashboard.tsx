import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, Users, ClipboardList, Plus, FileText } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { healthSafetyApiService } from '@/services/pythonbackendapi/healthSafetyApi';
import type { IncidentReport, SafetyInspection, TrainingSession } from '@/services/mockData/health-safety';
import { useNavigate } from 'react-router-dom';

export const HealthSafetyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [inspections, setInspections] = useState<SafetyInspection[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [incidentsData, inspectionsData, trainingData] = await Promise.all([
      healthSafetyApiService.getIncidents(),
      healthSafetyApiService.getInspections(),
      healthSafetyApiService.getTrainingSessions()
    ]);
    setIncidents(incidentsData);
    setInspections(inspectionsData);
    setTrainingSessions(trainingData);
  };

  const healthSafetyMetrics = {
    totalInspections: inspections.length,
    incidentRate: incidents.length * 0.5,
    trainingCompletion: trainingSessions.reduce((acc, t) => acc + t.completionRate, 0) / (trainingSessions.length || 1),
    complianceScore: 94
  };

  const incidentsByType = [
    { type: 'Injury', count: incidents.filter(i => i.type === 'Injury').length, fill: '#ef4444' },
    { type: 'Environmental', count: incidents.filter(i => i.type === 'Environmental').length, fill: '#10b981' },
    { type: 'Equipment', count: incidents.filter(i => i.type === 'Equipment').length, fill: '#f59e0b' },
    { type: 'Near Miss', count: incidents.filter(i => i.type === 'Near Miss').length, fill: '#3b82f6' }
  ];

  const inspectionTrends = [
    { month: 'Jan', passed: 12, failed: 2 },
    { month: 'Feb', passed: 15, failed: 1 },
    { month: 'Mar', passed: 14, failed: 3 },
    { month: 'Apr', passed: 18, failed: 1 },
    { month: 'May', passed: 16, failed: 2 },
    { month: 'Jun', passed: 19, failed: 1 }
  ];

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
                      {inspections.slice(0, 3).map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell className="font-medium">{inspection.location}</TableCell>
                          <TableCell>{inspection.type}</TableCell>
                          <TableCell>{inspection.scheduledDate}</TableCell>
                          <TableCell>
                            <Badge variant={inspection.status === 'Completed' ? 'default' : inspection.status === 'Failed' ? 'destructive' : 'secondary'}>
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
                    {trainingSessions.slice(0, 3).map((program) => (
                      <div key={program.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{program.title}</span>
                          <Badge variant={program.status === 'Completed' ? 'default' : 'secondary'}>
                            {program.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{program.enrolled} participants</span>
                          <span>{program.completionRate}% complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${program.completionRate}%` }} />
                        </div>
                        <p className="text-xs text-gray-500">Next session: {program.scheduledDate}</p>
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
                  <Button onClick={() => navigate('/health-safety/inspections')}>
                    <Plus className="h-4 w-4 mr-2" />
                    View All Inspections
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inspectionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="passed" stroke="#10b981" strokeWidth={2} name="Passed" />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reporting</CardTitle>
                <CardDescription>Report and track safety incidents</CardDescription>
                <PermissionGuard requiredPermissions={['health.incidents.create']}>
                  <Button onClick={() => navigate('/health-safety/incidents')}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View All Incidents
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incidentsByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {incidentsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Safety Training Management</CardTitle>
                <CardDescription>Organize and track safety training programs</CardDescription>
                <PermissionGuard requiredPermissions={['health.training.manage']}>
                  <Button onClick={() => navigate('/health-safety/training')}>
                    <Users className="h-4 w-4 mr-2" />
                    View All Training
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingSessions.slice(0, 3).map((program) => (
                    <div key={program.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{program.title}</span>
                        <Badge variant={program.status === 'Completed' ? 'default' : 'secondary'}>
                          {program.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{program.enrolled} participants</span>
                        <span>{program.completionRate}% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${program.completionRate}%` }} />
                      </div>
                      <p className="text-xs text-gray-500">Next session: {program.scheduledDate}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environmental">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Health</CardTitle>
                <CardDescription>Monitor environmental health factors</CardDescription>
                <PermissionGuard requiredPermissions={['health.environmental.manage']}>
                  <Button onClick={() => navigate('/health-safety/environmental')}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Environmental Data
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { parameter: 'Air Quality', value: 95 },
                    { parameter: 'Noise Control', value: 88 },
                    { parameter: 'Temperature', value: 92 },
                    { parameter: 'Humidity', value: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="parameter" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};