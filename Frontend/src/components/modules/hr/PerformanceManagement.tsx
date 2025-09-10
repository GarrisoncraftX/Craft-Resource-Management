import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarIcon, Target, TrendingUp, Users, Calendar, Plus } from 'lucide-react';

const performanceReviews = [
  {
    id: 'PR001',
    employee: 'John Doe',
    reviewPeriod: 'Q4 2023',
    reviewer: 'Sarah Wilson',
    overallScore: 4.2,
    status: 'Completed',
    dueDate: '2024-01-15',
    goals: 5,
    completedGoals: 4
  },
  {
    id: 'PR002',
    employee: 'Jane Smith',
    reviewPeriod: 'Q4 2023',
    reviewer: 'Michael Brown',
    overallScore: 4.7,
    status: 'Completed',
    dueDate: '2024-01-15',
    goals: 6,
    completedGoals: 6
  },
  {
    id: 'PR003',
    employee: 'Mike Johnson',
    reviewPeriod: 'Q1 2024',
    reviewer: 'Sarah Wilson',
    overallScore: null,
    status: 'In Progress',
    dueDate: '2024-04-15',
    goals: 4,
    completedGoals: 2
  },
];

const goals = [
  {
    employee: 'John Doe',
    goal: 'Complete Advanced Leadership Training',
    category: 'Professional Development',
    progress: 80,
    targetDate: '2024-03-31',
    status: 'On Track'
  },
  {
    employee: 'John Doe',
    goal: 'Increase Team Productivity by 15%',
    category: 'Performance',
    progress: 60,
    targetDate: '2024-06-30',
    status: 'On Track'
  },
  {
    employee: 'Jane Smith',
    goal: 'Implement New HR Management System',
    category: 'Process Improvement',
    progress: 100,
    targetDate: '2024-02-28',
    status: 'Completed'
  },
  {
    employee: 'Mike Johnson',
    goal: 'Reduce Processing Time by 20%',
    category: 'Efficiency',
    progress: 25,
    targetDate: '2024-05-31',
    status: 'Behind'
  },
];

const kpiData = [
  {
    employee: 'John Doe',
    position: 'Team Lead',
    productivity: 92,
    quality: 88,
    teamwork: 95,
    innovation: 85,
    overall: 90
  },
  {
    employee: 'Jane Smith',
    position: 'HR Manager',
    productivity: 96,
    quality: 94,
    teamwork: 91,
    innovation: 89,
    overall: 93
  },
  {
    employee: 'Mike Johnson',
    position: 'Analyst',
    productivity: 78,
    quality: 82,
    teamwork: 88,
    innovation: 76,
    overall: 81
  },
];

export const PerformanceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reviews');

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
            <p className="text-muted-foreground">Track and manage employee performance and goals</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Performance Review
          </Button>
        </div>

        {/* Performance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
              <StarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.3/5.0</div>
              <p className="text-xs text-muted-foreground">+0.2 from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">142 of 182 goals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">4.5+ rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
            <TabsTrigger value="goals">Goals & Objectives</TabsTrigger>
            <TabsTrigger value="kpis">Key Performance Indicators</TabsTrigger>
            <TabsTrigger value="reports">Performance Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Reviews</CardTitle>
                <CardDescription>Manage employee performance reviews and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Review Period</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.employee}</TableCell>
                        <TableCell>{review.reviewPeriod}</TableCell>
                        <TableCell>{review.reviewer}</TableCell>
                        <TableCell>
                          {review.overallScore ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.overallScore}</span>
                              <div className="flex">
                                {renderStars(review.overallScore)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>{review.dueDate}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              review.status === 'Completed' ? 'default' : 
                              review.status === 'In Progress' ? 'secondary' : 'outline'
                            }
                          >
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            {review.status !== 'Completed' && (
                              <Button variant="ghost" size="sm">Edit</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Goals & Objectives</CardTitle>
                <CardDescription>Track progress on individual and team goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.map((goal, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{goal.goal}</h3>
                          <p className="text-sm text-muted-foreground">{goal.employee} • {goal.category}</p>
                        </div>
                        <Badge 
                          variant={
                            goal.status === 'Completed' ? 'default' : 
                            goal.status === 'On Track' ? 'secondary' : 'destructive'
                          }
                        >
                          {goal.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Target Date: {goal.targetDate}</span>
                          <Button variant="ghost" size="sm">Update</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Monitor key metrics for employee performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {kpiData.map((employee, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="font-medium">{employee.employee}</h3>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{employee.overall}%</div>
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Productivity</span>
                            <span className="text-sm font-medium">{employee.productivity}%</span>
                          </div>
                          <Progress value={employee.productivity} className="w-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Quality</span>
                            <span className="text-sm font-medium">{employee.quality}%</span>
                          </div>
                          <Progress value={employee.quality} className="w-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Teamwork</span>
                            <span className="text-sm font-medium">{employee.teamwork}%</span>
                          </div>
                          <Progress value={employee.teamwork} className="w-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Innovation</span>
                            <span className="text-sm font-medium">{employee.innovation}%</span>
                          </div>
                          <Progress value={employee.innovation} className="w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>Overall performance metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Goal Achievement Report</CardTitle>
                  <CardDescription>Track goal completion rates and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                  <CardDescription>Analyze performance ratings across teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers Report</CardTitle>
                  <CardDescription>Identify high-performing employees</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Improvement</CardTitle>
                  <CardDescription>Track improvement plans and outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Department and team-level performance</CardDescription>
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