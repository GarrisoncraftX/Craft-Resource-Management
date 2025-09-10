import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Building, FileText, DollarSign, Plus, Search } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export const TaxAssessment: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const assessments = [
    { id: 'TA-001', property: '123 Main Street', owner: 'John Smith', type: 'Residential', landValue: 150000, improvementValue: 300000, totalValue: 450000, taxRate: 1.2, annualTax: 5400, status: 'Current' },
    { id: 'TA-002', property: '456 Business Ave', owner: 'ABC Corporation', type: 'Commercial', landValue: 500000, improvementValue: 700000, totalValue: 1200000, taxRate: 2.5, annualTax: 30000, status: 'Under Review' },
    { id: 'TA-003', property: '789 Industrial Road', owner: 'Manufacturing Inc', type: 'Industrial', landValue: 300000, improvementValue: 500000, totalValue: 800000, taxRate: 2.0, annualTax: 16000, status: 'Approved' },
    { id: 'TA-004', property: '321 Residential Lane', owner: 'Jane Doe', type: 'Residential', landValue: 120000, improvementValue: 280000, totalValue: 400000, taxRate: 1.2, annualTax: 4800, status: 'Appeal Filed' },
  ];

  const assessmentTrends = [
    { year: '2020', residential: 450000, commercial: 1100000, industrial: 750000 },
    { year: '2021', residential: 465000, commercial: 1150000, industrial: 780000 },
    { year: '2022', residential: 480000, commercial: 1200000, industrial: 800000 },
    { year: '2023', residential: 495000, commercial: 1250000, industrial: 820000 },
    { year: '2024', residential: 510000, commercial: 1300000, industrial: 850000 },
  ];

  const propertyDistribution = [
    { type: 'Residential', count: 2845, value: 1420000000, color: '#8884d8' },
    { type: 'Commercial', count: 486, value: 890000000, color: '#82ca9d' },
    { type: 'Industrial', count: 124, value: 340000000, color: '#ffc658' },
    { type: 'Agricultural', count: 89, value: 120000000, color: '#ff7300' },
  ];

  const taxRates = [
    { category: 'Residential', rate: 1.2, lastUpdated: '2024-01-01' },
    { category: 'Commercial', rate: 2.5, lastUpdated: '2024-01-01' },
    { category: 'Industrial', rate: 2.0, lastUpdated: '2024-01-01' },
    { category: 'Agricultural', rate: 0.8, lastUpdated: '2024-01-01' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Tax Assessment</h1>
          <p className="text-gray-600">Property valuation and tax calculation</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,544</div>
              <p className="text-xs text-muted-foreground">Assessed properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.77B</div>
              <p className="text-xs text-muted-foreground">Assessed value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Tax</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$42.8M</div>
              <p className="text-xs text-muted-foreground">Projected revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">Under assessment</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assess">Assess Property</TabsTrigger>
            <TabsTrigger value="search">Search & Review</TabsTrigger>
            <TabsTrigger value="rates">Tax Rates</TabsTrigger>
            <TabsTrigger value="appeals">Appeals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Value Trends</CardTitle>
                  <CardDescription>Average property values by type over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={assessmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="residential" stroke="#8884d8" name="Residential" />
                      <Line type="monotone" dataKey="commercial" stroke="#82ca9d" name="Commercial" />
                      <Line type="monotone" dataKey="industrial" stroke="#ffc658" name="Industrial" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Distribution</CardTitle>
                  <CardDescription>Properties by type and total value</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={propertyDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, count }) => `${type}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {propertyDistribution.map((entry, index) => (
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

          <TabsContent value="assess">
            <Card>
              <CardHeader>
                <CardTitle>Property Assessment</CardTitle>
                <CardDescription>Create new property assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="propertyId">Property ID</Label>
                      <Input id="propertyId" placeholder="Enter property ID" />
                    </div>
                    <div>
                      <Label htmlFor="address">Property Address</Label>
                      <Input id="address" placeholder="Enter full address" />
                    </div>
                    <div>
                      <Label htmlFor="owner">Owner Name</Label>
                      <Input id="owner" placeholder="Property owner" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="agricultural">Agricultural</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
                      <Input id="lotSize" type="number" placeholder="Square footage" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="landValue">Land Value ($)</Label>
                      <Input id="landValue" type="number" placeholder="Land value" />
                    </div>
                    <div>
                      <Label htmlFor="improvementValue">Improvement Value ($)</Label>
                      <Input id="improvementValue" type="number" placeholder="Building value" />
                    </div>
                    <div>
                      <Label htmlFor="totalValue">Total Assessed Value</Label>
                      <Input id="totalValue" type="number" placeholder="Total value" readOnly />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">Save Draft</Button>
                    <PermissionGuard requiredPermissions={['revenue.assessment.create']}>
                      <Button>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Assessment
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Search Properties</CardTitle>
                <CardDescription>Find and review property assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input placeholder="Search by address, owner, or property ID" className="flex-1" />
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property ID</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Assessed Value</TableHead>
                      <TableHead>Annual Tax</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.id}</TableCell>
                        <TableCell>{assessment.property}</TableCell>
                        <TableCell>{assessment.owner}</TableCell>
                        <TableCell>{assessment.type}</TableCell>
                        <TableCell>${assessment.totalValue.toLocaleString()}</TableCell>
                        <TableCell>${assessment.annualTax.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            assessment.status === 'Current' ? 'default' : 
                            assessment.status === 'Approved' ? 'default' : 
                            assessment.status === 'Appeal Filed' ? 'destructive' : 'secondary'
                          }>
                            {assessment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>Tax Rate Management</CardTitle>
                <CardDescription>Configure tax rates by property type</CardDescription>
                <PermissionGuard requiredPermissions={['revenue.rates.manage']}>
                  <Button>Update Tax Rates</Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxRates.map((rate, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label>Property Category</Label>
                        <p className="font-medium">{rate.category}</p>
                      </div>
                      <div>
                        <Label>Current Rate (%)</Label>
                        <p className="font-medium">{rate.rate}%</p>
                      </div>
                      <div>
                        <Label>Last Updated</Label>
                        <p className="text-sm text-gray-600">{rate.lastUpdated}</p>
                      </div>
                      <div className="flex items-end">
                        <Button variant="outline" size="sm">Edit Rate</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appeals">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Appeals</CardTitle>
                <CardDescription>Review and process assessment appeals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Assessment appeals processing interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Reports</CardTitle>
                <CardDescription>Generate assessment and tax roll reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Assessment reports and analytics will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};