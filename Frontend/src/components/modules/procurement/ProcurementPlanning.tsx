import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, Calendar, DollarSign, FileText, Plus } from 'lucide-react';
import { mockProcurementPlans, mockProcurementMetrics } from '@/services/mockData/procurement';
import { ProcurementPlanFormDialog } from './ProcurementPlanFormDialog';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

export const ProcurementPlanning: React.FC = () => {
  const [plans, setPlans] = useState(mockProcurementPlans);
  const [metrics, setMetrics] = useState(mockProcurementMetrics);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setPlans(mockProcurementPlans);
      setMetrics(mockProcurementMetrics);
    } catch (error) {
      console.error('Error loading planning data:', error);
    }
  };

  const budgetTrend = [
    { month: 'Jan', budget: 850000, spent: 120000 },
    { month: 'Feb', budget: 850000, spent: 245000 },
    { month: 'Mar', budget: 850000, spent: 365000 },
    { month: 'Apr', budget: 850000, spent: 485000 },
    { month: 'May', budget: 850000, spent: 580000 },
    { month: 'Jun', budget: 850000, spent: 650000 }
  ];
  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Procurement Planning</h1>
            <p className="text-muted-foreground">Strategic planning and budgeting for procurement activities</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Procurement Plan
          </Button>
        </div>

        {/* Planning Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(metrics.totalBudget / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">FY 2024 allocation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilized</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(metrics.budgetUtilized / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">{Math.round((metrics.budgetUtilized / metrics.totalBudget) * 100)}% of total budget</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activePlans}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completionRate}%</div>
              <p className="text-xs text-muted-foreground">On-time completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization Trend</CardTitle>
            <CardDescription>Monthly budget vs actual spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={budgetTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="budget" stroke="#8884d8" name="Budget" />
                <Line type="monotone" dataKey="spent" stroke="#82ca9d" name="Spent" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Procurement Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Procurement Plans</CardTitle>
            <CardDescription>Current and upcoming procurement initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{plan.item}</h3>
                      <p className="text-sm text-muted-foreground">{plan.category} • Target: {plan.targetDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={plan.priority === 'High' ? 'destructive' : plan.priority === 'Medium' ? 'default' : 'secondary'}>
                        {plan.priority}
                      </Badge>
                      <Badge variant={plan.status === 'Completed' ? 'default' : plan.status === 'In Progress' ? 'secondary' : 'outline'}>
                        {plan.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-lg font-semibold">${plan.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spent</p>
                      <p className="text-lg font-semibold">${plan.spent.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ProcurementPlanFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={loadData} />
    </div>
  );
};