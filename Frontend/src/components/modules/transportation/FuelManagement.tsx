import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fuel, Plus, Search, DollarSign, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { transportationApiService } from '@/services/nodejsbackendapi/transportationApi';
import { FuelFormDialog } from './MaintenanceFuelForms';
import { mockTransportationData } from '@/services/mockData/transportation';
import type { FuelRecord } from '@/types/nodejsbackendapi/transportationTypes';

export const FuelManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | undefined>();

  const { data: fuelRecords = [], isLoading } = useQuery({
    queryKey: ['fuel-records'],
    queryFn: () => transportationApiService.getFuelRecords()
  });

  const getFuelTypeBadge = (type: string) => {
    const variants = {
      'Diesel': 'secondary',
      'Gasoline': 'default',
      'Electric': 'default',
      'Hybrid': 'outline'
    } as const;
    return <Badge variant={variants[type as keyof typeof variants] || 'outline'}>{type}</Badge>;
  };

  const filteredRecords = fuelRecords.filter(record => {
    const matchesSearch = record.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.station.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || record.fuelType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalCost = fuelRecords.reduce((sum, r) => sum + r.cost, 0);
  const totalQuantity = fuelRecords.reduce((sum, r) => sum + r.quantity, 0);

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fuel Management</h1>
          <p className="text-muted-foreground">Track fuel consumption, costs, and efficiency</p>
        </div>
        <Button onClick={() => { setSelectedRecord(undefined); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fuel Record
        </Button>
        <FuelFormDialog open={dialogOpen} onOpenChange={setDialogOpen} record={selectedRecord} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <Fuel className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost per Liter</CardTitle>
            <BarChart3 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalQuantity > 0 ? (totalCost / totalQuantity).toFixed(2) : '0.00'}</div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Fuel className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelRecords.length}</div>
            <p className="text-xs text-muted-foreground">Fuel transactions</p>
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
              <AreaChart data={mockTransportationData.monthlyConsumption}>
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
              <LineChart data={mockTransportationData.fuelEfficiencyTrends}>
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
                  data={mockTransportationData.stationUsage}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="usage"
                  label={({ station, percent }) => `${station}: ${(percent * 100).toFixed(0)}%`}
                >
                  {mockTransportationData.stationUsage.map((entry, index) => (
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
              <BarChart data={mockTransportationData.fuelCostBreakdown} layout="horizontal">
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
                <TableHead>Cost</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="font-medium">{record.vehicleId}</TableCell>
                  <TableCell>{record.driverId}</TableCell>
                  <TableCell>{record.station}</TableCell>
                  <TableCell>{getFuelTypeBadge(record.fuelType)}</TableCell>
                  <TableCell>{record.quantity}L</TableCell>
                  <TableCell className="font-medium">${record.cost.toFixed(2)}</TableCell>
                  <TableCell>{record.mileage.toLocaleString()} km</TableCell>
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
