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
import { FileText, Send, Calendar, Eye, Plus, Edit } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const PressReleases: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const pressReleases = [
    { id: 'PR-001', title: 'City Launches New Digital Services Platform', category: 'Technology', status: 'Published', views: 1250, publishDate: '2024-01-15', author: 'Communications Team' },
    { id: 'PR-002', title: 'Annual Budget Approval and Key Infrastructure Projects', category: 'Finance', status: 'Published', views: 2100, publishDate: '2024-01-10', author: 'Finance Department' },
    { id: 'PR-003', title: 'Public Consultation on New Park Development', category: 'Development', status: 'Draft', views: 0, publishDate: null, author: 'Planning Department' },
    { id: 'PR-004', title: 'Emergency Services Response Time Improvements', category: 'Public Safety', status: 'Scheduled', views: 0, publishDate: '2024-02-01', author: 'Emergency Services' },
  ];

  const mediaEngagement = [
    { month: 'Jan', releases: 8, views: 15000, shares: 450 },
    { month: 'Feb', releases: 6, views: 12000, shares: 380 },
    { month: 'Mar', releases: 10, views: 18000, shares: 520 },
    { month: 'Apr', releases: 7, views: 14000, shares: 420 },
    { month: 'May', releases: 9, views: 16000, shares: 480 },
    { month: 'Jun', releases: 11, views: 20000, shares: 600 },
  ];

  const categoryData = [
    { category: 'Technology', count: 15, views: 12000 },
    { category: 'Finance', count: 10, views: 18000 },
    { category: 'Development', count: 8, views: 9500 },
    { category: 'Public Safety', count: 12, views: 15000 },
    { category: 'Environment', count: 6, views: 7200 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Press Releases</h1>
          <p className="text-gray-600">Create and manage public communications</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Releases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98</div>
              <p className="text-xs text-muted-foreground">Live releases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">185K</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Pending publication</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Media Engagement Trends</CardTitle>
                  <CardDescription>Monthly views and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mediaEngagement}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" name="Views" />
                      <Line type="monotone" dataKey="shares" stroke="#82ca9d" name="Shares" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Release Categories</CardTitle>
                  <CardDescription>Distribution by content category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Releases" />
                      <Bar dataKey="views" fill="#82ca9d" name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create Press Release</CardTitle>
                <CardDescription>Draft a new press release</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Release Title</Label>
                      <Input id="title" placeholder="Enter press release title" />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="safety">Public Safety</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="summary">Executive Summary</Label>
                    <Textarea id="summary" placeholder="Brief summary for media outlets" />
                  </div>

                  <div>
                    <Label htmlFor="content">Full Content</Label>
                    <Textarea 
                      id="content" 
                      placeholder="Full press release content..."
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="publishDate">Publish Date</Label>
                      <Input id="publishDate" type="datetime-local" />
                    </div>
                    <div>
                      <Label htmlFor="author">Author/Department</Label>
                      <Input id="author" placeholder="Author or department name" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">Save as Draft</Button>
                    <Button>Schedule Publication</Button>
                    <PermissionGuard requiredPermissions={['pr.releases.publish']}>
                      <Button variant="default">Publish Now</Button>
                    </PermissionGuard>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Manage Press Releases</CardTitle>
                <CardDescription>View and edit existing releases</CardDescription>
                <PermissionGuard requiredPermissions={['pr.releases.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Release
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Publish Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pressReleases.map((release) => (
                      <TableRow key={release.id}>
                        <TableCell className="font-medium">{release.id}</TableCell>
                        <TableCell className="max-w-xs truncate">{release.title}</TableCell>
                        <TableCell>{release.category}</TableCell>
                        <TableCell>
                          <Badge variant={
                            release.status === 'Published' ? 'default' : 
                            release.status === 'Scheduled' ? 'secondary' : 
                            'outline'
                          }>
                            {release.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{release.views.toLocaleString()}</TableCell>
                        <TableCell>{release.publishDate || 'Not scheduled'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Publication Schedule</CardTitle>
                <CardDescription>Calendar view of scheduled releases</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Publication calendar will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Press Release Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Detailed analytics and reporting will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Release Templates</CardTitle>
                <CardDescription>Standardized templates for different types of announcements</CardDescription>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Template management will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};