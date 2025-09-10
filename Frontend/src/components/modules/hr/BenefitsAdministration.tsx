import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Heart, Shield, Car, Plane, Plus, Settings } from 'lucide-react';

const benefitPlans = [
  {
    id: 'HEALTH001',
    name: 'Premium Health Insurance',
    type: 'Health',
    coverage: 'Medical, Dental, Vision',
    enrolled: 142,
    eligible: 156,
    cost: 450,
    icon: Heart
  },
  {
    id: 'LIFE001',
    name: 'Life Insurance',
    type: 'Life',
    coverage: '2x Annual Salary',
    enrolled: 138,
    eligible: 156,
    cost: 25,
    icon: Shield
  },
  {
    id: 'TRANS001',
    name: 'Transportation Allowance',
    type: 'Transportation',
    coverage: 'Monthly Transit Pass',
    enrolled: 89,
    eligible: 156,
    cost: 120,
    icon: Car
  },
  {
    id: 'VACATION001',
    name: 'Additional Vacation Days',
    type: 'Time Off',
    coverage: '5 Extra Days',
    enrolled: 95,
    eligible: 156,
    cost: 0,
    icon: Plane
  },
];

const enrollmentData = [
  { 
    employee: 'John Doe', 
    healthInsurance: 'Enrolled', 
    lifeInsurance: 'Enrolled', 
    transportation: 'Not Enrolled', 
    vacation: 'Enrolled',
    totalCost: 475
  },
  { 
    employee: 'Jane Smith', 
    healthInsurance: 'Enrolled', 
    lifeInsurance: 'Enrolled', 
    transportation: 'Enrolled', 
    vacation: 'Not Enrolled',
    totalCost: 595
  },
  { 
    employee: 'Mike Johnson', 
    healthInsurance: 'Enrolled', 
    lifeInsurance: 'Not Enrolled', 
    transportation: 'Enrolled', 
    vacation: 'Enrolled',
    totalCost: 570
  },
];

export const BenefitsAdministration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Benefits Administration</h1>
            <p className="text-muted-foreground">Manage employee benefits and enrollment</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Plans
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Benefit Plans</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Benefits Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Benefits Cost</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$89,250</div>
                  <p className="text-xs text-muted-foreground">Monthly cost</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">91%</div>
                  <p className="text-xs text-muted-foreground">142 of 156 eligible</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">Available to employees</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Enrollment</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">Days remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Enrollment by Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment by Benefit Plan</CardTitle>
                <CardDescription>Current enrollment status across all benefit plans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefitPlans.map((plan) => {
                  const Icon = plan.icon;
                  const enrollmentRate = (plan.enrolled / plan.eligible) * 100;
                  return (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Icon className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-medium">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.coverage}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{plan.enrolled}/{plan.eligible}</span>
                          <Badge variant="outline">{enrollmentRate.toFixed(0)}%</Badge>
                        </div>
                        <Progress value={enrollmentRate} className="w-32" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Benefit Plans</CardTitle>
                <CardDescription>Manage available benefit plans and their details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Monthly Cost</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benefitPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.type}</TableCell>
                        <TableCell>{plan.coverage}</TableCell>
                        <TableCell>${plan.cost}</TableCell>
                        <TableCell>{plan.enrolled}/{plan.eligible}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrollment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Enrollment Status</CardTitle>
                <CardDescription>Individual employee benefit enrollment details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Health Insurance</TableHead>
                      <TableHead>Life Insurance</TableHead>
                      <TableHead>Transportation</TableHead>
                      <TableHead>Vacation</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollmentData.map((enrollment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{enrollment.employee}</TableCell>
                        <TableCell>
                          <Badge variant={enrollment.healthInsurance === 'Enrolled' ? 'default' : 'secondary'}>
                            {enrollment.healthInsurance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={enrollment.lifeInsurance === 'Enrolled' ? 'default' : 'secondary'}>
                            {enrollment.lifeInsurance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={enrollment.transportation === 'Enrolled' ? 'default' : 'secondary'}>
                            {enrollment.transportation}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={enrollment.vacation === 'Enrolled' ? 'default' : 'secondary'}>
                            {enrollment.vacation}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">${enrollment.totalCost}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Report</CardTitle>
                  <CardDescription>Detailed enrollment statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                  <CardDescription>Benefits cost breakdown and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Utilization Report</CardTitle>
                  <CardDescription>Benefit usage and claims data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};