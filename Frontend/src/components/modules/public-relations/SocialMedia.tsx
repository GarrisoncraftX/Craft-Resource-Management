import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Eye, Heart, MessageCircle, Share, Plus, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const socialPosts = [
  {
    id: 1,
    platform: 'Facebook',
    content: 'Excited to announce our new community initiative! Join us this Saturday...',
    scheduledDate: '2024-01-20',
    scheduledTime: '10:00',
    status: 'Scheduled',
    engagement: { likes: 45, comments: 12, shares: 8 }
  },
  {
    id: 2,
    platform: 'Twitter',
    content: 'Breaking: New policy update will benefit over 1000 residents in our community',
    scheduledDate: '2024-01-18',
    scheduledTime: '14:30',
    status: 'Published',
    engagement: { likes: 120, comments: 35, shares: 67 }
  },
  {
    id: 3,
    platform: 'LinkedIn',
    content: 'Our quarterly transparency report is now available. Read about our progress...',
    scheduledDate: '2024-01-15',
    scheduledTime: '09:00',
    status: 'Published',
    engagement: { likes: 89, comments: 23, shares: 41 }
  }
];

const engagementData = [
  { date: '2024-01-01', facebook: 120, twitter: 89, linkedin: 45, instagram: 67 },
  { date: '2024-01-08', facebook: 135, twitter: 102, linkedin: 52, instagram: 78 },
  { date: '2024-01-15', facebook: 156, twitter: 118, linkedin: 63, instagram: 89 },
  { date: '2024-01-22', facebook: 142, twitter: 95, linkedin: 58, instagram: 72 }
];

const platformData = [
  { name: 'Facebook', followers: 2500, color: '#1877f2' },
  { name: 'Twitter', followers: 1800, color: '#1da1f2' },
  { name: 'LinkedIn', followers: 950, color: '#0077b5' },
  { name: 'Instagram', followers: 1200, color: '#e4405f' }
];

const contentCategories = [
  { category: 'Community Events', posts: 25, engagement: 1250 },
  { category: 'Policy Updates', posts: 18, engagement: 980 },
  { category: 'Public Services', posts: 22, engagement: 1100 },
  { category: 'Announcements', posts: 15, engagement: 750 }
];

export const SocialMedia: React.FC = () => {
  const [posts, setPosts] = useState(socialPosts);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newPost, setNewPost] = useState({
    platform: '',
    content: '',
    scheduledDate: '',
    scheduledTime: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-500';
      case 'Scheduled': return 'bg-blue-500';
      case 'Draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Facebook': return 'bg-blue-600';
      case 'Twitter': return 'bg-sky-500';
      case 'LinkedIn': return 'bg-blue-700';
      case 'Instagram': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Social Media Management</h1>
            <p className="text-muted-foreground">Schedule posts and monitor social media engagement</p>
          </div>
          <Button onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Post
          </Button>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Scheduled Posts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="content">Content Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {/* Platform Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {platformData.map((platform) => (
                <Card key={platform.name} className="text-white" style={{ backgroundColor: platform.color }}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{platform.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{platform.followers.toLocaleString()}</div>
                    <p className="text-xs opacity-80">Followers</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Scheduled Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled & Recent Posts</CardTitle>
                <CardDescription>Manage your social media content calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getPlatformColor(post.platform)}>
                            {post.platform}
                          </Badge>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {post.scheduledDate}
                          <Clock className="h-4 w-4" />
                          {post.scheduledTime}
                        </div>
                      </div>
                      
                      <p className="text-sm">{post.content}</p>
                      
                      {post.status === 'Published' && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.engagement.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.engagement.comments}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="h-4 w-4" />
                            {post.engagement.shares}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Preview</Button>
                        {post.status === 'Scheduled' && (
                          <Button variant="outline" size="sm">Cancel</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Follower Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, followers }) => `${name}: ${followers}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="followers"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="facebook" stroke="#1877f2" strokeWidth={2} />
                      <Line type="monotone" dataKey="twitter" stroke="#1da1f2" strokeWidth={2} />
                      <Line type="monotone" dataKey="linkedin" stroke="#0077b5" strokeWidth={2} />
                      <Line type="monotone" dataKey="instagram" stroke="#e4405f" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Content Category Performance</CardTitle>
                <CardDescription>Analyze engagement by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-muted-foreground">{category.posts} posts</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{category.engagement.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Engagement Overview</CardTitle>
                <CardDescription>Track engagement metrics across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="facebook" stackId="1" stroke="#1877f2" fill="#1877f2" />
                    <Area type="monotone" dataKey="twitter" stackId="1" stroke="#1da1f2" fill="#1da1f2" />
                    <Area type="monotone" dataKey="linkedin" stackId="1" stroke="#0077b5" fill="#0077b5" />
                    <Area type="monotone" dataKey="instagram" stackId="1" stroke="#e4405f" fill="#e4405f" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>Plan and organize your social media content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-4 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="font-medium p-2 bg-muted rounded">{day}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-4">
                    {Array.from({ length: 35 }, (_, i) => (
                      <div key={i} className="border rounded p-2 h-24 text-sm">
                        <div className="font-medium">{((i % 31) + 1)}</div>
                        {i % 7 === 1 && (
                          <div className="mt-1">
                            <Badge className="text-xs bg-blue-500">FB Post</Badge>
                          </div>
                        )}
                        {i % 5 === 0 && i > 0 && (
                          <div className="mt-1">
                            <Badge className="text-xs bg-sky-500">Tweet</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};