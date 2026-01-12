import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Plus, Search, Calendar, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { healthSafetyApiService } from '@/services/pythonbackendapi/healthSafetyApi';
import type { SafetyInspection } from '@/services/mockData/health-safety';
import { useToast } from '@/hooks/use-toast';

export const SafetyInspections: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inspections, setInspections] = useState<SafetyInspection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    inspector: '',
    scheduledDate: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    const data = await healthSafetyApiService.getInspections();
    setInspections(data);
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.location || !formData.inspector || !formData.scheduledDate) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const result = await healthSafetyApiService.scheduleInspection({
      type: formData.type,
      location: formData.location,
      inspector: formData.inspector,
      scheduledDate: formData.scheduledDate,
      status: 'Scheduled',
      score: null,
      findings: 'Not started',
      nextDue: new Date(new Date(formData.scheduledDate).setMonth(new Date(formData.scheduledDate).getMonth() + 6)).toISOString().split('T')[0]
    });
    if (result.success) {
      toast({ title: 'Success', description: 'Inspection scheduled successfully' });
      setIsOpen(false);
      setFormData({ type: '', location: '', inspector: '', scheduledDate: '', notes: '' });
      loadInspections();
    }
  };

  const monthlyData = [
    { month: 'Jan', completed: 12, failed: 2, scheduled: 8 },
    { month: 'Feb', completed: 15, failed: 1, scheduled: 10 },
    { month: 'Mar', completed: 18, failed: 3, scheduled: 12 },
    { month: 'Apr', completed: 14, failed: 1, scheduled: 9 },
    { month: 'May', completed: 20, failed: 2, scheduled: 15 },
    { month: 'Jun', completed: 16, failed: 1, scheduled: 11 },
  ];

  const inspectionTypes = [
    { name: 'Fire Safety', value: 25, fill: '#ef4444' },
    { name: 'Electrical', value: 20, fill: '#f59e0b' },
    { name: 'Structural', value: 18, fill: '#3b82f6' },
    { name: 'Chemical', value: 15, fill: '#10b981' },
    { name: 'Environmental', value: 22, fill: '#8b5cf6' },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'Completed': 'success',
      'In Progress': 'warning',
      'Scheduled': 'outline',
      'Failed': 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'In Progress':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Safety Inspections</h1>
          <p className="text-muted-foreground">Manage and track safety inspections</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Inspection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="inspection-type">Inspection Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                    <SelectItem value="Electrical Safety">Electrical Safety</SelectItem>
                    <SelectItem value="Structural Integrity">Structural Integrity</SelectItem>
                    <SelectItem value="Chemical Safety">Chemical Safety</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Inspection location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="inspector">Inspector</Label>
                <Select value={formData.inspector} onValueChange={(v) => setFormData({...formData, inspector: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Davis">Mike Davis</SelectItem>
                    <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Scheduled Date</Label>
                <Input id="date" type="date" value={formData.scheduledDate} onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
              <Button className="w-full" onClick={handleSubmit}>Schedule Inspection</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Inspection Overview</CardTitle>
            <CardDescription>Inspection completion and failure rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspection Types Distribution</CardTitle>
            <CardDescription>Breakdown by inspection category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inspectionTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {inspectionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
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
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Inspection Records
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inspections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getStatusIcon(inspection.status)}
                    {inspection.type}
                  </TableCell>
                  <TableCell>{inspection.location}</TableCell>
                  <TableCell>{inspection.inspector}</TableCell>
                  <TableCell>{inspection.scheduledDate}</TableCell>
                  <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                  <TableCell>
                    {inspection.score ? (
                      <span className={inspection.score >= 80 ? 'text-green-600' : inspection.score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                        {inspection.score}%
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{inspection.findings}</TableCell>
                  <TableCell>{inspection.nextDue}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};