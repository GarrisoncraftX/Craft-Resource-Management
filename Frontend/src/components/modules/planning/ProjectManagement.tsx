import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Calendar, Users, DollarSign, Plus, BarChart3 } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export const ProjectManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const projects = [
    { id: 'PM-001', name: 'City Infrastructure Upgrade', manager: 'John Smith', budget: 5000000, spent: 3200000, progress: 65, status: 'In Progress', startDate: '2024-01-15', endDate: '2024-12-30' },
    { id: 'PM-002', name: 'Public Park Development', manager: 'Sarah Johnson', budget: 1200000, spent: 800000, progress: 80, status: 'Near Completion', startDate: '2024-03-01', endDate: '2024-09-30' },
    { id: 'PM-003', name: 'Transport Hub Construction', manager: 'Mike Davis', budget: 8000000, spent: 2400000, progress: 30, status: 'Planning', startDate: '2024-06-01', endDate: '2025-06-30' },
    { id: 'PM-004', name: 'Digital Services Platform', manager: 'Lisa Chen', budget: 800000, spent: 650000, progress: 90, status: 'Quality Assurance', startDate: '2023-09-15', endDate: '2024-03-15' },
  ];

  const budgetData = [
    { month: 'Jan', allocated: 2000000, spent: 1800000 },
    { month: 'Feb', allocated: 2200000, spent: 2100000 },
    { month: 'Mar', allocated: 2500000, spent: 2300000 },
    { month: 'Apr', allocated: 2800000, spent: 2600000 },
    { month: 'May', allocated: 3000000, spent: 2900000 },
    { month: 'Jun', allocated: 3200000, spent: 3100000 },
  ];

  const projectProgressData = [
    { name: 'Infrastructure Upgrade', progress: 65, budget: 5000000 },
    { name: 'Park Development', progress: 80, budget: 1200000 },
    { name: 'Transport Hub', progress: 30, budget: 8000000 },
    { name: 'Digital Platform', progress: 90, budget: 800000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Project Management</h1>
          <p className="text-gray-600">Track and manage development projects</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$15M</div>
              <p className="text-xs text-muted-foreground">Allocated budget</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">66%</div>
              <p className="text-xs text-muted-foreground">Average progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">Assigned staff</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress Overview</CardTitle>
                  <CardDescription>Current status of all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="progress" fill="#8884d8" name="Progress %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Utilization</CardTitle>
                  <CardDescription>Monthly budget allocation vs spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${(value as number / 1000000).toFixed(1)}M`} />
                      <Legend />
                      <Line type="monotone" dataKey="allocated" stroke="#8884d8" name="Allocated" />
                      <Line type="monotone" dataKey="spent" stroke="#82ca9d" name="Spent" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project List</CardTitle>
                <CardDescription>All active and planned projects</CardDescription>
                <PermissionGuard requiredPermissions={['planning.projects.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input id="projectName" placeholder="Enter project name" />
                  </div>
                  <div>
                    <Label htmlFor="projectManager">Project Manager</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="john">John Smith</SelectItem>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="mike">Mike Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input id="budget" type="number" placeholder="Project budget" />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="progress">In Progress</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.id}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{project.manager}</TableCell>
                        <TableCell>${(project.budget / 1000000).toFixed(1)}M</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{project.endDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Gantt chart and milestone tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Project timeline and Gantt chart will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>Track project budgets and expenditures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge variant="outline">{((project.spent / project.budget) * 100).toFixed(0)}% spent</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Budget</p>
                          <p className="font-medium">${(project.budget / 1000000).toFixed(1)}M</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Spent</p>
                          <p className="font-medium">${(project.spent / 1000000).toFixed(1)}M</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Remaining</p>
                          <p className="font-medium">${((project.budget - project.spent) / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resource Management</CardTitle>
                <CardDescription>Manage project resources and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Resource management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Project Reports</CardTitle>
                <CardDescription>Progress and performance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Project reports and analytics will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};