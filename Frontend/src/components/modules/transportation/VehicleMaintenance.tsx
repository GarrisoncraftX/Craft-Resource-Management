import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Plus, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { transportationApiService } from '@/services/nodejsbackendapi/transportationApi';
import { MaintenanceFormDialog } from './MaintenanceFuelForms';
import { mockTransportationData } from '@/services/mockData/transportation';
import type { MaintenanceRecord } from '@/types/nodejsbackendapi/transportationTypes';

export const VehicleMaintenance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | undefined>();

  const { data: maintenanceRecords = [], isLoading } = useQuery({
    queryKey: ['maintenance-records'],
    queryFn: () => transportationApiService.getMaintenanceRecords()
  });

  const getTypeBadge = (type: string) => {
    const variants = {
      'routine': 'default',
      'repair': 'secondary',
      'emergency': 'destructive',
      'inspection': 'outline'
    } as const;
    return <Badge variant={variants[type as keyof typeof variants] || 'outline'}>{type}</Badge>;
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Maintenance</h1>
          <p className="text-muted-foreground">Track and manage vehicle maintenance schedules</p>
        </div>
        <Button onClick={() => { setSelectedRecord(undefined); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
        <MaintenanceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} record={selectedRecord} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Types</CardTitle>
            <CardDescription>Monthly breakdown by maintenance category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockTransportationData.maintenanceStats}>
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
                  data={mockTransportationData.costBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="cost"
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                >
                  {mockTransportationData.costBreakdown.map((entry, index) => (
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
              <LineChart data={mockTransportationData.downtimeData}>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.vehicleId}</TableCell>
                  <TableCell>{getTypeBadge(record.maintenanceType)}</TableCell>
                  <TableCell>{record.description}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>${record.cost.toFixed(2)}</TableCell>
                  <TableCell>{record.mileage.toLocaleString()} km</TableCell>
                  <TableCell>{record.performedBy}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedRecord(record); setDialogOpen(true); }}>
                      Edit
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
