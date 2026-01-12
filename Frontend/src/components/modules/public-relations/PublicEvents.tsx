import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Plus, BarChart3, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { publicRelationsApiService, type PublicEvent } from '@/services/nodejsbackendapi/publicRelationsApi';
import { mockPublicEvents } from '@/services/mockData/pr';
import { PublicEventFormDialog } from './PublicEventFormDialog';

const eventTypeData = [
  { name: 'Meetings', value: 40, color: '#3b82f6' },
  { name: 'Festivals', value: 25, color: '#ef4444' },
  { name: 'Presentations', value: 20, color: '#22c55e' },
  { name: 'Workshops', value: 15, color: '#f59e0b' }
];

const attendanceData = [
  { month: 'Jan', planned: 450, actual: 420 },
  { month: 'Feb', planned: 600, actual: 580 },
  { month: 'Mar', planned: 350, actual: 310 },
  { month: 'Apr', planned: 800, actual: 750 },
  { month: 'May', planned: 550, actual: 520 },
  { month: 'Jun', planned: 700, actual: 680 }
];

const budgetAnalysis = [
  { event: 'Town Hall', budgetUsed: 85, budgetPlanned: 100 },
  { event: 'Festival', budgetUsed: 92, budgetPlanned: 100 },
  { event: 'Workshop', budgetUsed: 78, budgetPlanned: 100 },
  { event: 'Meeting', budgetUsed: 65, budgetPlanned: 100 }
];

export const PublicEvents: React.FC = () => {
  const [events, setEvents] = useState<PublicEvent[]>(mockPublicEvents as PublicEvent[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadPublicEvents();
  }, []);

  const loadPublicEvents = async () => {
    try {
      const data = await publicRelationsApiService.getPublicEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading public events:', error);
      setEvents(mockPublicEvents as PublicEvent[]);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'planned': return 'bg-blue-500';
      case 'ongoing': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Public Events Management</h1>
            <p className="text-muted-foreground">Organize and manage community events and gatherings</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {/* Search and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Search Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Search by title, type, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-green-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.filter(e => e.status === 'planned').length}</div>
                </CardContent>
              </Card>

              <Card className="bg-purple-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.filter(e => new Date(e.eventDate).getMonth() === new Date().getMonth()).length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Events Table */}
            <Card>
              <CardHeader>
                <CardTitle>Events List</CardTitle>
                <CardDescription>Manage all public events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">{event.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{new Date(event.eventDate).toLocaleDateString()}</div>
                              <div className="text-sm text-muted-foreground">{new Date(event.eventDate).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {event.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>
                            Event
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              {event.actualAttendees ? 
                                `${event.actualAttendees}/${event.expectedAttendees}` :
                                `${event.registeredAttendees}/${event.expectedAttendees}`
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Calendar</CardTitle>
                <CardDescription>Visual overview of all scheduled events</CardDescription>
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
                      <div key={i} className="border rounded p-2 h-32 text-sm">
                        <div className="font-medium">{((i % 31) + 1)}</div>
                        {i === 24 && (
                          <div className="mt-1">
                            <Badge className="text-xs bg-blue-500">Town Hall</Badge>
                          </div>
                        )}
                        {i === 19 && (
                          <div className="mt-1">
                            <Badge className="text-xs bg-green-500">Budget</Badge>
                          </div>
                        )}
                        {i === 14 && (
                          <div className="mt-1">
                            <Badge className="text-xs bg-purple-500">Festival</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                    Event Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eventTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {eventTypeData.map((entry, index) => (
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
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Attendance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} name="Planned" />
                      <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} name="Actual" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Event Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Event Performance Summary</CardTitle>
                <CardDescription>Key metrics for recent events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-muted-foreground">Average Attendance Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">$18,200</div>
                    <div className="text-sm text-muted-foreground">Total Budget This Quarter</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">4.2</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Analysis by Event Type</CardTitle>
                <CardDescription>Compare planned vs actual budget usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={budgetAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="event" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="budgetPlanned" fill="#3b82f6" name="Planned Budget %" />
                    <Bar dataKey="budgetUsed" fill="#22c55e" name="Used Budget %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-blue-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$18,300</div>
                </CardContent>
              </Card>

              <Card className="bg-green-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$15,120</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3,180</div>
                </CardContent>
              </Card>

              <Card className="bg-purple-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">82.6%</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <PublicEventFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={loadPublicEvents} />
    </div>
  );
};