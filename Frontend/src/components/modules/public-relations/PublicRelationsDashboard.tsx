import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Megaphone, Users, Calendar, TrendingUp, Eye, Heart, MessageCircle, Plus, Camera } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';

export const PublicRelationsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const recentPressReleases = [
    { id: 'PR-001', title: 'New Municipal Development Project Announced', status: 'Published', date: '2024-01-20', views: 1250, engagement: 87 },
    { id: 'PR-002', title: 'City Council Budget Approval for 2024', status: 'Draft', date: '2024-01-22', views: 0, engagement: 0 },
    { id: 'PR-003', title: 'Public Safety Initiative Launch', status: 'Review', date: '2024-01-19', views: 850, engagement: 63 },
  ];

  const mediaContacts = [
    { name: 'Jane Reporter', outlet: 'City Daily News', type: 'Print', lastContact: '2024-01-18', relationship: 'Active' },
    { name: 'Mike Broadcaster', outlet: 'Local TV 5', type: 'Television', lastContact: '2024-01-15', relationship: 'Active' },
    { name: 'Sarah Journalist', outlet: 'Metro Radio', type: 'Radio', lastContact: '2024-01-10', relationship: 'Inactive' },
  ];

  const socialMediaMetrics = {
    facebook: { followers: 12450, engagement: 3.2, posts: 23 },
    twitter: { followers: 8750, engagement: 2.8, posts: 45 },
    instagram: { followers: 5200, engagement: 4.1, posts: 18 },
    linkedin: { followers: 3100, engagement: 2.1, posts: 12 }
  };

  const upcomingEvents = [
    { name: 'Town Hall Meeting', date: '2024-02-15', type: 'Public Meeting', attendees: 200, status: 'Planned' },
    { name: 'Community Festival', date: '2024-03-10', type: 'Public Event', attendees: 1500, status: 'Planning' },
    { name: 'Budget Presentation', date: '2024-02-28', type: 'Press Conference', attendees: 50, status: 'Confirmed' },
  ];

  const prMetrics = {
    totalReach: 45000,
    engagementRate: 3.4,
    mediaReports: 23,
    publicEvents: 8
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Public Relations Module</h1>
          <p className="text-gray-600">Media relations and public communication</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prMetrics.totalReach.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prMetrics.engagementRate}%</div>
              <p className="text-xs text-muted-foreground">+0.3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media Reports</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prMetrics.mediaReports}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prMetrics.publicEvents}</div>
              <p className="text-xs text-muted-foreground">Events this quarter</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="press">Press Releases</TabsTrigger>
            <TabsTrigger value="media">Media Relations</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="events">Public Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Press Releases</CardTitle>
                  <CardDescription>Latest public communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPressReleases.map((release) => (
                      <div key={release.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{release.title}</p>
                          <p className="text-sm text-gray-600">Published: {release.date}</p>
                          <p className="text-xs text-gray-500">{release.views} views • {release.engagement}% engagement</p>
                        </div>
                        <Badge variant={release.status === 'Published' ? 'default' : release.status === 'Draft' ? 'secondary' : 'outline'}>
                          {release.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media Overview</CardTitle>
                  <CardDescription>Cross-platform engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(socialMediaMetrics).map(([platform, metrics]) => (
                      <div key={platform} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{platform}</span>
                          <span className="text-sm text-gray-600">{metrics.followers.toLocaleString()} followers</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{metrics.engagement}% engagement</span>
                          <span>{metrics.posts} posts this month</span>
                        </div>
                        <Progress value={metrics.engagement * 20} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="press">
            <Card>
              <CardHeader>
                <CardTitle>Press Releases Management</CardTitle>
                <CardDescription>Create and publish press releases</CardDescription>
                <PermissionGuard requiredPermissions={['pr.press.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Press Release
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPressReleases.map((release) => (
                      <TableRow key={release.id}>
                        <TableCell className="font-medium">{release.id}</TableCell>
                        <TableCell>{release.title}</TableCell>
                        <TableCell>
                          <Badge variant={release.status === 'Published' ? 'default' : release.status === 'Draft' ? 'secondary' : 'outline'}>
                            {release.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{release.date}</TableCell>
                        <TableCell>{release.views.toLocaleString()}</TableCell>
                        <TableCell>{release.engagement}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media Relations</CardTitle>
                <CardDescription>Manage media contacts and relationships</CardDescription>
                <PermissionGuard requiredPermissions={['pr.media.manage']}>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Add Media Contact
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Relationship</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mediaContacts.map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.outlet}</TableCell>
                        <TableCell>{contact.type}</TableCell>
                        <TableCell>{contact.lastContact}</TableCell>
                        <TableCell>
                          <Badge variant={contact.relationship === 'Active' ? 'default' : 'secondary'}>
                            {contact.relationship}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Management</CardTitle>
                <CardDescription>Schedule and monitor social media content</CardDescription>
                <PermissionGuard requiredPermissions={['pr.social.post']}>
                  <Button>
                    <Camera className="h-4 w-4 mr-2" />
                    Schedule Post
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(socialMediaMetrics).map(([platform, metrics]) => (
                    <Card key={platform}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base capitalize">{platform}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">{metrics.followers.toLocaleString()}</div>
                          <p className="text-xs text-gray-600">Followers</p>
                          <div className="flex justify-between text-sm">
                            <span>{metrics.engagement}% engagement</span>
                            <span>{metrics.posts} posts</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Public Events Management</CardTitle>
                <CardDescription>Plan and manage public events and meetings</CardDescription>
                <PermissionGuard requiredPermissions={['pr.events.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Plan New Event
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expected Attendees</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingEvents.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>{event.type}</TableCell>
                        <TableCell>{event.attendees}</TableCell>
                        <TableCell>
                          <Badge variant={event.status === 'Confirmed' ? 'default' : event.status === 'Planned' ? 'secondary' : 'outline'}>
                            {event.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};