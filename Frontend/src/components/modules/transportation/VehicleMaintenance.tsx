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
import { Settings, Plus, Search, Calendar, Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const VehicleMaintenance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const maintenanceRecords = [
    {
      id: 'MNT-001',
      vehicleId: 'TRK-015',
      type: 'Preventive',
      service: 'Oil Change & Filter',
      scheduledDate: '2024-01-25',
      completedDate: '2024-01-24',
      status: 'Completed',
      cost: 150,
      mileage: 45000,
      technician: 'Mike Johnson',
      priority: 'Medium',
      notes: 'Routine maintenance completed successfully'
    },
    {
      id: 'MNT-002',
      vehicleId: 'SED-032',
      type: 'Corrective',
      service: 'Brake Pad Replacement',
      scheduledDate: '2024-01-22',
      completedDate: null,
      status: 'In Progress',
      cost: 280,
      mileage: 28000,
      technician: 'Sarah Davis',
      priority: 'High',
      notes: 'Brake pads worn beyond safe limits'
    },
    {
      id: 'MNT-003',
      vehicleId: 'SUV-018',
      type: 'Inspection',
      service: 'Annual Safety Inspection',
      scheduledDate: '2024-01-30',
      completedDate: null,
      status: 'Scheduled',
      cost: 95,
      mileage: 52000,
      technician: 'Tom Wilson',
      priority: 'Low',
      notes: 'Yearly safety compliance check'
    },
    {
      id: 'MNT-004',
      vehicleId: 'VAN-025',
      type: 'Emergency',
      service: 'Engine Diagnostics',
      scheduledDate: '2024-01-20',
      completedDate: null,
      status: 'Overdue',
      cost: 450,
      mileage: 78000,
      technician: 'Alex Brown',
      priority: 'Critical',
      notes: 'Engine warning light activated'
    }
  ];

  const maintenanceStats = [
    { month: 'Jan', preventive: 8, corrective: 4, emergency: 2 },
    { month: 'Feb', preventive: 10, corrective: 3, emergency: 1 },
    { month: 'Mar', preventive: 12, corrective: 5, emergency: 3 },
    { month: 'Apr', preventive: 9, corrective: 2, emergency: 1 },
    { month: 'May', preventive: 11, corrective: 4, emergency: 2 },
    { month: 'Jun', preventive: 13, corrective: 3, emergency: 1 },
  ];

  const costBreakdown = [
    { type: 'Preventive', cost: 12500, fill: '#10b981' },
    { type: 'Corrective', cost: 8900, fill: '#f59e0b' },
    { type: 'Emergency', cost: 15200, fill: '#ef4444' },
    { type: 'Inspection', cost: 3400, fill: '#3b82f6' },
  ];

  const downtimeData = [
    { month: 'Jan', planned: 48, unplanned: 12 },
    { month: 'Feb', planned: 36, unplanned: 8 },
    { month: 'Mar', planned: 60, unplanned: 18 },
    { month: 'Apr', planned: 42, unplanned: 6 },
    { month: 'May', planned: 54, unplanned: 14 },
    { month: 'Jun', planned: 39, unplanned: 9 },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'Completed': 'success',
      'In Progress': 'warning',
      'Scheduled': 'secondary',
      'Overdue': 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'Low': 'outline',
      'Medium': 'secondary',
      'High': 'warning',
      'Critical': 'destructive'
    } as const;
    return <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>{priority}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Maintenance</h1>
          <p className="text-muted-foreground">Track and manage vehicle maintenance schedules</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRK-015">TRK-015 - Ford Transit</SelectItem>
                    <SelectItem value="SED-032">SED-032 - Toyota Camry</SelectItem>
                    <SelectItem value="SUV-018">SUV-018 - Honda CR-V</SelectItem>
                    <SelectItem value="VAN-025">VAN-025 - Mercedes Sprinter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maintenance-type">Maintenance Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service">Service Description</Label>
                <Input id="service" placeholder="Oil change, brake service, etc." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Scheduled Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="technician">Assigned Technician</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mike">Mike Johnson</SelectItem>
                    <SelectItem value="sarah">Sarah Davis</SelectItem>
                    <SelectItem value="tom">Tom Wilson</SelectItem>
                    <SelectItem value="alex">Alex Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimated-cost">Estimated Cost</Label>
                <Input id="estimated-cost" type="number" placeholder="0.00" step="0.01" />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional maintenance notes..." />
              </div>
              <Button className="w-full">Schedule Maintenance</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Types</CardTitle>
            <CardDescription>Monthly breakdown by maintenance category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={maintenanceStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="preventive" fill="#10b981" name="Preventive" />
                <Bar dataKey="corrective" fill="#f59e0b" name="Corrective" />
                <Bar dataKey="emergency" fill="#ef4444" name="Emergency" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Maintenance costs by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="cost"
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Downtime</CardTitle>
            <CardDescription>Planned vs unplanned downtime hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={downtimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} name="Planned" />
                <Line type="monotone" dataKey="unplanned" stroke="#ef4444" strokeWidth={2} name="Unplanned" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Maintenance Records
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search maintenance records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.vehicleId}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    {record.service}
                  </TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{getPriorityBadge(record.priority)}</TableCell>
                  <TableCell>{record.scheduledDate}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>${record.cost}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Wrench className="h-4 w-4" />
                    {record.technician}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View Details</Button>
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