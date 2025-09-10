import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, Users, Mail, MessageSquare, Calendar, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const notificationStats = [
  { month: 'Jan', email: 1200, sms: 450, push: 890 },
  { month: 'Feb', email: 1100, sms: 380, push: 720 },
  { month: 'Mar', email: 1350, sms: 520, push: 950 },
  { month: 'Apr', email: 1280, sms: 490, push: 1100 },
  { month: 'May', email: 1420, sms: 560, push: 1050 },
  { month: 'Jun', email: 1380, sms: 520, push: 980 }
];

const deliveryRates = [
  { name: 'Delivered', value: 85, color: '#10b981' },
  { name: 'Failed', value: 10, color: '#ef4444' },
  { name: 'Pending', value: 5, color: '#f59e0b' }
];

const recentNotifications = [
  {
    id: 1,
    title: 'System Maintenance Alert',
    message: 'Scheduled maintenance will begin at 2:00 AM',
    type: 'System',
    recipients: 245,
    timestamp: '2024-01-15 09:30:00',
    status: 'Sent',
    priority: 'High'
  },
  {
    id: 2,
    title: 'Security Alert',
    message: 'Multiple failed login attempts detected',
    type: 'Security',
    recipients: 12,
    timestamp: '2024-01-15 08:45:00',
    status: 'Delivered',
    priority: 'Critical'
  },
  {
    id: 3,
    title: 'Weekly Report Available',
    message: 'Your weekly analytics report is ready',
    type: 'Report',
    recipients: 89,
    timestamp: '2024-01-15 07:00:00',
    status: 'Sent',
    priority: 'Low'
  }
];

export const Notifications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    recipients: 'all'
  });
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    autoSend: false
  });

  const filteredNotifications = recentNotifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-green-500';
      case 'Delivered': return 'bg-blue-500';
      case 'Failed': return 'bg-red-500';
      case 'Pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification Management</h1>
            <p className="text-muted-foreground">Send and manage system notifications</p>
          </div>
          <Button className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Send Notification
          </Button>
        </div>

        {/* Notification Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-blue-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,247</div>
              <p className="text-xs opacity-80">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <Mail className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95.2%</div>
              <p className="text-xs opacity-80">Average success rate</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Recipients</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs opacity-80">Subscribed users</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <MessageSquare className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs opacity-80">Queued notifications</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="send" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="history">Notification History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Notification</CardTitle>
                <CardDescription>Compose and send notifications to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter notification title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Notification Type</Label>
                    <Select value={newNotification.type} onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your notification message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newNotification.priority} onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <Select value={newNotification.recipients} onValueChange={(value) => setNewNotification(prev => ({ ...prev, recipients: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="admins">Administrators</SelectItem>
                        <SelectItem value="managers">Managers</SelectItem>
                        <SelectItem value="employees">Employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="schedule" />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>

                <div className="flex gap-2">
                  <Button className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Now
                  </Button>
                  <Button variant="outline">Save as Draft</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Notifications</CardTitle>
                <CardDescription>Find notifications by title, message, or type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
                <CardDescription>Recent notifications sent to users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {notification.message}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{notification.type}</TableCell>
                        <TableCell>{notification.recipients}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{notification.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Volume</CardTitle>
                  <CardDescription>Monthly notification statistics by channel</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={notificationStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="email" fill="hsl(var(--primary))" name="Email" />
                      <Bar dataKey="sms" fill="hsl(var(--secondary))" name="SMS" />
                      <Bar dataKey="push" fill="hsl(var(--accent))" name="Push" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Rate Analysis</CardTitle>
                  <CardDescription>Overall notification delivery success rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deliveryRates}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deliveryRates.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Notification Trends</CardTitle>
                <CardDescription>Delivery performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={notificationStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="email" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="sms" stroke="hsl(var(--secondary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="push" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>Configure notification delivery methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    id="email"
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="sms"
                    checked={settings.smsEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                  </div>
                  <Switch
                    id="push"
                    checked={settings.pushEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto">Auto-send Notifications</Label>
                    <p className="text-sm text-muted-foreground">Automatically send system notifications</p>
                  </div>
                  <Switch
                    id="auto"
                    checked={settings.autoSend}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSend: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Templates</CardTitle>
                <CardDescription>Manage notification templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Bell className="h-6 w-6" />
                    <span>System Alert</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    <span>Security Warning</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-6 w-6" />
                    <span>Scheduled Maintenance</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Mail className="h-6 w-6" />
                    <span>General Notice</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};