import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Building, FileText, Plus, Save, Search } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const UrbanPlanning: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const zonePlans = [
    { id: 'ZP-001', zone: 'Downtown Commercial', type: 'Commercial', area: '2.5 km²', population: 15000, status: 'Active' },
    { id: 'ZP-002', zone: 'Residential District A', type: 'Residential', area: '4.2 km²', population: 25000, status: 'Under Review' },
    { id: 'ZP-003', zone: 'Industrial Park', type: 'Industrial', area: '3.8 km²', population: 500, status: 'Active' },
    { id: 'ZP-004', zone: 'Green Belt', type: 'Conservation', area: '6.1 km²', population: 0, status: 'Protected' },
  ];

  const developmentProjects = [
    { id: 'DP-001', name: 'City Center Redevelopment', zone: 'Downtown Commercial', budget: 25000000, progress: 65, status: 'In Progress' },
    { id: 'DP-002', name: 'Affordable Housing Phase 1', zone: 'Residential District A', budget: 18000000, progress: 30, status: 'Planning' },
    { id: 'DP-003', name: 'Industrial Expansion', zone: 'Industrial Park', budget: 12000000, progress: 85, status: 'Near Completion' },
  ];

  const zoneData = [
    { zone: 'Commercial', area: 2.5, population: 15000, projects: 8 },
    { zone: 'Residential', area: 4.2, population: 25000, projects: 12 },
    { zone: 'Industrial', area: 3.8, population: 500, projects: 5 },
    { zone: 'Conservation', area: 6.1, population: 0, projects: 2 },
  ];

  const landUseData = [
    { name: 'Residential', value: 45, color: '#8884d8' },
    { name: 'Commercial', value: 20, color: '#82ca9d' },
    { name: 'Industrial', value: 15, color: '#ffc658' },
    { name: 'Green Space', value: 12, color: '#ff7300' },
    { name: 'Infrastructure', value: 8, color: '#d084d0' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Urban Planning</h1>
          <p className="text-gray-600">Land use and development planning</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Planning zones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">27</div>
              <p className="text-xs text-muted-foreground">Development projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Area</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16.6 km²</div>
              <p className="text-xs text-muted-foreground">Planned area</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Population</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">40,500</div>
              <p className="text-xs text-muted-foreground">In planning areas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="zones">Zone Planning</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="landuse">Land Use</TabsTrigger>
            <TabsTrigger value="permits">Permits</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Zone Distribution</CardTitle>
                  <CardDescription>Area coverage by zone type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={zoneData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="zone" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="area" fill="#8884d8" name="Area (km²)" />
                      <Bar dataKey="projects" fill="#82ca9d" name="Projects" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Land Use Distribution</CardTitle>
                  <CardDescription>Current land use allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={landUseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {landUseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="zones">
            <Card>
              <CardHeader>
                <CardTitle>Zone Planning Management</CardTitle>
                <CardDescription>Create and manage planning zones</CardDescription>
                <PermissionGuard requiredPermissions={['planning.zones.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Zone Plan
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label htmlFor="zoneName">Zone Name</Label>
                    <Input id="zoneName" placeholder="Enter zone name" />
                  </div>
                  <div>
                    <Label htmlFor="zoneType">Zone Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="conservation">Conservation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="area">Area (km²)</Label>
                    <Input id="area" type="number" placeholder="Zone area" />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone ID</TableHead>
                      <TableHead>Zone Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Population</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zonePlans.map((zone) => (
                      <TableRow key={zone.id}>
                        <TableCell className="font-medium">{zone.id}</TableCell>
                        <TableCell>{zone.zone}</TableCell>
                        <TableCell>{zone.type}</TableCell>
                        <TableCell>{zone.area}</TableCell>
                        <TableCell>{zone.population.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={zone.status === 'Active' ? 'default' : 'secondary'}>
                            {zone.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="development">
            <Card>
              <CardHeader>
                <CardTitle>Development Projects</CardTitle>
                <CardDescription>Track development project progress</CardDescription>
                <PermissionGuard requiredPermissions={['planning.development.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {developmentProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-gray-600">{project.zone}</p>
                        </div>
                        <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Budget</p>
                          <p className="font-medium">${(project.budget / 1000000).toFixed(1)}M</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="landuse">
            <Card>
              <CardHeader>
                <CardTitle>Land Use Planning</CardTitle>
                <CardDescription>Define land use classifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="landUseType">Land Use Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select land use type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="recreational">Recreational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="restrictions">Usage Restrictions</Label>
                    <Textarea id="restrictions" placeholder="Enter usage restrictions" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permits">
            <Card>
              <CardHeader>
                <CardTitle>Development Permits</CardTitle>
                <CardDescription>Process development permit applications</CardDescription>
                <PermissionGuard requiredPermissions={['planning.permits.issue']}>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Issue Permit
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Development permit management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Planning Reports</CardTitle>
                <CardDescription>Development and zoning analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Planning reports and analytics will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};