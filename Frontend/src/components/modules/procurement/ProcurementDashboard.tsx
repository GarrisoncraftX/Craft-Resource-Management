import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Users, TrendingUp, Clock, CheckCircle, Plus } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';
import { mockTenders, mockRequisitions, mockVendors, mockProcurementMetrics } from '@/services/mockData/procurement';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { RequisitionFormDialog } from './RequisitionFormDialog';
import { TenderFormDialog } from './TenderFormDialog';
import { VendorFormDialog } from './VendorFormDialog';
import { ContractFormDialog } from './ContractFormDialog';

export const ProcurementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTenders, setActiveTenders] = useState<typeof mockTenders>(mockTenders);
  const [recentRequisitions, setRecentRequisitions] = useState<typeof mockRequisitions>(mockRequisitions);
  const [vendors, setVendors] = useState<typeof mockVendors>(mockVendors);
  const [procurementMetrics, setProcurementMetrics] = useState<typeof mockProcurementMetrics>(mockProcurementMetrics);
  const [requisitionDialogOpen, setRequisitionDialogOpen] = useState(false);
  const [tenderDialogOpen, setTenderDialogOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tendersData, requisitionsData, vendorsData, metricsData] = await Promise.all([
        procurementApiService.getTenders().catch(() => mockTenders) as Promise<typeof mockTenders>,
        procurementApiService.getProcurementRequests().catch(() => mockRequisitions) as Promise<typeof mockRequisitions>,
        procurementApiService.getVendors().catch(() => mockVendors) as Promise<typeof mockVendors>,
        procurementApiService.getProcurementActivityReport().catch(() => mockProcurementMetrics) as Promise<typeof mockProcurementMetrics>
      ]);
      setActiveTenders(tendersData);
      setRecentRequisitions(requisitionsData);
      setVendors(vendorsData);
      setProcurementMetrics(metricsData);
    } catch (error) {
      console.error('Error loading procurement data:', error);
    }
  };

  const spendByCategory = [
    { name: 'IT Equipment', value: 450000 },
    { name: 'Office Supplies', value: 180000 },
    { name: 'Services', value: 320000 },
    { name: 'Software', value: 295000 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Procurement Module</h1>
          <p className="text-gray-600">Supply chain and vendor management</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend (YTD)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${procurementMetrics.totalSpend.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{procurementMetrics.activeContracts}</div>
              <p className="text-xs text-muted-foreground">3 expiring this quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requisitions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{procurementMetrics.pendingRequisitions}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${procurementMetrics.costSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">7.2% of total spend</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
            <TabsTrigger value="tendering">Tendering</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Requisitions</CardTitle>
                  <CardDescription>Latest procurement requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentRequisitions.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.id}</TableCell>
                          <TableCell>{req.department}</TableCell>
                          <TableCell>{req.item}</TableCell>
                          <TableCell>
                          <Badge variant={req.status === 'approved' || req.status === 'submitted' ? 'default' : 'secondary'}>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${req.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Tenders</CardTitle>
                  <CardDescription>Current bidding processes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeTenders.map((tender) => (
                      <div key={tender.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{tender.title}</p>
                          <p className="text-sm text-gray-600">{tender.bidders} bidders • Deadline: {tender.deadline}</p>
                          <p className="text-xs text-gray-500">Value: ${tender.value.toLocaleString()}</p>
                        </div>
                        <Badge variant={tender.status === 'published' || tender.status === 'awarded' ? 'default' : 'secondary'}>
                          {tender.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="planning">
            <Card>
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
                <CardDescription>Procurement spending distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={spendByCategory} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {spendByCategory.map((entry, index) => (<Cell key={entry.name} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requisitions">
            <Card>
              <CardHeader>
                <CardTitle>Requisition & Approval Workflows</CardTitle>
                <CardDescription>Manage procurement requests and approvals</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.requisitions.create']}>
                  <Button onClick={() => setRequisitionDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Requisition
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRequisitions.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.id}</TableCell>
                        <TableCell>{req.department}</TableCell>
                        <TableCell>{req.item}</TableCell>
                        <TableCell><Badge>{req.status}</Badge></TableCell>
                        <TableCell>${req.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tendering">
            <Card>
              <CardHeader>
                <CardTitle>Solicitation & Tendering</CardTitle>
                <CardDescription>Manage bid processes and evaluations</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.tendering.create']}>
                  <Button onClick={() => setTenderDialogOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create New Tender
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Bidders</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTenders.map((tender) => (
                      <TableRow key={tender.id}>
                        <TableCell className="font-medium">{tender.id}</TableCell>
                        <TableCell>{tender.title}</TableCell>
                        <TableCell>{tender.bidders}</TableCell>
                        <TableCell>{tender.deadline}</TableCell>
                        <TableCell><Badge>{tender.status}</Badge></TableCell>
                        <TableCell>${tender.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle>Contract Management</CardTitle>
                <CardDescription>Manage supplier contracts and agreements</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.contracts.create']}>
                  <Button onClick={() => setContractDialogOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    New Contract
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[{ name: 'Active', value: 34 }, { name: 'Expiring', value: 3 }, { name: 'Expired', value: 5 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>Supplier database and performance tracking</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.vendors.create']}>
                  <Button onClick={() => setVendorDialogOpen(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Add New Vendor
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Contracts</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.name}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            {vendor.rating}
                          </div>
                        </TableCell>
                        <TableCell>{vendor.contracts}</TableCell>
                        <TableCell>${vendor.totalValue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                            {vendor.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <RequisitionFormDialog open={requisitionDialogOpen} onOpenChange={setRequisitionDialogOpen} onSuccess={loadData} />
      <TenderFormDialog open={tenderDialogOpen} onOpenChange={setTenderDialogOpen} onSuccess={loadData} />
      <VendorFormDialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen} onSuccess={loadData} />
      <ContractFormDialog open={contractDialogOpen} onOpenChange={setContractDialogOpen} onSuccess={loadData} />
    </div>
  );
};