import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Plus, Search, MapPin, Calendar, Fuel, Settings, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const FleetManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const vehicles = [
    {
      id: 'VH-001',
      vehicleNumber: 'TRK-015',
      type: 'Truck',
      make: 'Ford',
      model: 'Transit',
      year: 2022,
      status: 'Active',
      driver: 'John Smith',
      mileage: 45000,
      lastService: '2024-01-10',
      nextService: '2024-04-10',
      fuelEfficiency: 12.5,
      location: 'Warehouse A'
    },
    {
      id: 'VH-002',
      vehicleNumber: 'SED-032',
      type: 'Sedan',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      status: 'Maintenance',
      driver: 'Unassigned',
      mileage: 28000,
      lastService: '2024-01-15',
      nextService: '2024-02-15',
      fuelEfficiency: 8.2,
      location: 'Service Center'
    },
    {
      id: 'VH-003',
      vehicleNumber: 'SUV-018',
      type: 'SUV',
      make: 'Honda',
      model: 'CR-V',
      year: 2021,
      status: 'Available',
      driver: 'Sarah Johnson',
      mileage: 52000,
      lastService: '2024-01-08',
      nextService: '2024-03-08',
      fuelEfficiency: 10.1,
      location: 'Main Office'
    },
    {
      id: 'VH-004',
      vehicleNumber: 'VAN-025',
      type: 'Van',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2020,
      status: 'Out of Service',
      driver: 'Unassigned',
      mileage: 78000,
      lastService: '2024-01-12',
      nextService: '2024-01-25',
      fuelEfficiency: 15.8,
      location: 'Repair Shop'
    }
  ];

  const utilizationData = [
    { month: 'Jan', active: 42, maintenance: 4, available: 2 },
    { month: 'Feb', active: 45, maintenance: 2, available: 1 },
    { month: 'Mar', active: 43, maintenance: 3, available: 2 },
    { month: 'Apr', active: 46, maintenance: 1, available: 1 },
    { month: 'May', active: 44, maintenance: 3, available: 1 },
    { month: 'Jun', active: 47, maintenance: 1, available: 0 },
  ];

  const vehicleAgeDistribution = [
    { age: '0-2 years', count: 18, fill: '#10b981' },
    { age: '2-5 years', count: 22, fill: '#3b82f6' },
    { age: '5-8 years', count: 6, fill: '#f59e0b' },
    { age: '8+ years', count: 2, fill: '#ef4444' },
  ];

  const maintenanceCosts = [
    { month: 'Jan', cost: 12500 },
    { month: 'Feb', cost: 8900 },
    { month: 'Mar', cost: 15200 },
    { month: 'Apr', cost: 6700 },
    { month: 'May', cost: 11800 },
    { month: 'Jun', cost: 9200 },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'Active': 'success',
      'Available': 'secondary',
      'Maintenance': 'warning',
      'Out of Service': 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getServiceStatus = (nextService: string) => {
    const today = new Date();
    const serviceDate = new Date(nextService);
    const daysDiff = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysDiff <= 7) {
      return <Badge variant="warning">Due Soon</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.driver && vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Management</h1>
          <p className="text-muted-foreground">Manage vehicles, assignments, and utilization</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicle-number">Vehicle Number</Label>
                <Input id="vehicle-number" placeholder="TRK-001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" placeholder="Ford" />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="Transit" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="2024" />
                </div>
                <div>
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="vin">VIN Number</Label>
                <Input id="vin" placeholder="Vehicle identification number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Current Mileage</Label>
                  <Input id="mileage" type="number" placeholder="25000" />
                </div>
                <div>
                  <Label htmlFor="fuel-type">Fuel Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">Add Vehicle</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Utilization</CardTitle>
            <CardDescription>Monthly vehicle status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={utilizationData}>
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
                  data={vehicleAgeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ age, percent }) => `${age}: ${(percent * 100).toFixed(0)}%`}
                >
                  {vehicleAgeDistribution.map((entry, index) => (
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
              <LineChart data={maintenanceCosts}>
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Out of Service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Fuel Efficiency</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.vehicleNumber}</TableCell>
                  <TableCell>{vehicle.make} {vehicle.model} ({vehicle.year})</TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell>{vehicle.driver || 'Unassigned'}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Fuel className="h-4 w-4" />
                    {vehicle.fuelEfficiency}L/100km
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{vehicle.nextService}</span>
                      {getServiceStatus(vehicle.nextService)}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {vehicle.location}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
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