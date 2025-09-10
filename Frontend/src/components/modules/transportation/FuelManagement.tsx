import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fuel, Plus, Search, TrendingDown, TrendingUp, Zap, DollarSign, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export const FuelManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fuelRecords = [
    {
      id: 'FUEL-001',
      vehicleId: 'TRK-015',
      driver: 'John Smith',
      date: '2024-01-22',
      station: 'Shell Downtown',
      fuelType: 'Diesel',
      quantity: 45.2,
      pricePerLiter: 1.45,
      totalCost: 65.54,
      mileage: 45000,
      efficiency: 12.5,
      location: 'Downtown Station'
    },
    {
      id: 'FUEL-002',
      vehicleId: 'SED-032',
      driver: 'Sarah Johnson',
      date: '2024-01-21',
      station: 'BP Express',
      fuelType: 'Gasoline',
      quantity: 32.8,
      pricePerLiter: 1.38,
      totalCost: 45.26,
      mileage: 28000,
      efficiency: 8.2,
      location: 'Highway Station'
    },
    {
      id: 'FUEL-003',
      vehicleId: 'SUV-018',
      driver: 'Mike Davis',
      date: '2024-01-20',
      station: 'Petro Canada',
      fuelType: 'Gasoline',
      quantity: 38.5,
      pricePerLiter: 1.42,
      totalCost: 54.67,
      mileage: 52000,
      efficiency: 10.1,
      location: 'Industrial Area'
    },
    {
      id: 'FUEL-004',
      vehicleId: 'VAN-025',
      driver: 'Lisa Chen',
      date: '2024-01-19',
      station: 'Esso',
      fuelType: 'Diesel',
      quantity: 58.3,
      pricePerLiter: 1.47,
      totalCost: 85.70,
      mileage: 78000,
      efficiency: 15.8,
      location: 'Main Highway'
    }
  ];

  const monthlyConsumption = [
    { month: 'Jan', diesel: 1250, gasoline: 890, cost: 3150 },
    { month: 'Feb', diesel: 1180, gasoline: 820, cost: 2890 },
    { month: 'Mar', diesel: 1320, gasoline: 950, cost: 3420 },
    { month: 'Apr', diesel: 1090, gasoline: 780, cost: 2650 },
    { month: 'May', diesel: 1240, gasoline: 860, cost: 3080 },
    { month: 'Jun', diesel: 1150, gasoline: 800, cost: 2850 },
  ];

  const fuelEfficiencyTrends = [
    { month: 'Jan', avgEfficiency: 11.2, target: 12.0 },
    { month: 'Feb', avgEfficiency: 11.8, target: 12.0 },
    { month: 'Mar', avgEfficiency: 11.5, target: 12.0 },
    { month: 'Apr', avgEfficiency: 12.1, target: 12.0 },
    { month: 'May', avgEfficiency: 12.3, target: 12.0 },
    { month: 'Jun', avgEfficiency: 12.5, target: 12.0 },
  ];

  const stationUsage = [
    { station: 'Shell Downtown', usage: 32, fill: '#ef4444' },
    { station: 'BP Express', usage: 28, fill: '#10b981' },
    { station: 'Petro Canada', usage: 24, fill: '#3b82f6' },
    { station: 'Esso', usage: 16, fill: '#f59e0b' },
  ];

  const costBreakdown = [
    { category: 'Fuel', amount: 18500 },
    { category: 'Service Charges', amount: 750 },
    { category: 'Card Fees', amount: 240 },
    { category: 'Environmental Fees', amount: 180 },
  ];

  const getFuelTypeBadge = (type: string) => {
    const variants = {
      'Diesel': 'warning',
      'Gasoline': 'secondary',
      'Electric': 'success',
      'Hybrid': 'outline'
    } as const;
    return <Badge variant={variants[type as keyof typeof variants] || 'outline'}>{type}</Badge>;
  };

  const getEfficiencyColor = (efficiency: number, target: number = 12.0) => {
    if (efficiency >= target) return 'text-green-600';
    if (efficiency >= target * 0.9) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredRecords = fuelRecords.filter(record => {
    const matchesSearch = record.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.station.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || record.fuelType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fuel Management</h1>
          <p className="text-muted-foreground">Track fuel consumption, costs, and efficiency</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fuel Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Fuel Record</DialogTitle>
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
                <Label htmlFor="driver">Driver</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Smith</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="mike">Mike Davis</SelectItem>
                    <SelectItem value="lisa">Lisa Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div>
                  <Label htmlFor="fuel-type">Fuel Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="station">Gas Station</Label>
                <Input id="station" placeholder="Shell Downtown" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity (L)</Label>
                  <Input id="quantity" type="number" placeholder="45.2" step="0.1" />
                </div>
                <div>
                  <Label htmlFor="price">Price/Liter ($)</Label>
                  <Input id="price" type="number" placeholder="1.45" step="0.01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Current Mileage</Label>
                  <Input id="mileage" type="number" placeholder="45000" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Downtown Station" />
                </div>
              </div>
              <Button className="w-full">Add Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Fuel Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,150</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+8.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5L</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.3L</span> improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <Fuel className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,950L</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per KM</CardTitle>
            <BarChart3 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.18</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-$0.02</span> reduction
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fuel Consumption</CardTitle>
            <CardDescription>Diesel vs gasoline consumption and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyConsumption}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area yAxisId="left" type="monotone" dataKey="diesel" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area yAxisId="left" type="monotone" dataKey="gasoline" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuel Efficiency Trends</CardTitle>
            <CardDescription>Average efficiency vs target performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fuelEfficiencyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgEfficiency" stroke="#10b981" strokeWidth={3} name="Actual Efficiency" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gas Station Usage</CardTitle>
            <CardDescription>Distribution of fuel purchases by station</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stationUsage}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="usage"
                  label={({ station, percent }) => `${station}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stationUsage.map((entry, index) => (
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
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Detailed cost analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Fuel Records
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fuel records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Gasoline">Gasoline</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price/L</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="font-medium">{record.vehicleId}</TableCell>
                  <TableCell>{record.driver}</TableCell>
                  <TableCell>{record.station}</TableCell>
                  <TableCell>{getFuelTypeBadge(record.fuelType)}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Fuel className="h-4 w-4" />
                    {record.quantity}L
                  </TableCell>
                  <TableCell>${record.pricePerLiter}</TableCell>
                  <TableCell className="font-medium">${record.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${getEfficiencyColor(record.efficiency)}`}>
                      {record.efficiency}L/100km
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
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