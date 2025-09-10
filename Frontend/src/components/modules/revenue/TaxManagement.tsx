import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, FileText, DollarSign, TrendingUp, BarChart3, Plus } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const taxRecords = [
  {
    id: 1,
    taxpayerId: 'TAX001',
    taxpayerName: 'John Smith',
    taxType: 'Property Tax',
    assessedValue: 250000,
    taxAmount: 3750,
    dueDate: '2024-03-15',
    status: 'Paid',
    paymentDate: '2024-03-10'
  },
  {
    id: 2,
    taxpayerId: 'TAX002',
    taxpayerName: 'ABC Corporation',
    taxType: 'Business Tax',
    assessedValue: 500000,
    taxAmount: 12500,
    dueDate: '2024-04-15',
    status: 'Overdue',
    paymentDate: null
  },
  {
    id: 3,
    taxpayerId: 'TAX003',
    taxpayerName: 'Smith Enterprises',
    taxType: 'Income Tax',
    assessedValue: 75000,
    taxAmount: 11250,
    dueDate: '2024-02-28',
    status: 'Pending',
    paymentDate: null
  }
];

const taxCollectionTrends = [
  { month: 'Jan', property: 120000, business: 85000, income: 65000, total: 270000 },
  { month: 'Feb', property: 135000, business: 92000, income: 72000, total: 299000 },
  { month: 'Mar', property: 158000, business: 78000, income: 58000, total: 294000 },
  { month: 'Apr', property: 142000, business: 105000, income: 88000, total: 335000 },
  { month: 'May', property: 165000, business: 98000, income: 76000, total: 339000 },
  { month: 'Jun', property: 178000, business: 112000, income: 95000, total: 385000 }
];

const taxTypeDistribution = [
  { name: 'Property Tax', value: 45, amount: 850000, color: '#3b82f6' },
  { name: 'Business Tax', value: 35, amount: 660000, color: '#ef4444' },
  { name: 'Income Tax', value: 20, amount: 380000, color: '#22c55e' }
];

const paymentStatusData = [
  { status: 'Paid', count: 450, amount: 1250000 },
  { status: 'Pending', count: 125, amount: 285000 },
  { status: 'Overdue', count: 85, amount: 195000 },
  { status: 'Appealing', count: 25, amount: 75000 }
];

const complianceMetrics = [
  { category: 'On-Time Payments', current: 85, target: 90, trend: 'up' },
  { category: 'Collection Rate', current: 92, target: 95, trend: 'up' },
  { category: 'Appeal Rate', current: 8, target: 5, trend: 'down' },
  { category: 'Processing Time', current: 12, target: 10, trend: 'stable' }
];

export const TaxManagement: React.FC = () => {
  const [taxRecordsState, setTaxRecords] = useState(taxRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRecords = taxRecordsState.filter(record => {
    const matchesSearch = record.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.taxpayerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.taxType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Overdue': return 'bg-red-500';
      case 'Appealing': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaxTypeColor = (type: string) => {
    switch (type) {
      case 'Property Tax': return 'bg-blue-600';
      case 'Business Tax': return 'bg-purple-600';
      case 'Income Tax': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
            <p className="text-muted-foreground">Comprehensive tax administration and compliance management</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Tax Record
          </Button>
        </div>

        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="records">Tax Records</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Search by taxpayer name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Filter by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="appealing">Appealing</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="bg-blue-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                  <FileText className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredRecords.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-green-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1.89M</div>
                  <p className="text-xs opacity-80">+15% from last year</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Calculator className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$285K</div>
                  <p className="text-xs opacity-80">125 records</p>
                </CardContent>
              </Card>

              <Card className="bg-red-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$195K</div>
                  <p className="text-xs opacity-80">85 records</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-500 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                  <BarChart3 className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs opacity-80">Above target</p>
                </CardContent>
              </Card>
            </div>

            {/* Tax Records Table */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Records</CardTitle>
                <CardDescription>Manage individual tax records and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Taxpayer</TableHead>
                      <TableHead>Tax Type</TableHead>
                      <TableHead>Assessed Value</TableHead>
                      <TableHead>Tax Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.taxpayerName}</div>
                            <div className="text-sm text-muted-foreground">{record.taxpayerId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTaxTypeColor(record.taxType)}>
                            {record.taxType}
                          </Badge>
                        </TableCell>
                        <TableCell>${record.assessedValue.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">${record.taxAmount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(record.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Edit</Button>
                            {record.status === 'Overdue' && (
                              <Button variant="ghost" size="sm" className="text-red-600">
                                Send Notice
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Collection Trends</CardTitle>
                <CardDescription>Monthly collection performance by tax type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={taxCollectionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="property" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="business" stackId="1" stroke="#ef4444" fill="#ef4444" />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentStatusData.map((item) => (
                      <div key={item.status} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          <span>{item.count} records</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collection by Tax Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taxTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taxTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Comprehensive analysis of tax revenue patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={taxCollectionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total Revenue" />
                    <Line type="monotone" dataKey="property" stroke="#3b82f6" strokeWidth={2} name="Property Tax" />
                    <Line type="monotone" dataKey="business" stroke="#ef4444" strokeWidth={2} name="Business Tax" />
                    <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income Tax" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>YTD Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">$1.89M</div>
                  <p className="text-sm text-muted-foreground">+15.2% vs last year</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Average Collection Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">12 days</div>
                  <p className="text-sm text-muted-foreground">-2 days improvement</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Outstanding Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">$480K</div>
                  <p className="text-sm text-muted-foreground">20.3% of total assessed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Metrics</CardTitle>
                <CardDescription>Monitor key compliance indicators and performance targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {complianceMetrics.map((metric) => (
                    <div key={metric.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{metric.category}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.target}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{metric.current}%</div>
                        <div className={`text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} 
                          {metric.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Management Reports</CardTitle>
                <CardDescription>Generate comprehensive tax administration reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    Collection Report
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Revenue Analysis
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Compliance Report
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <DollarSign className="h-6 w-6 mb-2" />
                    Overdue Report
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <Calculator className="h-6 w-6 mb-2" />
                    Assessment Report
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    Annual Summary
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