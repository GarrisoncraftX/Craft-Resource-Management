import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FileText, BarChart3, Download, Calendar, Filter, TrendingUp, Users, DollarSign, Clock, Brain, AlertCircle, CheckCircle } from 'lucide-react';

export const ReportsDashboard: React.FC = () => {
  const [reportBuilderDialog, setReportBuilderDialog] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Mock data for analytics
  const departmentPerformanceData = [
    { department: 'Finance', efficiency: 92, productivity: 88, satisfaction: 95 },
    { department: 'HR', efficiency: 89, productivity: 91, satisfaction: 93 },
    { department: 'Security', efficiency: 95, productivity: 87, satisfaction: 90 },
    { department: 'Assets', efficiency: 87, productivity: 89, satisfaction: 88 },
    { department: 'Legal', efficiency: 90, productivity: 85, satisfaction: 92 },
    { department: 'Procurement', efficiency: 85, productivity: 92, satisfaction: 87 }
  ];

  const monthlyTrendsData = [
    { month: 'Jan', revenue: 450000, expenses: 320000, employees: 245, incidents: 3 },
    { month: 'Feb', revenue: 480000, expenses: 335000, employees: 248, incidents: 2 },
    { month: 'Mar', revenue: 520000, expenses: 348000, employees: 252, incidents: 1 },
    { month: 'Apr', revenue: 490000, expenses: 342000, employees: 255, incidents: 4 },
    { month: 'May', revenue: 530000, expenses: 356000, employees: 258, incidents: 2 },
    { month: 'Jun', revenue: 560000, expenses: 365000, employees: 262, incidents: 1 }
  ];

  const aiInsightsData = [
    {
      id: 1,
      type: 'anomaly',
      severity: 'high',
      title: 'Unusual Spending Pattern Detected',
      description: 'Procurement expenses have increased 25% above normal baseline in the past week.',
      department: 'Procurement',
      confidence: 94,
      date: '2024-07-02'
    },
    {
      id: 2,
      type: 'prediction',
      severity: 'medium',
      title: 'Budget Overrun Forecast',
      description: 'HR department is projected to exceed quarterly budget by 8% based on current spending trends.',
      department: 'HR',
      confidence: 87,
      date: '2024-07-01'
    },
    {
      id: 3,
      type: 'optimization',
      severity: 'low',
      title: 'Efficiency Improvement Opportunity',
      description: 'Asset maintenance scheduling could be optimized to reduce costs by 12%.',
      department: 'Assets',
      confidence: 92,
      date: '2024-06-30'
    }
  ];

  const reportHistoryData = [
    { id: 'RPT001', name: 'Monthly Financial Summary', type: 'Financial', generated: '2024-07-01', status: 'Generated', size: '2.4MB' },
    { id: 'RPT002', name: 'HR Performance Report', type: 'HR', generated: '2024-06-30', status: 'Generated', size: '1.8MB' },
    { id: 'RPT003', name: 'Security Incident Analysis', type: 'Security', generated: '2024-06-29', status: 'Generated', size: '3.2MB' },
    { id: 'RPT004', name: 'Procurement Efficiency Report', type: 'Procurement', generated: '2024-06-28', status: 'Failed', size: '0MB' },
    { id: 'RPT005', name: 'Asset Utilization Report', type: 'Assets', generated: '2024-06-27', status: 'Generated', size: '1.5MB' }
  ];

  const chartConfig = {
    efficiency: { label: 'Efficiency %', color: 'hsl(var(--chart-1))' },
    productivity: { label: 'Productivity %', color: 'hsl(var(--chart-2))' },
    satisfaction: { label: 'Satisfaction %', color: 'hsl(var(--chart-3))' },
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
    expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
    employees: { label: 'Employees', color: 'hsl(var(--chart-3))' },
    incidents: { label: 'Incidents', color: 'hsl(var(--chart-4))' }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Generated': 'default',
      'Failed': 'destructive',
      'Processing': 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'high': 'destructive',
      'medium': 'secondary',
      'low': 'outline'
    };
    return <Badge variant={variants[severity] || 'outline'}>{severity}</Badge>;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'prediction': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'optimization': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate insights, custom reports, and track key performance indicators</p>
          </div>
          <div className="flex gap-2">
            <PermissionGuard requiredPermissions={['reports.create']}>
              <Dialog open={reportBuilderDialog} onOpenChange={setReportBuilderDialog}>
                <DialogTrigger asChild>
                  <Button><FileText className="mr-2 h-4 w-4" />Build Custom Report</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Custom Report Builder</DialogTitle>
                    <DialogDescription>Create a customized report with specific data and filters</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reportName">Report Name</Label>
                        <Input id="reportName" placeholder="Enter report name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reportType">Report Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financial">Financial Report</SelectItem>
                            <SelectItem value="hr">HR Performance</SelectItem>
                            <SelectItem value="operational">Operational Metrics</SelectItem>
                            <SelectItem value="custom">Custom Analysis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Data Sources</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Finance', 'HR', 'Security', 'Assets', 'Procurement', 'Legal'].map((dept) => (
                          <div key={dept} className="flex items-center space-x-2">
                            <Checkbox id={dept.toLowerCase()} />
                            <Label htmlFor={dept.toLowerCase()}>{dept}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateRange">Date Range</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="quarter">Last Quarter</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="format">Output Format</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Report</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                            <SelectItem value="csv">CSV Data</SelectItem>
                            <SelectItem value="dashboard">Interactive Dashboard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filters">Additional Filters</Label>
                      <Textarea id="filters" placeholder="Specify any additional filtering criteria or custom requirements..." />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1">Generate Report</Button>
                      <Button variant="outline" onClick={() => setReportBuilderDialog(false)}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </PermissionGuard>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Data</Button>
          </div>
        </div>

        {/* Global Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Global Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="dateRangeFilter">Date Range:</Label>
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="departmentFilter">Department:</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="assets">Assets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$560,000</div>
              <p className="text-xs text-muted-foreground">+5.8% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">262</div>
              <p className="text-xs text-muted-foreground">+4 new hires this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>Automated anomaly detection and predictive analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsightsData.map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-semibold">{insight.title}</h4>
                      {getSeverityBadge(insight.severity)}
                    </div>
                    <div className="text-sm text-muted-foreground">{insight.date}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Department: <strong>{insight.department}</strong></span>
                    <span className="text-sm">Confidence: <strong>{insight.confidence}%</strong></span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Take Action</Button>
                    <Button size="sm" variant="ghost">Dismiss</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview Analytics</TabsTrigger>
            <TabsTrigger value="department">Department Performance</TabsTrigger>
            <TabsTrigger value="reports">Report Management</TabsTrigger>
            <TabsTrigger value="builder">Custom Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Revenue, expenses, and key metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="revenue" stackId="1" stroke="var(--color-revenue)" fill="var(--color-revenue)" />
                        <Area type="monotone" dataKey="expenses" stackId="1" stroke="var(--color-expenses)" fill="var(--color-expenses)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Employee & Incident Trends</CardTitle>
                  <CardDescription>Workforce growth and safety metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line yAxisId="left" type="monotone" dataKey="employees" stroke="var(--color-employees)" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="incidents" stroke="var(--color-incidents)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="department" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance Analysis</CardTitle>
                <CardDescription>Efficiency, productivity, and satisfaction metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="efficiency" fill="var(--color-efficiency)" />
                      <Bar dataKey="productivity" fill="var(--color-productivity)" />
                      <Bar dataKey="satisfaction" fill="var(--color-satisfaction)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report History & Management</CardTitle>
                <CardDescription>View, download, and manage generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input placeholder="Search reports..." className="max-w-sm" />
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report ID</TableHead>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Generated Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>File Size</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportHistoryData.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.id}</TableCell>
                          <TableCell>{report.name}</TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>{report.generated}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell>{report.size}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" disabled={report.status === 'Failed'}>
                                <Download className="mr-1 h-3 w-3" />Download
                              </Button>
                              <Button size="sm" variant="outline">View</Button>
                              <PermissionGuard requiredPermissions={['reports.delete']}>
                                <Button size="sm" variant="outline">Delete</Button>
                              </PermissionGuard>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Report Builder</CardTitle>
                <CardDescription>Create complex, multi-source reports with custom analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Templates</h3>
                    <div className="grid gap-3">
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Executive Summary</div>
                          <div className="text-sm text-muted-foreground">High-level KPIs and insights</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Financial Performance</div>
                          <div className="text-sm text-muted-foreground">Revenue, expenses, and budget analysis</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Operational Efficiency</div>
                          <div className="text-sm text-muted-foreground">Process metrics and performance indicators</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Compliance Report</div>
                          <div className="text-sm text-muted-foreground">Regulatory and policy compliance status</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Report Preview</h3>
                    <div className="border rounded-lg p-4 bg-muted/10 min-h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Select a template or build custom report to see preview</p>
                      </div>
                    </div>
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