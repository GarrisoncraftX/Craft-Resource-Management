import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Car, Truck, Fuel, Wrench, Users, MapPin, AlertTriangle, TrendingUp, Calendar, Clock } from 'lucide-react';

export const TransportationDashboard: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [routeDialog, setRouteDialog] = useState(false);

  // Mock data for charts
  const fuelConsumptionData = [
    { month: 'Jan', consumption: 2400, cost: 3600 },
    { month: 'Feb', consumption: 2210, cost: 3315 },
    { month: 'Mar', consumption: 2290, cost: 3435 },
    { month: 'Apr', consumption: 2000, cost: 3000 },
    { month: 'May', consumption: 2181, cost: 3272 },
    { month: 'Jun', consumption: 2500, cost: 3750 }
  ];

  const vehicleStatusData = [
    { name: 'Available', value: 45, color: 'hsl(var(--chart-1))' },
    { name: 'In Use', value: 25, color: 'hsl(var(--chart-2))' },
    { name: 'Maintenance', value: 8, color: 'hsl(var(--chart-3))' },
    { name: 'Out of Service', value: 3, color: 'hsl(var(--chart-4))' }
  ];

  const maintenanceScheduleData = [
    { week: 'Week 1', scheduled: 12, completed: 10, overdue: 2 },
    { week: 'Week 2', scheduled: 15, completed: 13, overdue: 1 },
    { week: 'Week 3', scheduled: 18, completed: 16, overdue: 3 },
    { week: 'Week 4', scheduled: 14, completed: 12, overdue: 1 }
  ];

  const chartConfig = {
    consumption: { label: 'Fuel Consumption (L)', color: 'hsl(var(--chart-1))' },
    cost: { label: 'Fuel Cost ($)', color: 'hsl(var(--chart-2))' },
    scheduled: { label: 'Scheduled', color: 'hsl(var(--chart-1))' },
    completed: { label: 'Completed', color: 'hsl(var(--chart-2))' },
    overdue: { label: 'Overdue', color: 'hsl(var(--chart-3))' }
  };

  // Mock fleet data
  const fleetData = [
    { id: 'VH001', type: 'Sedan', make: 'Toyota', model: 'Camry', year: 2022, status: 'Available', driver: 'John Doe', mileage: 45000, lastService: '2024-06-15' },
    { id: 'VH002', type: 'SUV', make: 'Ford', model: 'Explorer', year: 2021, status: 'In Use', driver: 'Jane Smith', mileage: 62000, lastService: '2024-06-20' },
    { id: 'VH003', type: 'Truck', make: 'Chevrolet', model: 'Silverado', year: 2023, status: 'Maintenance', driver: 'Mike Johnson', mileage: 28000, lastService: '2024-05-30' },
    { id: 'VH004', type: 'Van', make: 'Mercedes', model: 'Sprinter', year: 2022, status: 'Available', driver: 'Sarah Wilson', mileage: 51000, lastService: '2024-06-10' }
  ];

  const driverData = [
    { id: 'DR001', name: 'John Doe', license: 'DL123456789', status: 'Active', rating: 4.8, violations: 0, assignedVehicle: 'VH001' },
    { id: 'DR002', name: 'Jane Smith', license: 'DL987654321', status: 'Active', rating: 4.9, violations: 1, assignedVehicle: 'VH002' },
    { id: 'DR003', name: 'Mike Johnson', license: 'DL456789123', status: 'On Leave', rating: 4.6, violations: 0, assignedVehicle: 'VH003' },
    { id: 'DR004', name: 'Sarah Wilson', license: 'DL321654987', status: 'Active', rating: 4.7, violations: 2, assignedVehicle: 'VH004' }
  ];

  const routeData = [
    { id: 'RT001', name: 'City Center Route', distance: '25 km', estimatedTime: '45 min', status: 'Active', vehicles: 3 },
    { id: 'RT002', name: 'Airport Shuttle', distance: '35 km', estimatedTime: '60 min', status: 'Active', vehicles: 2 },
    { id: 'RT003', name: 'Industrial Zone', distance: '42 km', estimatedTime: '75 min', status: 'Under Review', vehicles: 4 },
    { id: 'RT004', name: 'Suburban Circuit', distance: '28 km', estimatedTime: '50 min', status: 'Active', vehicles: 2 }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Available': 'default',
      'In Use': 'secondary',
      'Maintenance': 'destructive',
      'Out of Service': 'outline',
      'Active': 'default',
      'On Leave': 'secondary',
      'Under Review': 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transportation Management</h1>
            <p className="text-muted-foreground">Manage fleet, drivers, routes, and maintenance operations</p>
          </div>
          <div className="flex gap-2">
            <PermissionGuard requiredPermissions={['transportation.create']}>
              <Dialog open={routeDialog} onOpenChange={setRouteDialog}>
                <DialogTrigger asChild>
                  <Button><MapPin className="mr-2 h-4 w-4" />Plan Route</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Plan New Route</DialogTitle>
                    <DialogDescription>Create a new transportation route</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="routeName">Route Name</Label>
                      <Input id="routeName" placeholder="Enter route name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startLocation">Start Location</Label>
                        <Input id="startLocation" placeholder="Starting point" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endLocation">End Location</Label>
                        <Input id="endLocation" placeholder="Destination" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estimatedDistance">Distance (km)</Label>
                        <Input id="estimatedDistance" type="number" placeholder="25" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedTime">Estimated Time</Label>
                        <Input id="estimatedTime" placeholder="45 min" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routeNotes">Route Notes</Label>
                      <Textarea id="routeNotes" placeholder="Special instructions or notes" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1">Create Route</Button>
                      <Button variant="outline" onClick={() => setRouteDialog(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </PermissionGuard>
            <PermissionGuard requiredPermissions={['transportation.maintenance']}>
              <Dialog open={maintenanceDialog} onOpenChange={setMaintenanceDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Wrench className="mr-2 h-4 w-4" />Schedule Maintenance</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Schedule Vehicle Maintenance</DialogTitle>
                    <DialogDescription>Schedule maintenance for a vehicle</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleSelect">Select Vehicle</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {fleetData.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.id} - {vehicle.make} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceType">Maintenance Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine Service</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="inspection">Safety Inspection</SelectItem>
                          <SelectItem value="emergency">Emergency Repair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                        <Input id="scheduledDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimatedCost">Estimated Cost</Label>
                        <Input id="estimatedCost" type="number" placeholder="500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maintenanceNotes">Notes</Label>
                      <Textarea id="maintenanceNotes" placeholder="Describe the maintenance needed" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1">Schedule Maintenance</Button>
                      <Button variant="outline" onClick={() => setMaintenanceDialog(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </PermissionGuard>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">81</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">64</div>
              <p className="text-xs text-muted-foreground">3 on leave</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fuel Cost (Month)</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3,750</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">2 overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Consumption & Cost Trends</CardTitle>
              <CardDescription>Monthly fuel usage and associated costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fuelConsumptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line yAxisId="left" type="monotone" dataKey="consumption" stroke="var(--color-consumption)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status Distribution</CardTitle>
              <CardDescription>Current status of all fleet vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="fleet" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="fleet">Fleet Management</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="drivers">Driver Management</TabsTrigger>
            <TabsTrigger value="routes">Route Planning</TabsTrigger>
            <TabsTrigger value="fuel">Fuel Management</TabsTrigger>
          </TabsList>

          <TabsContent value="fleet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Overview</CardTitle>
                <CardDescription>Manage your vehicle fleet and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input placeholder="Search vehicles..." className="max-w-sm" />
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vehicles</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Make/Model</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Driver</TableHead>
                        <TableHead>Mileage</TableHead>
                        <TableHead>Last Service</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fleetData.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.id}</TableCell>
                          <TableCell>{vehicle.type}</TableCell>
                          <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                          <TableCell>{vehicle.year}</TableCell>
                          <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                          <TableCell>{vehicle.driver}</TableCell>
                          <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                          <TableCell>{vehicle.lastService}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Edit</Button>
                              <PermissionGuard requiredPermissions={['transportation.maintenance']}>
                                <Button size="sm" variant="outline">Service</Button>
                              </PermissionGuard>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Track and manage vehicle maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maintenanceScheduleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="scheduled" fill="var(--color-scheduled)" />
                      <Bar dataKey="completed" fill="var(--color-completed)" />
                      <Bar dataKey="overdue" fill="var(--color-overdue)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Management</CardTitle>
                <CardDescription>Manage driver profiles, licenses, and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input placeholder="Search drivers..." className="max-w-sm" />
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Drivers</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>License Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Violations</TableHead>
                        <TableHead>Assigned Vehicle</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {driverData.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">{driver.id}</TableCell>
                          <TableCell>{driver.name}</TableCell>
                          <TableCell>{driver.license}</TableCell>
                          <TableCell>{getStatusBadge(driver.status)}</TableCell>
                          <TableCell>⭐ {driver.rating}</TableCell>
                          <TableCell>
                            <Badge variant={driver.violations === 0 ? 'default' : 'destructive'}>
                              {driver.violations}
                            </Badge>
                          </TableCell>
                          <TableCell>{driver.assignedVehicle}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Planning</CardTitle>
                <CardDescription>Optimize transportation routes and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input placeholder="Search routes..." className="max-w-sm" />
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Routes</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="under-review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route ID</TableHead>
                        <TableHead>Route Name</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Estimated Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Vehicles</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routeData.map((route) => (
                        <TableRow key={route.id}>
                          <TableCell className="font-medium">{route.id}</TableCell>
                          <TableCell>{route.name}</TableCell>
                          <TableCell>{route.distance}</TableCell>
                          <TableCell>{route.estimatedTime}</TableCell>
                          <TableCell>{getStatusBadge(route.status)}</TableCell>
                          <TableCell>{route.vehicles} vehicles</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="outline">Optimize</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fuel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fuel Management</CardTitle>
                <CardDescription>Monitor fuel consumption, costs, and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Consumption</p>
                          <p className="text-2xl font-bold">2,500L</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Efficiency</p>
                          <p className="text-2xl font-bold">8.5L/100km</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Cost per KM</p>
                          <p className="text-2xl font-bold">$0.15</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};