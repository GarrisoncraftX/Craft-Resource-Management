import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, Calendar, DollarSign, FileText, Plus } from 'lucide-react';

const procurementPlans = [
  {
    id: 'PROC001',
    item: 'Office Laptops (50 units)',
    category: 'IT Equipment', 
    budget: 75000,
    spent: 0,
    status: 'Planning',
    priority: 'High',
    targetDate: '2024-03-15',
    progress: 25
  },
  {
    id: 'PROC002',
    item: 'Annual Software Licenses',
    category: 'Software',
    budget: 25000,
    spent: 18500,
    status: 'In Progress',
    priority: 'Medium',
    targetDate: '2024-02-28',
    progress: 74
  },
  {
    id: 'PROC003',
    item: 'Security System Upgrade',
    category: 'Security',
    budget: 120000,
    spent: 120000,
    status: 'Completed',
    priority: 'High',
    targetDate: '2024-01-31',
    progress: 100
  },
];

export const ProcurementPlanning: React.FC = () => {
  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Procurement Planning</h1>
            <p className="text-muted-foreground">Strategic planning and budgeting for procurement activities</p>
          </div>
          <Button>
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
              <div className="text-2xl font-bold">$850K</div>
              <p className="text-xs text-muted-foreground">FY 2024 allocation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilized</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$485K</div>
              <p className="text-xs text-muted-foreground">57% of total budget</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">On-time completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Procurement Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Procurement Plans</CardTitle>
            <CardDescription>Current and upcoming procurement initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {procurementPlans.map((plan) => (
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
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-lg font-semibold">${(plan.budget - plan.spent).toLocaleString()}</p>
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
    </div>
  );
};