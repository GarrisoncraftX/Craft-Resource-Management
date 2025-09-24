import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download} from 'lucide-react';

export const CustomReportBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');



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
          <h1 className="text-2xl font-bold text-blue-900">Custom Report Builder</h1>
          <p className="text-gray-600">Build, customize, and manage your reports</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

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

          
        </Tabs>
      </main>
    </div>
  );
};
