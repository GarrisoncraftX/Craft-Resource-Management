import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Send, Calendar, Eye, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { publicRelationsApiService, type PressRelease } from '@/services/nodejsbackendapi/publicRelationsApi';
import { mockPressReleases } from '@/services/mockData/pr';
import { PressReleaseFormDialog } from './PressReleaseFormDialog';

export const PressReleases: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pressReleases, setPressReleases] = useState<PressRelease[]>(mockPressReleases as PressRelease[]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadPressReleases();
  }, []);

  const loadPressReleases = async () => {
    try {
      const data = await publicRelationsApiService.getPressReleases();
      setPressReleases(data);
    } catch (error) {
      console.error('Error loading press releases:', error);
      setPressReleases(mockPressReleases as PressRelease[]);
    }
  };

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
                <CardDescription>Use the form dialog to create a new press release</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Release
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manage Press Releases</CardTitle>
                    <CardDescription>View and edit existing releases</CardDescription>
                  </div>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Release
                  </Button>
                </div>
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
                        <TableCell>{release.tags?.[0] || 'General'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              release.status === 'published'
                                ? 'default'
                                : release.status === 'draft'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {release.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{release.views?.toLocaleString() || 0}</TableCell>
                        <TableCell>{release.publishDate || 'Not scheduled'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
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
      <PressReleaseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={loadPressReleases} />
    </div>
  );
};