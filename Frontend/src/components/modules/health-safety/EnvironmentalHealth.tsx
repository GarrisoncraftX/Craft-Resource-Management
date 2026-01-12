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
import { Leaf, Plus, Search, Thermometer, Droplets, Wind, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { healthSafetyApiService } from '@/services/pythonbackendapi/healthSafetyApi';
import type { EnvironmentalMonitoring } from '@/services/mockData/health-safety';
import { useToast } from '@/hooks/use-toast';

export const EnvironmentalHealth: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalMonitoring[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    parameter: '',
    location: '',
    threshold: '',
    unit: '',
    frequency: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEnvironmentalData();
  }, []);

  const loadEnvironmentalData = async () => {
    const data = await healthSafetyApiService.getEnvironmentalData();
    setEnvironmentalData(data);
  };

  const handleSubmit = async () => {
    if (!formData.parameter || !formData.location || !formData.threshold || !formData.unit) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const result = await healthSafetyApiService.addMonitoringPoint({
      parameter: formData.parameter,
      location: formData.location,
      currentValue: 0,
      unit: formData.unit,
      threshold: parseFloat(formData.threshold),
      status: 'Normal',
      lastChecked: new Date().toISOString(),
      trend: 'stable'
    });
    if (result.success) {
      toast({ title: 'Success', description: 'Monitoring point added successfully' });
      setIsOpen(false);
      setFormData({ parameter: '', location: '', threshold: '', unit: '', frequency: '', description: '' });
      loadEnvironmentalData();
    }
  };

  const hourlyTrends = [
    { time: '06:00', airQuality: 42, noise: 65, temperature: 22, humidity: 58 },
    { time: '08:00', airQuality: 45, noise: 72, temperature: 23, humidity: 62 },
    { time: '10:00', airQuality: 48, noise: 78, temperature: 24, humidity: 65 },
    { time: '12:00', airQuality: 52, noise: 80, temperature: 25, humidity: 68 },
    { time: '14:00', airQuality: 49, noise: 75, temperature: 26, humidity: 66 },
    { time: '16:00', airQuality: 46, noise: 73, temperature: 25, humidity: 64 },
    { time: '18:00', airQuality: 43, noise: 68, temperature: 24, humidity: 61 },
  ];

  const complianceData = [
    { category: 'Air Quality', compliance: 95, fill: '#10b981' },
    { category: 'Noise Control', compliance: 88, fill: '#3b82f6' },
    { category: 'Temperature', compliance: 92, fill: '#f59e0b' },
    { category: 'Waste Management', compliance: 85, fill: '#8b5cf6' },
  ];

  const monthlyAverages = [
    { month: 'Jan', airQuality: 46, noise: 74, temperature: 23, humidity: 62 },
    { month: 'Feb', airQuality: 48, noise: 76, temperature: 24, humidity: 64 },
    { month: 'Mar', airQuality: 44, noise: 73, temperature: 25, humidity: 63 },
    { month: 'Apr', airQuality: 42, noise: 71, temperature: 26, humidity: 61 },
    { month: 'May', airQuality: 45, noise: 75, temperature: 27, humidity: 65 },
    { month: 'Jun', airQuality: 47, noise: 77, temperature: 28, humidity: 67 },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      'Good': 'success',
      'Normal': 'success',
      'Warning': 'warning',
      'Critical': 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  const getParameterIcon = (parameter: string) => {
    switch (parameter) {
      case 'Air Quality Index':
        return <Wind className="h-4 w-4 text-blue-600" />;
      case 'Noise Level':
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'Temperature':
        return <Thermometer className="h-4 w-4 text-red-600" />;
      case 'Humidity':
        return <Droplets className="h-4 w-4 text-cyan-600" />;
      default:
        return <Leaf className="h-4 w-4 text-green-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'decreasing':
        return <TrendingUp className="h-4 w-4 text-green-600 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const filteredData = environmentalData.filter(item => {
    const matchesSearch = item.parameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.status === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Environmental Health</h1>
          <p className="text-muted-foreground">Monitor environmental parameters and compliance</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Monitoring Point
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Environmental Monitoring Point</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="parameter">Parameter</Label>
                <Select value={formData.parameter} onValueChange={(v) => setFormData({...formData, parameter: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parameter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Air Quality Index">Air Quality Index</SelectItem>
                    <SelectItem value="Noise Level">Noise Level</SelectItem>
                    <SelectItem value="Temperature">Temperature</SelectItem>
                    <SelectItem value="Humidity">Humidity</SelectItem>
                    <SelectItem value="CO2 Levels">CO2 Levels</SelectItem>
                    <SelectItem value="Lighting Levels">Lighting Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Monitoring location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input id="threshold" type="number" placeholder="Alert threshold" value={formData.threshold} onChange={(e) => setFormData({...formData, threshold: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" placeholder="Measurement unit" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
                </div>
              </div>
              <div>
                <Label htmlFor="frequency">Monitoring Frequency</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({...formData, frequency: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continuous">Continuous</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Additional details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <Button className="w-full" onClick={handleSubmit}>Add Monitoring Point</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Air Quality</CardTitle>
            <Wind className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 AQI</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Good</span> quality
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5°C</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Within range</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Humidity Level</CardTitle>
            <Droplets className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">Approaching limit</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Environmental Trends</CardTitle>
            <CardDescription>Real-time monitoring of key parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="airQuality" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="temperature" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Scores</CardTitle>
            <CardDescription>Environmental compliance by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={complianceData}>
                <RadialBar dataKey="compliance" cornerRadius={10} fill="#8884d8" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Environmental Averages</CardTitle>
            <CardDescription>Long-term trends in environmental parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="airQuality" stroke="#3b82f6" strokeWidth={2} name="Air Quality" />
                <Line type="monotone" dataKey="noise" stroke="#f59e0b" strokeWidth={2} name="Noise Level" />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature" />
                <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2} name="Humidity" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Environmental Monitoring Points
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search monitoring points..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getParameterIcon(item.parameter)}
                    {item.parameter}
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <span className="font-mono">
                      {item.currentValue} {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-muted-foreground">
                      {item.threshold} {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    {getTrendIcon(item.trend)}
                    <span className="capitalize text-sm">{item.trend}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.lastChecked}
                  </TableCell>
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