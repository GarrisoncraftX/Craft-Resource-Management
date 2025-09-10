
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Wrench, TrendingUp, AlertTriangle, Plus, FileText } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';

export const AssetDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const recentAssets = [
    { id: 'AST-001', name: 'Dell Laptop', category: 'IT Equipment', status: 'Active', value: 1200, location: 'IT Department' },
    { id: 'AST-002', name: 'Office Chair', category: 'Furniture', status: 'Active', value: 300, location: 'HR Department' },
    { id: 'AST-003', name: 'Projector', category: 'AV Equipment', status: 'Maintenance', value: 800, location: 'Conference Room A' },
  ];

  const maintenanceSchedule = [
    { asset: 'Server Rack #1', type: 'Preventive', scheduled: '2024-02-01', technician: 'John Tech', status: 'Scheduled' },
    { asset: 'Air Conditioning Unit', type: 'Repair', scheduled: '2024-01-25', technician: 'HVAC Services', status: 'In Progress' },
    { asset: 'Generator', type: 'Inspection', scheduled: '2024-02-05', technician: 'Power Systems', status: 'Scheduled' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Asset Management Module</h1>
          <p className="text-gray-600">Track and manage organizational assets</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+15 acquired this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.4M</div>
              <p className="text-xs text-muted-foreground">+5.2% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Scheduled this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="register">Asset Register</TabsTrigger>
            <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="disposal">Disposal</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assets</CardTitle>
                  <CardDescription>Recently added or updated assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.id}</TableCell>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>
                            <Badge variant={asset.status === 'Active' ? 'default' : 'secondary'}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${asset.value.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>Upcoming maintenance activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceSchedule.map((maintenance, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{maintenance.asset}</p>
                          <p className="text-sm text-gray-600">{maintenance.type} - {maintenance.technician}</p>
                          <p className="text-xs text-gray-500">Scheduled: {maintenance.scheduled}</p>
                        </div>
                        <Badge variant={maintenance.status === 'In Progress' ? 'default' : 'secondary'}>
                          {maintenance.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Asset Register</CardTitle>
                <CardDescription>Complete inventory of all organizational assets</CardDescription>
                <PermissionGuard requiredPermissions={['assets.register.create']}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Asset
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Asset register interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acquisition">
            <Card>
              <CardHeader>
                <CardTitle>Asset Acquisition</CardTitle>
                <CardDescription>Manage new asset purchases and acquisitions</CardDescription>
                <PermissionGuard requiredPermissions={['assets.acquisition.create']}>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    New Acquisition Request
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Asset acquisition interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Management</CardTitle>
                <CardDescription>Schedule and track asset maintenance</CardDescription>
                <PermissionGuard requiredPermissions={['assets.maintenance.schedule']}>
                  <Button>
                    <Wrench className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Maintenance management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disposal">
            <Card>
              <CardHeader>
                <CardTitle>Asset Disposal</CardTitle>
                <CardDescription>Manage end-of-life asset disposal</CardDescription>
                <PermissionGuard requiredPermissions={['assets.disposal.create']}>
                  <Button>Process Disposal</Button>
                </PermissionGuard>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Asset disposal interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
