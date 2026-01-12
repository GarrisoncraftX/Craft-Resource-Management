import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Building, Plus } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { planningApiService, UrbanPlan } from '@/services/nodejsbackendapi/planningApi';
import { mockUrbanPlans, mockBudgetAllocation } from '@/services/mockData/planning';
import { UrbanPlanFormDialog } from './UrbanPlanFormDialog';
import { toast } from '@/hooks/use-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const UrbanPlanning: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [urbanPlans, setUrbanPlans] = useState<UrbanPlan[]>(mockUrbanPlans);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  useEffect(() => {
    loadUrbanPlans();
  }, []);

  const loadUrbanPlans = async () => {
    try {
      const data = await planningApiService.getUrbanPlans().catch(() => mockUrbanPlans);
      setUrbanPlans(data);
    } catch (error) {
      console.error('Error loading urban plans:', error);
    }
  };

  const handleCreatePlan = async (plan: Omit<UrbanPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await planningApiService.createUrbanPlan(plan);
      toast({ title: 'Success', description: 'Urban plan created successfully' });
      loadUrbanPlans();
    } catch (error) {
      console.error('Error creating urban plan:', error);
      toast({ title: 'Error', description: 'Failed to create urban plan', variant: 'destructive' });
    }
  };

  const planTypeData = urbanPlans.reduce((acc, plan) => {
    const existing = acc.find(item => item.type === plan.planType);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: plan.planType, count: 1 });
    }
    return acc;
  }, [] as { type: string; count: number }[]);

  const statusData = urbanPlans.reduce((acc, plan) => {
    const existing = acc.find(item => item.status === plan.status);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ status: plan.status, count: 1 });
    }
    return acc;
  }, [] as { status: string; count: number }[]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Urban Planning</h1>
          <p className="text-gray-600">Land use and development planning</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{urbanPlans.length}</div>
              <p className="text-xs text-muted-foreground">Urban development plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Plans</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{urbanPlans.filter(p => p.status === 'approved').length}</div>
              <p className="text-xs text-muted-foreground">Ready for implementation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{urbanPlans.filter(p => p.status === 'review').length}</div>
              <p className="text-xs text-muted-foreground">Pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Implemented</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{urbanPlans.filter(p => p.status === 'implemented').length}</div>
              <p className="text-xs text-muted-foreground">Active plans</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Urban Plans</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plans by Type</CardTitle>
                  <CardDescription>Distribution of urban plan types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={planTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Plans" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Status Distribution</CardTitle>
                  <CardDescription>Current status of all plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.status}: ${entry.count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.status} fill={COLORS[statusData.indexOf(entry) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Urban Development Plans</CardTitle>
                    <CardDescription>Strategic urban planning initiatives</CardDescription>
                  </div>
                  <PermissionGuard requiredPermissions={['planning.urban.create']}>
                    <Button onClick={() => setPlanDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Urban Plan
                    </Button>
                  </PermissionGuard>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Jurisdiction</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Objectives</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urbanPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.title}</TableCell>
                        <TableCell>{plan.planType}</TableCell>
                        <TableCell>
                          <Badge variant={plan.status === 'approved' ? 'default' : 'secondary'}>
                            {plan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{plan.jurisdiction}</TableCell>
                        <TableCell>{plan.planningPeriod.startDate.substring(0, 4)} - {plan.planningPeriod.endDate.substring(0, 4)}</TableCell>
                        <TableCell>{plan.objectives.length} objectives</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Type Analytics</CardTitle>
                  <CardDescription>Urban plan categorization</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={planTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Number of Plans" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Allocation</CardTitle>
                  <CardDescription>Resource distribution across sectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockBudgetAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockBudgetAllocation.map((entry) => (
                          <Cell key={entry.name} fill={COLORS[mockBudgetAllocation.indexOf(entry) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <UrbanPlanFormDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen} onSubmit={handleCreatePlan} />
    </div>
  );
};
