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
import { MapPin, Plus, Search, Navigation, Clock, Fuel, Route, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export const RouteManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const routes = [
    {
      id: 'RT-001',
      name: 'Downtown Circuit',
      startPoint: 'Main Office',
      endPoint: 'City Center',
      distance: 15.2,
      estimatedTime: 35,
      actualTime: 38,
      fuelConsumption: 2.1,
      status: 'Active',
      frequency: 'Daily',
      assignedVehicle: 'TRK-015',
      driver: 'John Smith',
      efficiency: 92,
      lastOptimized: '2024-01-15'
    },
    {
      id: 'RT-002',
      name: 'Airport Shuttle',
      startPoint: 'Hotel District',
      endPoint: 'International Airport',
      distance: 28.5,
      estimatedTime: 45,
      actualTime: 42,
      fuelConsumption: 3.8,
      status: 'Optimized',
      frequency: 'Hourly',
      assignedVehicle: 'VAN-025',
      driver: 'Lisa Chen',
      efficiency: 96,
      lastOptimized: '2024-01-20'
    },
    {
      id: 'RT-003',
      name: 'Industrial Zone',
      startPoint: 'Warehouse A',
      endPoint: 'Manufacturing Hub',
      distance: 22.8,
      estimatedTime: 40,
      actualTime: 48,
      fuelConsumption: 3.2,
      status: 'Needs Optimization',
      frequency: 'Twice Daily',
      assignedVehicle: 'SUV-018',
      driver: 'Sarah Johnson',
      efficiency: 78,
      lastOptimized: '2023-12-10'
    },
    {
      id: 'RT-004',
      name: 'Residential Pickup',
      startPoint: 'Suburb A',
      endPoint: 'Business District',
      distance: 18.7,
      estimatedTime: 32,
      actualTime: 35,
      fuelConsumption: 2.5,
      status: 'Under Review',
      frequency: 'Peak Hours',
      assignedVehicle: 'SED-032',
      driver: 'Mike Davis',
      efficiency: 88,
      lastOptimized: '2024-01-08'
    }
  ];

  const routeEfficiencyTrends = [
    { month: 'Jan', efficiency: 85, fuelSaved: 12 },
    { month: 'Feb', efficiency: 88, fuelSaved: 18 },
    { month: 'Mar', efficiency: 87, fuelSaved: 15 },
    { month: 'Apr', efficiency: 91, fuelSaved: 22 },
    { month: 'May', efficiency: 89, fuelSaved: 19 },
    { month: 'Jun', efficiency: 93, fuelSaved: 28 },
  ];

  const timeVsDistance = [
    { route: 'Downtown', distance: 15.2, time: 38 },
    { route: 'Airport', distance: 28.5, time: 42 },
    { route: 'Industrial', distance: 22.8, time: 48 },
    { route: 'Residential', distance: 18.7, time: 35 },
    { route: 'Express', distance: 35.2, time: 55 },
    { route: 'Local', distance: 12.3, time: 28 },
  ];

  const trafficPatterns = [
    { hour: '06:00', light: 15, moderate: 25, heavy: 60 },
    { hour: '08:00', light: 10, moderate: 30, heavy: 60 },
    { hour: '10:00', light: 40, moderate: 35, heavy: 25 },
    { hour: '12:00', light: 25, moderate: 40, heavy: 35 },
    { hour: '14:00', light: 35, moderate: 35, heavy: 30 },
    { hour: '16:00', light: 15, moderate: 25, heavy: 60 },
    { hour: '18:00', light: 8, moderate: 22, heavy: 70 },
    { hour: '20:00', light: 55, moderate: 30, heavy: 15 },
  ];

  const routeTypes = [
    { name: 'Urban', value: 35, fill: '#3b82f6' },
    { name: 'Highway', value: 28, fill: '#10b981' },
    { name: 'Mixed', value: 25, fill: '#f59e0b' },
    { name: 'Rural', value: 12, fill: '#8b5cf6' },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'Active': 'success',
      'Optimized': 'secondary',
      'Needs Optimization': 'warning',
      'Under Review': 'outline',
      'Inactive': 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.endPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Route Management</h1>
          <p className="text-muted-foreground">Optimize routes and track performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="route-name">Route Name</Label>
                <Input id="route-name" placeholder="Downtown Circuit" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-point">Start Point</Label>
                  <Input id="start-point" placeholder="Main Office" />
                </div>
                <div>
                  <Label htmlFor="end-point">End Point</Label>
                  <Input id="end-point" placeholder="City Center" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input id="distance" type="number" placeholder="15.2" step="0.1" />
                </div>
                <div>
                  <Label htmlFor="estimated-time">Estimated Time (min)</Label>
                  <Input id="estimated-time" type="number" placeholder="35" />
                </div>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="twice-daily">Twice Daily</SelectItem>
                    <SelectItem value="peak-hours">Peak Hours</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle">Assigned Vehicle</Label>
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
                <Label htmlFor="waypoints">Waypoints/Stops</Label>
                <Textarea id="waypoints" placeholder="List any intermediate stops..." />
              </div>
              <Button className="w-full">Create Route</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> optimized this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+4%</span> improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Savings</CardTitle>
            <Fuel className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128L</div>
            <p className="text-xs text-muted-foreground">Saved this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1.2%</span> from target
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Route Efficiency Trends</CardTitle>
            <CardDescription>Monthly efficiency and fuel savings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={routeEfficiencyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} name="Efficiency %" />
                <Line yAxisId="right" type="monotone" dataKey="fuelSaved" stroke="#3b82f6" strokeWidth={2} name="Fuel Saved (L)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distance vs Time Performance</CardTitle>
            <CardDescription>Route performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeVsDistance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="distance" fill="#3b82f6" name="Distance (km)" />
                <Bar yAxisId="right" dataKey="time" fill="#ef4444" name="Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Types Distribution</CardTitle>
            <CardDescription>Routes by terrain type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={routeTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {routeTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily Traffic Patterns</CardTitle>
            <CardDescription>Traffic density throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="light" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="moderate" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area type="monotone" dataKey="heavy" stackId="1" stroke="#ef4444" fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Directory
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search routes..."
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
                <SelectItem value="Optimized">Optimized</SelectItem>
                <SelectItem value="Needs Optimization">Needs Optimization</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Start → End</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Vehicle/Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {route.startPoint} → {route.endPoint}
                    </div>
                  </TableCell>
                  <TableCell>{route.distance} km</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className={route.actualTime > route.estimatedTime ? 'text-red-600' : 'text-green-600'}>
                      {route.actualTime}min
                    </span>
                    <span className="text-muted-foreground text-xs">
                      (est. {route.estimatedTime}min)
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Fuel className="h-4 w-4" />
                    {route.fuelConsumption}L
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getEfficiencyColor(route.efficiency)}`}>
                      {route.efficiency}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{route.assignedVehicle}</div>
                      <div className="text-muted-foreground">{route.driver}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(route.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Navigation className="h-4 w-4 mr-1" />
                      Optimize
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