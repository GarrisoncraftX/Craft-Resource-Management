import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Car, Users, Fuel, Wrench, AlertTriangle, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { transportationApiService } from '@/services/nodejsbackendapi/transportationApi';
import { mockTransportationData } from '@/services/mockData/transportation';
import { useNavigate } from 'react-router-dom';

export const TransportationDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: report } = useQuery({
    queryKey: ['transportation-report'],
    queryFn: () => transportationApiService.getTransportationReport()
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => transportationApiService.getVehicles()
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => transportationApiService.getDrivers()
  });

  const { data: fuelAnalytics } = useQuery({
    queryKey: ['fuel-analytics'],
    queryFn: () => transportationApiService.getFuelConsumptionAnalytics()
  });

  const { data: maintenanceAnalytics } = useQuery({
    queryKey: ['maintenance-analytics'],
    queryFn: () => transportationApiService.getMaintenanceScheduleAnalytics()
  });

  const vehicleStatusData = [
    { name: 'Active', value: vehicles.filter(v => v.status === 'active').length, color: 'hsl(var(--chart-1))' },
    { name: 'Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length, color: 'hsl(var(--chart-3))' },
    { name: 'Out of Service', value: vehicles.filter(v => v.status === 'out_of_service').length, color: 'hsl(var(--chart-4))' }
  ];

  const chartConfig = {
    consumption: { label: 'Fuel Consumption (L)', color: 'hsl(var(--chart-1))' },
    cost: { label: 'Fuel Cost ($)', color: 'hsl(var(--chart-2))' },
    scheduled: { label: 'Scheduled', color: 'hsl(var(--chart-1))' },
    completed: { label: 'Completed', color: 'hsl(var(--chart-2))' },
    overdue: { label: 'Overdue', color: 'hsl(var(--chart-3))' }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transportation Management</h1>
            <p className="text-muted-foreground">Manage fleet, drivers, routes, and maintenance operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report?.totalVehicles || vehicles.length}</div>
              <p className="text-xs text-muted-foreground">{report?.activeVehicles || vehicles.filter(v => v.status === 'active').length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report?.activeDrivers || drivers.filter(d => d.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">{report?.totalDrivers || drivers.length} total drivers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fuel Cost (Month)</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${report?.totalFuelCost?.toFixed(2) || '0'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${report?.totalMaintenanceCost?.toFixed(2) || '0'}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Consumption & Cost Trends</CardTitle>
              <CardDescription>Monthly fuel usage and associated costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fuelAnalytics || mockTransportationData.fuelConsumptionData}>
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

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
            <CardDescription>Track and manage vehicle maintenance activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceAnalytics || mockTransportationData.maintenanceScheduleData}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/transportation/fleet')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Fleet Management
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Manage vehicles and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Car className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                  <p className="text-sm text-muted-foreground">Total Vehicles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/transportation/drivers')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Driver Management
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Manage drivers and licenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{drivers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Drivers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/transportation/maintenance')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Vehicle Maintenance
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Track maintenance schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Wrench className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">Scheduled</p>
                  <p className="text-sm text-muted-foreground">Maintenance Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/transportation/fuel')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Fuel Management
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Monitor fuel consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Fuel className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">Track</p>
                  <p className="text-sm text-muted-foreground">Fuel Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/transportation/routes')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Route Management
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Optimize transportation routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Car className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">Optimize</p>
                  <p className="text-sm text-muted-foreground">Route Planning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
