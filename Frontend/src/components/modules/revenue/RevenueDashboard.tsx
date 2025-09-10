import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Building, FileText, TrendingUp, Calculator, Plus } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';

export const RevenueDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const taxAssessments = [
    { id: 'TAX-001', property: '123 Main St', owner: 'John Property', type: 'Residential', value: 450000, tax: 4500, status: 'Current' },
    { id: 'TAX-002', property: '456 Business Ave', owner: 'ABC Corp', type: 'Commercial', value: 1200000, tax: 18000, status: 'Overdue' },
    { id: 'TAX-003', property: '789 Industrial Rd', owner: 'Manufacturing Inc', type: 'Industrial', value: 800000, tax: 12000, status: 'Paid' },
  ];

  const businessPermits = [
    { id: 'BP-001', business: 'Coffee Shop', owner: 'Jane Cafe', type: 'Food Service', fee: 250, status: 'Active', expiry: '2024-12-31' },
    { id: 'BP-002', business: 'Tech Startup', owner: 'Innovation Ltd', type: 'Professional Services', fee: 500, status: 'Renewal Due', expiry: '2024-02-28' },
    { id: 'BP-003', business: 'Retail Store', owner: 'Shopping Co', type: 'Retail', fee: 300, status: 'Active', expiry: '2024-06-30' },
  ];

  const revenueMetrics = {
    totalRevenue: 2840000,
    propertyTax: 1650000,
    businessPermits: 185000,
    collectionRate: 94.2
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Revenue & Tax Module</h1>
          <p className="text-gray-600">Tax assessment and revenue collection</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(revenueMetrics.totalRevenue / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">+8% from last year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Property Tax</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(revenueMetrics.propertyTax / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">Primary revenue source</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Permits</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueMetrics.businessPermits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Annual permit revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueMetrics.collectionRate}%</div>
              <p className="text-xs text-muted-foreground">Above target (90%)</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessment">Tax Assessment</TabsTrigger>
            <TabsTrigger value="management">Tax Management</TabsTrigger>
            <TabsTrigger value="tracking">Revenue Tracking</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="permits">Business Permits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Tax Assessments</CardTitle>
                  <CardDescription>Recent property tax assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Tax Due</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">{assessment.property}</TableCell>
                          <TableCell>{assessment.type}</TableCell>
                          <TableCell>${assessment.value.toLocaleString()}</TableCell>
                          <TableCell>${assessment.tax.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={assessment.status === 'Paid' ? 'default' : assessment.status === 'Current' ? 'secondary' : 'destructive'}>
                              {assessment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Permits</CardTitle>
                  <CardDescription>Active business permit registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {businessPermits.map((permit) => (
                      <div key={permit.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{permit.business}</p>
                          <p className="text-sm text-gray-600">{permit.type} • Fee: ${permit.fee}</p>
                          <p className="text-xs text-gray-500">Expires: {permit.expiry}</p>
                        </div>
                        <Badge variant={permit.status === 'Active' ? 'default' : 'secondary'}>
                          {permit.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessment">
            <Card>
              <CardHeader>
                <CardTitle>Tax Assessment</CardTitle>
                <CardDescription>Property valuation and tax calculation</CardDescription>
                <PermissionGuard requiredPermissions={['revenue.assessment.create']}>
                  <Button>
                    <Calculator className="h-4 w-4 mr-2" />
                    New Assessment
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tax assessment interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management">
            <Card>
              <CardHeader>
                <CardTitle>Tax Management</CardTitle>
                <CardDescription>Manage tax rates and policies</CardDescription>
                <PermissionGuard requiredPermissions={['revenue.tax.manage']}>
                  <Button>Update Tax Rates</Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tax management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Tracking</CardTitle>
                <CardDescription>Monitor revenue streams and collections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Revenue tracking interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collection">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Collection</CardTitle>
                <CardDescription>Manage payment processing and collections</CardDescription>
                <PermissionGuard requiredPermissions={['revenue.collection.process']}>
                  <Button>Process Collections</Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Collection management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permits">
            <Card>
              <CardHeader>
                <CardTitle>Business Permits</CardTitle>
                <CardDescription>Issue and manage business permits</CardDescription>
                <PermissionGuard requiredPermissions={['revenue.permits.issue']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Issue New Permit
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Business permit management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};