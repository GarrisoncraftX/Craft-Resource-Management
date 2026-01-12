import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Plus, Search, Fuel, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { transportationApiService } from '@/services/nodejsbackendapi/transportationApi';
import { VehicleFormDialog } from './VehicleFormDialog';
import { mockTransportationData } from '@/services/mockData/transportation';
import type { Vehicle } from '@/types/nodejsbackendapi/transportationTypes';

export const FleetManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => transportationApiService.getVehicles()
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'maintenance': 'secondary',
      'out_of_service': 'destructive',
      'retired': 'outline'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  const getServiceStatus = (nextService?: string) => {
    if (!nextService) return <Badge variant="outline">Not Scheduled</Badge>;
    const today = new Date();
    const serviceDate = new Date(nextService);
    const daysDiff = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysDiff <= 7) {
      return <Badge variant="secondary">Due Soon</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Management</h1>
          <p className="text-muted-foreground">Manage vehicles, assignments, and utilization</p>
        </div>
        <Button onClick={() => { setSelectedVehicle(undefined); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
        <VehicleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} vehicle={selectedVehicle} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Utilization</CardTitle>
            <CardDescription>Monthly vehicle status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockTransportationData.utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" stackId="a" fill="#10b981" name="Active" />
                <Bar dataKey="maintenance" stackId="a" fill="#f59e0b" name="Maintenance" />
                <Bar dataKey="available" stackId="a" fill="#3b82f6" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Age Distribution</CardTitle>
            <CardDescription>Fleet age breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockTransportationData.vehicleAgeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ age, percent }) => `${age}: ${(percent * 100).toFixed(0)}%`}
                >
                  {mockTransportationData.vehicleAgeDistribution.map((entry, index) => (
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
            <CardTitle>Maintenance Costs</CardTitle>
            <CardDescription>Monthly maintenance expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockTransportationData.maintenanceCosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehicle Fleet
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                  <TableCell>{vehicle.make} {vehicle.model} ({vehicle.year})</TableCell>
                  <TableCell>{vehicle.vehicleType}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Fuel className="h-4 w-4" />
                    {vehicle.fuelType}
                  </TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                  <TableCell>{vehicle.capacity} persons</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{vehicle.nextMaintenanceDate || 'N/A'}</span>
                      {getServiceStatus(vehicle.nextMaintenanceDate)}
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.department}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(vehicle); setDialogOpen(true); }}>
                      <Settings className="h-4 w-4" />
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
