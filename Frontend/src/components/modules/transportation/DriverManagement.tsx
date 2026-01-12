import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Search, Award, AlertTriangle, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { transportationApiService } from '@/services/nodejsbackendapi/transportationApi';
import { DriverFormDialog } from './DriverFormDialog';
import { mockTransportationData } from '@/services/mockData/transportation';
import type { Driver } from '@/types/nodejsbackendapi/transportationTypes';

export const DriverManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => transportationApiService.getDrivers()
  });

  const { data: performanceAnalytics } = useQuery({
    queryKey: ['driver-performance'],
    queryFn: () => transportationApiService.getDriverPerformanceAnalytics()
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'suspended': 'destructive',
      'expired': 'secondary',
      'terminated': 'outline'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getLicenseStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysDiff <= 30) {
      return <Badge variant="secondary">Expiring Soon</Badge>;
    } else {
      return <Badge variant="default">Valid</Badge>;
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <p className="text-muted-foreground">Manage drivers, licenses, and performance</p>
        </div>
        <Button onClick={() => { setSelectedDriver(undefined); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
        <DriverFormDialog open={dialogOpen} onOpenChange={setDialogOpen} driver={selectedDriver} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Active</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Experience</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.experienceYears, 0) / drivers.length).toFixed(1) : 0} yrs
            </div>
            <p className="text-xs text-muted-foreground">Experience level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.filter(d => d.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">License Renewals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.filter(d => {
                const daysDiff = Math.ceil((new Date(d.licenseExpiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                return daysDiff <= 30 && daysDiff >= 0;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Due within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Driver Performance Trends</CardTitle>
            <CardDescription>Monthly performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceAnalytics || mockTransportationData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgRating" stroke="#10b981" strokeWidth={2} name="Avg Rating" />
                <Line type="monotone" dataKey="safetyScore" stroke="#3b82f6" strokeWidth={2} name="Safety Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Distribution</CardTitle>
            <CardDescription>Driver experience levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockTransportationData.experienceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="experience" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Skills Assessment</CardTitle>
            <CardDescription>Average scores across skill areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={mockTransportationData.trainingMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Driver Directory
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drivers..."
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.employeeId}</TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>Class {driver.licenseType}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{driver.licenseExpiryDate}</span>
                      {getLicenseStatus(driver.licenseExpiryDate)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(driver.status)}</TableCell>
                  <TableCell>{driver.experienceYears} years</TableCell>
                  <TableCell>{driver.contactNumber}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedDriver(driver); setDialogOpen(true); }}>
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
