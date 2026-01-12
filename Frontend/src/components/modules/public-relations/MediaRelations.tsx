import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Plus, BarChart3, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { publicRelationsApiService, type MediaContact } from '@/services/nodejsbackendapi/publicRelationsApi';
import { mockMediaContacts } from '@/services/mockData/pr';
import { MediaContactFormDialog } from './MediaContactFormDialog';

const mediaTypeData = [
  { name: 'Newspaper', value: 45, color: '#3b82f6' },
  { name: 'Television', value: 30, color: '#ef4444' },
  { name: 'Radio', value: 15, color: '#22c55e' },
  { name: 'Online', value: 10, color: '#f59e0b' }
];

const interactionTrends = [
  { month: 'Jan', interviews: 12, pressConferences: 3, emails: 45 },
  { month: 'Feb', interviews: 15, pressConferences: 5, emails: 52 },
  { month: 'Mar', interviews: 8, pressConferences: 2, emails: 38 },
  { month: 'Apr', interviews: 18, pressConferences: 4, emails: 61 },
  { month: 'May', interviews: 22, pressConferences: 6, emails: 68 },
  { month: 'Jun', interviews: 16, pressConferences: 3, emails: 55 }
];

const coverageAnalysis = [
  { outlet: 'Daily News', positive: 8, neutral: 12, negative: 2 },
  { outlet: 'Channel 7', positive: 6, neutral: 15, negative: 4 },
  { outlet: 'FM Radio', positive: 10, neutral: 8, negative: 1 },
  { outlet: 'Online News', positive: 5, neutral: 10, negative: 3 }
];

export const MediaRelations: React.FC = () => {
  const [contacts, setContacts] = useState<MediaContact[]>(mockMediaContacts as MediaContact[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadMediaContacts();
  }, []);

  const loadMediaContacts = async () => {
    try {
      const data = await publicRelationsApiService.getMediaContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading media contacts:', error);
      setContacts(mockMediaContacts as MediaContact[]);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.specialization.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Relations</h1>
            <p className="text-muted-foreground">Manage media contacts and track interactions</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Media Contact
          </Button>
        </div>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contacts">Media Contacts</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Search Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Search by name, organization, or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contacts.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-green-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contacts.filter(c => c.status === 'active').length}</div>
                </CardContent>
              </Card>

              <Card className="bg-purple-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Media Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Media Contacts Directory</CardTitle>
                <CardDescription>Complete list of media contacts and their information</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{contact.organization}</TableCell>
                        <TableCell>{contact.specialization.join(', ')}</TableCell>
                        <TableCell>{contact.lastContacted ? new Date(contact.lastContacted).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={contact.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Interactions Log</CardTitle>
                <CardDescription>Track all interactions with media contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Interaction tracking coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Media Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mediaTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mediaTypeData.map((entry, index) => (
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
                    Interaction Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={interactionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="interviews" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                      <Area type="monotone" dataKey="pressConferences" stackId="1" stroke="#ef4444" fill="#ef4444" />
                      <Area type="monotone" dataKey="emails" stackId="1" stroke="#22c55e" fill="#22c55e" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Coverage Analysis</CardTitle>
                <CardDescription>Analyze sentiment and reach of media coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={coverageAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="outlet" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="positive" fill="#22c55e" name="Positive" />
                    <Bar dataKey="neutral" fill="#f59e0b" name="Neutral" />
                    <Bar dataKey="negative" fill="#ef4444" name="Negative" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <MediaContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={loadMediaContacts} />
    </div>
  );
};
