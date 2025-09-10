import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart3, FileText, Database, Calendar, Download, Settings, Brain, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from 'recharts';

export const ReportBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for various reports
  const financialData = [
    { month: 'Jan', revenue: 2400000, expenses: 1800000, budget: 2200000 },
    { month: 'Feb', revenue: 2600000, expenses: 1900000, budget: 2400000 },
    { month: 'Mar', revenue: 2800000, expenses: 2100000, budget: 2600000 },
    { month: 'Apr', revenue: 2900000, expenses: 2200000, budget: 2700000 },
    { month: 'May', revenue: 3100000, expenses: 2400000, budget: 2900000 },
    { month: 'Jun', revenue: 3300000, expenses: 2600000, budget: 3100000 },
  ];

  const hrMetrics = [
    { department: 'Administration', employees: 45, attendance: 94.2, performance: 4.1 },
    { department: 'Finance', employees: 28, attendance: 96.1, performance: 4.3 },
    { department: 'IT', employees: 32, attendance: 91.8, performance: 4.2 },
    { department: 'HR', employees: 18, attendance: 95.5, performance: 4.0 },
    { department: 'Operations', employees: 52, attendance: 93.7, performance: 3.9 },
  ];

  const assetUtilization = [
    { category: 'Vehicles', total: 156, active: 142, maintenance: 8, idle: 6 },
    { category: 'Equipment', total: 284, active: 251, maintenance: 18, idle: 15 },
    { category: 'Buildings', total: 42, active: 38, maintenance: 3, idle: 1 },
    { category: 'IT Assets', total: 892, active: 834, maintenance: 32, idle: 26 },
  ];

  const incidentTrends = [
    { month: 'Jan', safety: 3, security: 2, environmental: 1 },
    { month: 'Feb', safety: 2, security: 1, environmental: 0 },
    { month: 'Mar', safety: 4, security: 3, environmental: 2 },
    { month: 'Apr', safety: 1, security: 2, environmental: 1 },
    { month: 'May', safety: 3, security: 1, environmental: 0 },
    { month: 'Jun', safety: 2, security: 4, environmental: 1 },
  ];

  const aiInsights = [
    { type: 'Budget Alert', message: 'IT department spending 15% above budget this quarter', severity: 'high', confidence: 92 },
    { type: 'Performance Trend', message: 'Employee satisfaction scores trending upward (+8% this quarter)', severity: 'low', confidence: 87 },
    { type: 'Anomaly Detection', message: 'Unusual spike in facility maintenance costs detected', severity: 'medium', confidence: 94 },
    { type: 'Predictive Alert', message: 'Fleet maintenance due for 12 vehicles in next 30 days', severity: 'medium', confidence: 98 },
  ];

  const reportTemplates = [
    { id: 1, name: 'Monthly Financial Summary', category: 'Finance', frequency: 'Monthly', lastRun: '2024-01-31' },
    { id: 2, name: 'HR Performance Dashboard', category: 'Human Resources', frequency: 'Quarterly', lastRun: '2024-01-15' },
    { id: 3, name: 'Asset Utilization Report', category: 'Assets', frequency: 'Weekly', lastRun: '2024-02-05' },
    { id: 4, name: 'Safety Incident Analysis', category: 'Health & Safety', frequency: 'Monthly', lastRun: '2024-01-31' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive reporting and business intelligence</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Executive Dashboard</TabsTrigger>
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="schedule">Scheduled Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$17.1M</div>
                    <p className="text-xs text-muted-foreground">YTD Performance</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">175</div>
                    <p className="text-xs text-muted-foreground">Full-time equivalent</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Asset Value</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45.2M</div>
                    <p className="text-xs text-muted-foreground">Total asset portfolio</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.8%</div>
                    <p className="text-xs text-muted-foreground">Incident-free days</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Performance</CardTitle>
                    <CardDescription>Revenue vs expenses and budget comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={financialData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${(value as number / 1000000).toFixed(1)}M`} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                        <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                        <Line type="monotone" dataKey="budget" stroke="#ff7300" name="Budget" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Department Performance</CardTitle>
                    <CardDescription>HR metrics by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hrMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="employees" fill="#8884d8" name="Employees" />
                        <Bar dataKey="attendance" fill="#82ca9d" name="Attendance %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Asset Utilization</CardTitle>
                    <CardDescription>Status distribution across asset categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={assetUtilization}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="active" stackId="a" fill="#8884d8" name="Active" />
                        <Bar dataKey="maintenance" stackId="a" fill="#82ca9d" name="Maintenance" />
                        <Bar dataKey="idle" stackId="a" fill="#ffc658" name="Idle" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Safety & Security Incidents</CardTitle>
                    <CardDescription>Monthly incident trends by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={incidentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="safety" stackId="1" stroke="#8884d8" fill="#8884d8" name="Safety" />
                        <Area type="monotone" dataKey="security" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Security" />
                        <Area type="monotone" dataKey="environmental" stackId="1" stroke="#ffc658" fill="#ffc658" name="Environmental" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="builder">
            <Card>
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
                <CardDescription>Create custom reports by selecting data sources and visualizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="reportName">Report Name</Label>
                      <Input id="reportName" placeholder="Enter report name" />
                    </div>
                    <div>
                      <Label htmlFor="dataSource">Data Source</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">Financial Data</SelectItem>
                          <SelectItem value="hr">HR Data</SelectItem>
                          <SelectItem value="assets">Asset Data</SelectItem>
                          <SelectItem value="procurement">Procurement Data</SelectItem>
                          <SelectItem value="safety">Safety Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="chartType">Chart Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                          <SelectItem value="table">Data Table</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Available Fields</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {['Revenue', 'Expenses', 'Employee Count', 'Performance Score', 'Asset Value', 'Incident Count'].map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox id={field} />
                          <Label htmlFor={field} className="text-sm">{field}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last30">Last 30 days</SelectItem>
                          <SelectItem value="last90">Last 90 days</SelectItem>
                          <SelectItem value="thisyear">This year</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="groupBy">Group By</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Group by..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="quarter">Quarter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">Save as Template</Button>
                    <Button>Generate Report</Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Statistical analysis and data mining tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <h3 className="font-semibold">Trend Analysis</h3>
                          <p className="text-sm text-gray-600">Identify patterns and trends in historical data</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <h3 className="font-semibold">Correlation Analysis</h3>
                          <p className="text-sm text-gray-600">Find relationships between different metrics</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <h3 className="font-semibold">Forecasting</h3>
                          <p className="text-sm text-gray-600">Predict future trends and outcomes</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription>Machine learning powered analysis and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={insight.severity === 'high' ? 'destructive' : insight.severity === 'medium' ? 'default' : 'secondary'}>
                                {insight.type}
                              </Badge>
                              <span className="text-sm text-gray-500">Confidence: {insight.confidence}%</span>
                            </div>
                            <p className="text-gray-700">{insight.message}</p>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Anomaly Detection</CardTitle>
                    <CardDescription>Unusual patterns detected in your data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Real-time anomaly detection results will be displayed here.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Models</CardTitle>
                    <CardDescription>Machine learning model predictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Predictive analytics and forecasting models will be shown here.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Pre-configured report templates for common use cases</CardDescription>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.category} • {template.frequency}</p>
                        <p className="text-xs text-gray-500">Last run: {template.lastRun}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button size="sm">Run Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automated report generation and distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Scheduled report management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};