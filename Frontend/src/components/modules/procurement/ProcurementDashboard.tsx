import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, FileText, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';

export const ProcurementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const activeTenders = [
    { id: 'TND-001', title: 'Office Furniture Supply', bidders: 8, deadline: '2024-02-15', status: 'Open', value: 45000 },
    { id: 'TND-002', title: 'IT Equipment Procurement', bidders: 12, deadline: '2024-02-20', status: 'Evaluation', value: 125000 },
    { id: 'TND-003', title: 'Cleaning Services Contract', bidders: 5, deadline: '2024-02-10', status: 'Awarded', value: 32000 },
  ];

  const recentRequisitions = [
    { id: 'REQ-001', department: 'IT', item: 'Laptops (10 units)', requestor: 'John Tech', status: 'Approved', amount: 15000, date: '2024-01-20' },
    { id: 'REQ-002', department: 'HR', item: 'Training Materials', requestor: 'Jane HR', status: 'Pending', amount: 2500, date: '2024-01-22' },
    { id: 'REQ-003', department: 'Finance', item: 'Accounting Software License', requestor: 'Bob Finance', status: 'Under Review', amount: 8000, date: '2024-01-21' },
  ];

  const vendors = [
    { name: 'TechCorp Solutions', category: 'IT Equipment', rating: 4.8, contracts: 12, totalValue: 245000, status: 'Active' },
    { name: 'Office Plus', category: 'Office Supplies', rating: 4.5, contracts: 8, totalValue: 89000, status: 'Active' },
    { name: 'Clean Masters', category: 'Services', rating: 4.2, contracts: 3, totalValue: 45000, status: 'Under Review' },
  ];

  const procurementMetrics = {
    totalSpend: 1245000,
    activeContracts: 34,
    pendingRequisitions: 12,
    costSavings: 89500
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Procurement Module</h1>
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
                            <Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Pending' ? 'secondary' : 'outline'}>
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
                        <Badge variant={tender.status === 'Open' ? 'default' : tender.status === 'Evaluation' ? 'secondary' : 'outline'}>
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
                <CardTitle>Procurement Planning</CardTitle>
                <CardDescription>Annual and quarterly procurement planning</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.planning.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Procurement Plan
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Q1 Planning</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress value={85} className="mb-2" />
                        <p className="text-sm text-gray-600">85% Complete</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Q2 Planning</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress value={45} className="mb-2" />
                        <p className="text-sm text-gray-600">45% Complete</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Q3 Planning</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress value={15} className="mb-2" />
                        <p className="text-sm text-gray-600">15% Complete</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requisitions">
            <Card>
              <CardHeader>
                <CardTitle>Requisition & Approval Workflows</CardTitle>
                <CardDescription>Manage procurement requests and approvals</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.requisitions.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Requisition
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Detailed requisition management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tendering">
            <Card>
              <CardHeader>
                <CardTitle>Solicitation & Tendering</CardTitle>
                <CardDescription>Manage bid processes and evaluations</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.tendering.create']}>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Create New Tender
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tendering and bid evaluation interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle>Contract Management</CardTitle>
                <CardDescription>Manage supplier contracts and agreements</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.contracts.create']}>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    New Contract
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Contract management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>Supplier database and performance tracking</CardDescription>
                <PermissionGuard requiredPermissions={['procurement.vendors.create']}>
                  <Button>
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
                    {vendors.map((vendor, index) => (
                      <TableRow key={index}>
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
                          <Badge variant={vendor.status === 'Active' ? 'default' : 'secondary'}>
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
    </div>
  );
};