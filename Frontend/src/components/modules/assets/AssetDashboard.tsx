import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Wrench, TrendingUp, AlertTriangle, FileText, BarChart3 } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { assetApiService } from '@/services/javabackendapi/assetApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import type { Asset, MaintenanceRecord } from '@/types/asset';
import type { AssetStats, AssetCategory, AssetTrend, MaintenanceCost } from '@/services/mockData/assets';

export const AssetDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceRecord[]>([]);
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [assetsByCategory, setAssetsByCategory] = useState<AssetCategory[]>([]);
  const [assetTrends, setAssetTrends] = useState<AssetTrend[]>([]);
  const [maintenanceCosts, setMaintenanceCosts] = useState<MaintenanceCost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assets, maintenance, stats, categories, trends, costs] = await Promise.all([
          assetApiService.getAssets(),
          assetApiService.getMaintenanceRecords(),
          assetApiService.getAssetStats(),
          assetApiService.getAssetsByCategory(),
          assetApiService.getAssetTrends(),
          assetApiService.getMaintenanceCosts()
        ]);
        
        setRecentAssets(assets.slice(0, 5));
        setMaintenanceSchedule(maintenance.slice(0, 5));
        setAssetStats(stats);
        setAssetsByCategory(categories);
        setAssetTrends(trends);
        setMaintenanceCosts(costs);
      } catch (error) {
        console.error('Failed to fetch asset data:', error);
      }
    };
    fetchData();
  }, []);

  if (!assetStats) return null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-muted-foreground">Asset Management Module</h1>
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
              <div className="text-2xl font-bold">{assetStats.totalAssets}</div>
              <p className="text-xs text-muted-foreground">{assetStats.activeAssets} active assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${assetStats.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{assetStats.depreciationRate}% depreciation rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.maintenanceAssets}</div>
              <p className="text-xs text-muted-foreground">Assets requiring maintenance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disposed Assets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.disposedAssets}</div>
              <p className="text-xs text-muted-foreground">Completed disposals</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
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
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.assetTag}</TableCell>
                          <TableCell>{asset.assetName}</TableCell>
                          <TableCell>
                            <Badge variant={asset.status === 'Active' ? 'default' : 'secondary'}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${asset.currentValue.toLocaleString()}</TableCell>
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
                    {maintenanceSchedule.map((maintenance) => (
                      <div key={maintenance.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{maintenance.asset}</p>
                          <p className="text-sm text-gray-600">{maintenance.type} - {maintenance.performedBy}</p>
                          <p className="text-xs text-gray-500">Scheduled: {new Date(maintenance.maintenanceDate).toLocaleDateString()}</p>
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

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Assets by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={assetsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Asset Value Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetsByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ category, value }) => `${category}: $${value.toLocaleString()}`}
                      >
                        {assetsByCategory.map((entry) => (
                          <Cell key={entry.category} fill={COLORS[assetsByCategory.indexOf(entry) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Asset Acquisition Trends</CardTitle>
                <CardDescription>Monthly asset acquisitions and disposals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={assetTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="acquisitions" stroke="#10b981" strokeWidth={2} name="Acquisitions" />
                    <Line type="monotone" dataKey="disposals" stroke="#ef4444" strokeWidth={2} name="Disposals" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Cost Analysis</CardTitle>
                  <CardDescription>Monthly maintenance costs by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={maintenanceCosts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                      <Area type="monotone" dataKey="preventive" stackId="1" stroke="#10b981" fill="#10b981" name="Preventive" />
                      <Area type="monotone" dataKey="corrective" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Corrective" />
                      <Area type="monotone" dataKey="emergency" stackId="1" stroke="#ef4444" fill="#ef4444" name="Emergency" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceSchedule.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell className="font-medium">{maintenance.asset}</TableCell>
                          <TableCell>{maintenance.type}</TableCell>
                          <TableCell>{new Date(maintenance.maintenanceDate).toLocaleDateString()}</TableCell>
                          <TableCell>{maintenance.performedBy}</TableCell>
                          <TableCell>
                            <Badge variant={maintenance.status === 'Completed' ? 'default' : 'secondary'}>
                              {maintenance.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
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
