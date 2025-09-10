import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Lock, Users, Activity, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const securityThreats = [
  { date: '2024-01', threats: 45, blocked: 42, severity: 'Medium' },
  { date: '2024-02', threats: 38, blocked: 35, severity: 'Low' },
  { date: '2024-03', threats: 62, blocked: 58, severity: 'High' },
  { date: '2024-04', threats: 29, blocked: 28, severity: 'Low' },
  { date: '2024-05', threats: 51, blocked: 48, severity: 'Medium' },
  { date: '2024-06', threats: 73, blocked: 68, severity: 'High' }
];

const accessAttempts = [
  { time: '00:00', successful: 12, failed: 3 },
  { time: '04:00', successful: 8, failed: 1 },
  { time: '08:00', successful: 45, failed: 12 },
  { time: '12:00', successful: 38, failed: 8 },
  { time: '16:00', successful: 42, failed: 15 },
  { time: '20:00', successful: 25, failed: 6 }
];

const threatTypes = [
  { name: 'Malware', value: 35, color: '#ef4444' },
  { name: 'Phishing', value: 28, color: '#f97316' },
  { name: 'DDoS', value: 20, color: '#eab308' },
  { name: 'Brute Force', value: 17, color: '#22c55e' }
];

const mockSecurityEvents = [
  {
    id: 1,
    type: 'Failed Login',
    user: 'unknown@attacker.com',
    timestamp: '2024-01-15 14:30:22',
    severity: 'High',
    status: 'Blocked',
    ip: '192.168.1.100'
  },
  {
    id: 2,
    type: 'Privilege Escalation',
    user: 'john.doe@company.com',
    timestamp: '2024-01-15 13:45:15',
    severity: 'Critical',
    status: 'Investigating',
    ip: '192.168.1.45'
  },
  {
    id: 3,
    type: 'Suspicious Activity',
    user: 'jane.smith@company.com',
    timestamp: '2024-01-15 12:20:08',
    severity: 'Medium',
    status: 'Resolved',
    ip: '192.168.1.78'
  }
];

export const Security: React.FC = () => {
  const [settings, setSettings] = useState({
    autoBlock: true,
    emailAlerts: true,
    smsAlerts: false,
    lockoutThreshold: '5',
    sessionTimeout: '30'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = mockSecurityEvents.filter(event =>
    event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.ip.includes(searchTerm)
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Management</h1>
            <p className="text-muted-foreground">Monitor and manage system security</p>
          </div>
          <Button className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Run Security Scan
          </Button>
        </div>

        {/* Security Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-red-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
              <AlertTriangle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs opacity-80">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked Attacks</CardTitle>
              <Shield className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs opacity-80">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs opacity-80">Currently online</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Activity className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs opacity-80">Good security level</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="threats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
            <TabsTrigger value="access">Access Monitoring</TabsTrigger>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Threats Over Time</CardTitle>
                  <CardDescription>Monthly threat detection and blocking statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={securityThreats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="threats" fill="hsl(var(--destructive))" />
                      <Bar dataKey="blocked" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Threat Types Distribution</CardTitle>
                  <CardDescription>Breakdown of different threat categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={threatTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {threatTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Attempts Analysis</CardTitle>
                <CardDescription>Hourly breakdown of login attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={accessAttempts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="successful" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Event Search</CardTitle>
                <CardDescription>Search and filter security events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events by type, user, or IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security incidents and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.type}</TableCell>
                        <TableCell>{event.user}</TableCell>
                        <TableCell>{event.ip}</TableCell>
                        <TableCell>{event.timestamp}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>Configure security policies and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBlock">Auto-block Threats</Label>
                    <p className="text-sm text-muted-foreground">Automatically block detected threats</p>
                  </div>
                  <Switch
                    id="autoBlock"
                    checked={settings.autoBlock}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBlock: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailAlerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send security alerts via email</p>
                  </div>
                  <Switch
                    id="emailAlerts"
                    checked={settings.emailAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailAlerts: checked }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lockoutThreshold">Lockout Threshold</Label>
                    <Input
                      id="lockoutThreshold"
                      type="number"
                      value={settings.lockoutThreshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, lockoutThreshold: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};