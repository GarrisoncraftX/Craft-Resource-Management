import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Building, FileText, TrendingUp, Calculator, Plus } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { fetchTaxAssessments, fetchRevenueCollections } from '@/services/api';
import { mockTaxAssessments, mockBusinessPermits } from '@/services/mockData/revenue';
import { TaxAssessmentForm } from './TaxAssessmentForm';
import { RevenueCollectionForm } from './RevenueCollectionForm';
import { BusinessPermitForm } from './BusinessPermitForm';

export const RevenueDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [taxAssessments, setTaxAssessments] = useState<any[]>([]);
  const [businessPermits, setBusinessPermits] = useState<any[]>(mockBusinessPermits);
  const [loading, setLoading] = useState(true);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showPermitForm, setShowPermitForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const assessments = await fetchTaxAssessments();
      if (Array.isArray(assessments) && assessments.length > 0) {
        const mapped = assessments.map((a: any) => ({
          id: a.id ?? a.assessmentId,
          property: a.propertyAddress ?? a.address,
          owner: a.ownerName ?? a.owner,
          type: a.propertyType ?? a.type,
          value: a.totalValue ?? a.assessedValue,
          tax: a.annualTax ?? a.taxAmount,
          status: a.status,
        }));
        setTaxAssessments(mapped);
      } else {
        setTaxAssessments(mockTaxAssessments.map(a => ({ ...a, property: a.propertyAddress, value: a.totalValue, tax: a.annualTax, owner: a.ownerName, type: a.propertyType })));
      }
    } catch (error) {
      console.warn('Failed to load tax assessments, using fallback', error);
      setTaxAssessments(mockTaxAssessments.map(a => ({ ...a, property: a.propertyAddress, value: a.totalValue, tax: a.annualTax, owner: a.ownerName, type: a.propertyType })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const revenueMetrics = {
    totalRevenue: 2840000,
    propertyTax: taxAssessments.reduce((sum, a) => sum + (Number(a.tax) || 0), 0) || 1650000,
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
                  <Button onClick={() => setShowAssessmentForm(true)}>
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
                  <Button onClick={() => setShowCollectionForm(true)}>Process Collections</Button>
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
                  <Button onClick={() => setShowPermitForm(true)}>
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
      <TaxAssessmentForm open={showAssessmentForm} onOpenChange={setShowAssessmentForm} onSuccess={loadData} />
      <RevenueCollectionForm open={showCollectionForm} onOpenChange={setShowCollectionForm} onSuccess={loadData} />
      <BusinessPermitForm open={showPermitForm} onOpenChange={setShowPermitForm} onSuccess={loadData} />
    </div>
  );
};