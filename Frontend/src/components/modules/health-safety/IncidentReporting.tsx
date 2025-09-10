import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus, Search, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const IncidentReporting: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const incidents = [
    {
      id: 'INC-001',
      title: 'Slip and Fall Incident',
      type: 'Injury',
      severity: 'Minor',
      location: 'Manufacturing Floor',
      reportedBy: 'John Smith',
      reportedDate: '2024-01-15',
      status: 'Under Investigation',
      assignedTo: 'Safety Officer',
      description: 'Employee slipped on wet floor near workstation 5'
    },
    {
      id: 'INC-002',
      title: 'Chemical Spill',
      type: 'Environmental',
      severity: 'Major',
      location: 'Laboratory',
      reportedBy: 'Lisa Chen',
      reportedDate: '2024-01-12',
      status: 'Resolved',
      assignedTo: 'Environmental Team',
      description: 'Small chemical spill contained and cleaned'
    },
    {
      id: 'INC-003',
      title: 'Equipment Malfunction',
      type: 'Equipment',
      severity: 'Critical',
      location: 'Production Line A',
      reportedBy: 'Mike Davis',
      reportedDate: '2024-01-18',
      status: 'Open',
      assignedTo: 'Maintenance Team',
      description: 'Press machine safety guard failure'
    },
    {
      id: 'INC-004',
      title: 'Near Miss - Falling Object',
      type: 'Near Miss',
      severity: 'Minor',
      location: 'Warehouse',
      reportedBy: 'Sarah Johnson',
      reportedDate: '2024-01-20',
      status: 'Closed',
      assignedTo: 'Warehouse Manager',
      description: 'Box fell from shelf, no injuries'
    }
  ];

  const monthlyTrends = [
    { month: 'Jan', incidents: 8, resolved: 6 },
    { month: 'Feb', incidents: 12, resolved: 10 },
    { month: 'Mar', incidents: 6, resolved: 5 },
    { month: 'Apr', incidents: 9, resolved: 8 },
    { month: 'May', incidents: 4, resolved: 4 },
    { month: 'Jun', incidents: 7, resolved: 5 },
  ];

  const severityData = [
    { name: 'Minor', value: 45, fill: '#10b981' },
    { name: 'Major', value: 30, fill: '#f59e0b' },
    { name: 'Critical', value: 15, fill: '#ef4444' },
    { name: 'Near Miss', value: 25, fill: '#3b82f6' },
  ];

  const typeDistribution = [
    { type: 'Injury', count: 15 },
    { type: 'Environmental', count: 8 },
    { type: 'Equipment', count: 12 },
    { type: 'Near Miss', count: 20 },
    { type: 'Security', count: 5 },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'Open': 'destructive',
      'Under Investigation': 'warning',
      'Resolved': 'success',
      'Closed': 'outline'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      'Minor': 'success',
      'Major': 'warning',
      'Critical': 'destructive'
    } as const;
    return <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>{severity}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'Open':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incident Reporting</h1>
          <p className="text-muted-foreground">Track and manage safety incidents</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="incident-title">Incident Title</Label>
                <Input id="incident-title" placeholder="Brief incident description" />
              </div>
              <div>
                <Label htmlFor="incident-type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="injury">Injury</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="near-miss">Near Miss</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Incident location" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Detailed incident description..." />
              </div>
              <div>
                <Label htmlFor="immediate-action">Immediate Action Taken</Label>
                <Textarea id="immediate-action" placeholder="Actions taken immediately..." />
              </div>
              <Button className="w-full">Report Incident</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Incident Trends</CardTitle>
            <CardDescription>Incidents reported vs resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Incidents by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incident Types</CardTitle>
            <CardDescription>Distribution by incident category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Incident Records
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Minor">Minor</SelectItem>
                <SelectItem value="Major">Major</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.id}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getStatusIcon(incident.status)}
                    {incident.title}
                  </TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell>{incident.location}</TableCell>
                  <TableCell>{incident.reportedBy}</TableCell>
                  <TableCell>{incident.reportedDate}</TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};