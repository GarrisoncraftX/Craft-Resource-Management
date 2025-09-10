import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Search, Award, AlertTriangle, Car, Clock, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

export const DriverManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const drivers = [
    {
      id: 'DRV-001',
      name: 'John Smith',
      employeeId: 'EMP-1234',
      licenseNumber: 'DL123456789',
      licenseExpiry: '2025-06-15',
      assignedVehicle: 'TRK-015',
      status: 'Active',
      rating: 4.8,
      totalMiles: 125000,
      safetyScore: 95,
      yearsExperience: 8,
      violations: 0,
      lastTraining: '2024-01-10'
    },
    {
      id: 'DRV-002',
      name: 'Sarah Johnson',
      employeeId: 'EMP-1235',
      licenseNumber: 'DL123456790',
      licenseExpiry: '2024-12-20',
      assignedVehicle: 'SUV-018',
      status: 'On Leave',
      rating: 4.6,
      totalMiles: 98000,
      safetyScore: 92,
      yearsExperience: 6,
      violations: 1,
      lastTraining: '2024-01-05'
    },
    {
      id: 'DRV-003',
      name: 'Mike Davis',
      employeeId: 'EMP-1236',
      licenseNumber: 'DL123456791',
      licenseExpiry: '2024-03-10',
      assignedVehicle: 'Unassigned',
      status: 'Available',
      rating: 4.2,
      totalMiles: 67000,
      safetyScore: 88,
      yearsExperience: 4,
      violations: 2,
      lastTraining: '2023-12-15'
    },
    {
      id: 'DRV-004',
      name: 'Lisa Chen',
      employeeId: 'EMP-1237',
      licenseNumber: 'DL123456792',
      licenseExpiry: '2025-09-30',
      assignedVehicle: 'VAN-025',
      status: 'Training',
      rating: 4.9,
      totalMiles: 156000,
      safetyScore: 98,
      yearsExperience: 12,
      violations: 0,
      lastTraining: '2024-01-20'
    }
  ];

  const performanceData = [
    { month: 'Jan', avgRating: 4.5, safetyScore: 92, violations: 3 },
    { month: 'Feb', avgRating: 4.6, safetyScore: 94, violations: 2 },
    { month: 'Mar', avgRating: 4.4, safetyScore: 91, violations: 4 },
    { month: 'Apr', avgRating: 4.7, safetyScore: 95, violations: 1 },
    { month: 'May', avgRating: 4.8, safetyScore: 96, violations: 2 },
    { month: 'Jun', avgRating: 4.6, safetyScore: 93, violations: 3 },
  ];

  const experienceDistribution = [
    { experience: '0-2 years', count: 5 },
    { experience: '3-5 years', count: 12 },
    { experience: '6-10 years', count: 18 },
    { experience: '10+ years', count: 8 },
  ];

  const trainingMetrics = [
    { skill: 'Safety', score: 92 },
    { skill: 'Navigation', score: 88 },
    { skill: 'Customer Service', score: 85 },
    { skill: 'Vehicle Maintenance', score: 78 },
    { skill: 'Emergency Response', score: 90 },
    { skill: 'Route Optimization', score: 82 },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'Active': 'success',
      'Available': 'secondary',
      'On Leave': 'warning',
      'Training': 'outline',
      'Suspended': 'destructive'
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
      return <Badge variant="warning">Expiring Soon</Badge>;
    } else {
      return <Badge variant="success">Valid</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <p className="text-muted-foreground">Manage drivers, licenses, and performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Smith" />
                </div>
              </div>
              <div>
                <Label htmlFor="employee-id">Employee ID</Label>
                <Input id="employee-id" placeholder="EMP-1234" />
              </div>
              <div>
                <Label htmlFor="license-number">License Number</Label>
                <Input id="license-number" placeholder="DL123456789" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license-expiry">License Expiry</Label>
                  <Input id="license-expiry" type="date" />
                </div>
                <div>
                  <Label htmlFor="license-class">License Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class-a">Class A (Commercial)</SelectItem>
                      <SelectItem value="class-b">Class B (Large Truck)</SelectItem>
                      <SelectItem value="class-c">Class C (Regular)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input id="experience" type="number" placeholder="5" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div>
                <Label htmlFor="emergency-contact">Emergency Contact</Label>
                <Input id="emergency-contact" placeholder="Emergency contact name and phone" />
              </div>
              <Button className="w-full">Add Driver</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2</span> improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">License Renewals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
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
              <LineChart data={performanceData}>
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
              <BarChart data={experienceDistribution}>
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
              <RadarChart data={trainingMetrics}>
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Safety Score</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.employeeId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-mono">{driver.licenseNumber}</span>
                      {getLicenseStatus(driver.licenseExpiry)}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    {driver.assignedVehicle}
                  </TableCell>
                  <TableCell>{getStatusBadge(driver.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getRatingStars(driver.rating)}
                      <span className="ml-1 text-sm">{driver.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${driver.safetyScore >= 95 ? 'text-green-600' : driver.safetyScore >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {driver.safetyScore}%
                    </span>
                  </TableCell>
                  <TableCell>{driver.yearsExperience} years</TableCell>
                  <TableCell>
                    <span className={`font-medium ${driver.violations === 0 ? 'text-green-600' : driver.violations <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {driver.violations}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View Profile</Button>
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