import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, AlertTriangle, CreditCard, Loader2 } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { visitorApiService } from '@/services/pythonbackendapi/visitorApi';
import { securityApiService } from '@/services/javabackendapi/securityApi';
import { mockSecurityIncidents } from '@/services/mockData/security';
import type { Visitor } from '@/types/visitor';
import type { SecurityIncident } from '@/services/javabackendapi/securityApi';

export const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ activeVisitors: 0, alerts: 0, activeCards: 0, accessPoints: 12 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [visitors, incidents] = await Promise.all([
        visitorApiService.getActiveVisitors().catch(() => []),
        securityApiService.getSecurityIncidents().catch(() => mockSecurityIncidents),
      ]);
      setRecentVisitors(visitors.slice(0, 5));
      setSecurityIncidents(incidents.slice(0, 3));
      setStats(prev => ({ ...prev, activeVisitors: visitors.length, alerts: incidents.filter(i => i.status === 'Open').length }));
    } catch (error) {
      console.warn('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Security Management Module</h1>
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
              <div className="text-2xl font-bold">{stats.activeVisitors}</div>
              <p className="text-xs text-muted-foreground">Currently in building</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.alerts}</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active ID Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCards}</div>
              <p className="text-xs text-muted-foreground">2 pending activation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Points</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accessPoints}</div>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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
                          <TableHead>Contact</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentVisitors.map((visitor) => (
                          <TableRow key={visitor.visitor_id}>
                            <TableCell className="font-medium">{visitor.full_name}</TableCell>
                            <TableCell>{visitor.contact_number}</TableCell>
                            <TableCell>{visitor.purpose_of_visit}</TableCell>
                            <TableCell>
                              <Badge variant={visitor.status === 'Checked In' ? 'default' : 'secondary'}>
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
                            <p className="text-sm text-gray-600">{incident.location} - {incident.date}</p>
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
            )}
          </TabsContent>

          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Management</CardTitle>
                <CardDescription>Comprehensive visitor tracking and management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Navigate to Visitor Management section for full functionality.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Access Control Configuration</CardTitle>
                <CardDescription>Manage access permissions and security zones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Navigate to Access Control section for full functionality.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>Security Incidents Reporting</CardTitle>
                <CardDescription>Report and track security incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Navigate to Security Incidents section for full functionality.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards">
            <Card>
              <CardHeader>
                <CardTitle>ID Card Management</CardTitle>
                <CardDescription>Manage employee ID cards and access credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Navigate to ID Card Management section for full functionality.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
