import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Heart, MessageCircle, Calendar, Plus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { publicRelationsApiService } from '@/services/nodejsbackendapi/publicRelationsApi';
import { mockPRMetrics } from '@/services/mockData/pr';

export const PublicRelationsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<{
    totalReach: number;
    engagementRate: number;
    mediaReports: number;
    publicEvents: number;
    totalPressReleases: number;
    publishedPressReleases: number;
    totalMediaContacts: number;
    activeMediaContacts: number;
    totalEvents: number;
    completedEvents: number;
  }>(mockPRMetrics);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const metricsData = await publicRelationsApiService.getPublicRelationsReport();
      setMetrics({
        totalReach: metricsData.totalReach || 0,
        engagementRate: metricsData.engagementRate || 0,
        mediaReports: metricsData.mediaReports || 0,
        publicEvents: metricsData.publicEvents || 0,
        totalPressReleases: metricsData.totalPressReleases,
        publishedPressReleases: metricsData.publishedPressReleases,
        totalMediaContacts: metricsData.totalMediaContacts,
        activeMediaContacts: metricsData.activeMediaContacts,
        totalEvents: metricsData.totalEvents,
        completedEvents: metricsData.completedEvents,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setMetrics(mockPRMetrics);
    }
  };

  const engagementData = [
    { month: 'Jan', reach: 35000, engagement: 2.8 },
    { month: 'Feb', reach: 38000, engagement: 3.1 },
    { month: 'Mar', reach: 42000, engagement: 3.3 },
    { month: 'Apr', reach: 45000, engagement: 3.4 },
  ];

  const mediaTypeData = [
    { name: 'Press Releases', value: metrics.publishedPressReleases },
    { name: 'Media Contacts', value: metrics.activeMediaContacts },
    { name: 'Events', value: metrics.completedEvents },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Public Relations Module</h1>
          <p className="text-gray-600">Media relations and public communication</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalReach.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.engagementRate}%</div>
              <p className="text-xs text-muted-foreground">+0.3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media Reports</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.mediaReports}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.publicEvents}</div>
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
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>Monthly reach and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="reach" stroke="#8884d8" name="Reach" />
                      <Line type="monotone" dataKey="engagement" stroke="#82ca9d" name="Engagement %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PR Activities Overview</CardTitle>
                  <CardDescription>Distribution of PR activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mediaTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="press">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Press Releases Management</CardTitle>
                    <CardDescription>Create and publish press releases</CardDescription>
                  </div>
                  <Button onClick={() => globalThis.location.href = '/pr/releases'}>
                    <Plus className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Total Press Releases: {metrics.totalPressReleases}</p>
                <p className="text-muted-foreground">Published: {metrics.publishedPressReleases}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Media Relations</CardTitle>
                    <CardDescription>Manage media contacts and relationships</CardDescription>
                  </div>
                  <Button onClick={() => globalThis.location.href = '/pr/media'}>
                    <Plus className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Total Media Contacts: {metrics.totalMediaContacts}</p>
                <p className="text-muted-foreground">Active Contacts: {metrics.activeMediaContacts}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Social Media Management</CardTitle>
                    <CardDescription>Schedule and monitor social media content</CardDescription>
                  </div>
                  <Button onClick={() => globalThis.location.href = '/pr/social'}>
                    <Plus className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Social media management dashboard</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Public Events Management</CardTitle>
                    <CardDescription>Plan and manage public events and meetings</CardDescription>
                  </div>
                  <Button onClick={() => globalThis.location.href = '/pr/events'}>
                    <Plus className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Total Events: {metrics.totalEvents}</p>
                <p className="text-muted-foreground">Completed: {metrics.completedEvents}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
