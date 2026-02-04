import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Calendar, Award, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import type { User } from '@/services/javabackendapi/hrApi';
import { AddTrainingForm } from './forms/AddTrainingForm';
import { EnrollEmployeeTrainingForm } from './forms/EnrollEmployeeTrainingForm';
import { AddCertificationForm } from './forms/AddCertificationForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { mockMonthlyTraining } from '@/services/mockData/hr';

export const TrainingDevelopment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('programs');
  const [trainingCourses, setTrainingCourses] = useState<Array<{
    id?: number;
    name: string;
    duration: number;
    cost: number;
  }>>([]);
  const [employeeTrainings, setEmployeeTrainings] = useState<Array<{
    id?: number;
    employeeId: number;
    trainingCourseId: number;
    status: string;
    startDate: string;
    endDate: string;
  }>>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [courses, trainings, empList] = await Promise.all([
        hrApiService.getAllTrainingCourses(),
        hrApiService.getAllEmployeeTrainings(),
        hrApiService.listEmployees()
      ]);
      setTrainingCourses(courses);
      setEmployeeTrainings(trainings);
      setEmployees(empList);
    } catch (error) {
      console.error('Failed to load training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee ${employeeId}`;
  };

  const getCourseName = (courseId: number) => {
    const course = trainingCourses.find(c => c.id === courseId);
    return course?.name || `Course ${courseId}`;
  };

  const completionRate = employeeTrainings.length > 0 
    ? (employeeTrainings.filter(t => t.status === 'completed').length / employeeTrainings.length * 100).toFixed(0)
    : 0;

  const filteredCourses = trainingCourses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusData = [
    { name: 'Completed', value: employeeTrainings.filter(t => t.status === 'completed').length },
    { name: 'In Progress', value: employeeTrainings.filter(t => t.status === 'in-progress').length },
    { name: 'Not Started', value: employeeTrainings.filter(t => t.status === 'not-started').length },
  ];

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="min-h-screen flex-1 flex flex-col p-2 sm:p-4 md:p-6 bg-background">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Training & Development</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage employee training programs and certifications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEnrollForm(true)} className="text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Enroll Employee</span>
              <span className="sm:hidden">Enroll</span>
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">New Training Program</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Training Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainingCourses.length}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeeTrainings.length}</div>
              <p className="text-xs text-muted-foreground">Across all programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">+5% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Budget</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${trainingCourses.reduce((sum, c) => sum + (c.cost || 0), 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Used this year</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 h-auto sm:h-10">
            <TabsTrigger value="programs" className="text-xs sm:text-sm">Training Programs</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm">Employee Progress</TabsTrigger>
            <TabsTrigger value="certifications" className="text-xs sm:text-sm">Certifications</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Training Programs</CardTitle>
                <CardDescription>Find programs by title, category, or status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search training programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Programs</CardTitle>
                <CardDescription>Manage all training programs and workshops</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No training programs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCourses.map((course) => {
                        const enrollments = employeeTrainings.filter(t => t.trainingCourseId === course.id).length;
                        return (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.name}</TableCell>
                            <TableCell>Technical Skills</TableCell>
                            <TableCell>{course.duration} hours</TableCell>
                            <TableCell>{enrollments}</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>
                              <Badge variant="default">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <TooltipProvider delayDuration={200}>
                                  <UITooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit Program</p>
                                    </TooltipContent>
                                  </UITooltip>
                                </TooltipProvider>
                                <TooltipProvider delayDuration={200}>
                                  <UITooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Program</p>
                                    </TooltipContent>
                                  </UITooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Training Progress</CardTitle>
                <CardDescription>Track individual employee progress in training programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {employeeTrainings.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No employee training progress to display
                    </div>
                  ) : (
                    employeeTrainings.map((training) => {
                      const daysSinceStart = training.startDate ? Math.floor((Date.now() - new Date(training.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      const totalDays = training.endDate && training.startDate ? Math.floor((new Date(training.endDate).getTime() - new Date(training.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 1;
                      const progress = totalDays > 0 ? Math.min(100, (daysSinceStart / totalDays) * 100) : 0;
                      
                      return (
                        <div key={training.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">{getEmployeeName(training.employeeId)}</h3>
                              <p className="text-sm text-muted-foreground">{getCourseName(training.trainingCourseId)}</p>
                            </div>
                            <Badge variant={training.status === 'completed' ? 'default' : 'secondary'}>
                              {training.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Progress</span>
                              <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Started: {new Date(training.startDate).toLocaleDateString()}</span>
                              <span>Expected: {new Date(training.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Employee Certifications</CardTitle>
                    <CardDescription>Track and manage employee professional certifications</CardDescription>
                  </div>
                  <Button onClick={() => setShowCertificationForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Issuing Organization</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No certification data available. Click "Add Certification" to get started.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Status Distribution</CardTitle>
                  <CardDescription>Overview of training completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Training Trends</CardTitle>
                  <CardDescription>Enrollments vs Completions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockMonthlyTraining}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Programs by Category</CardTitle>
                  <CardDescription>Distribution of training programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[{ name: 'Technical Skills', value: trainingCourses.length }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Budget Utilization</CardTitle>
                  <CardDescription>Budget spent per training program</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trainingCourses.slice(0, 5).map(c => ({ name: c.name.substring(0, 15), cost: c.cost }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cost" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddTrainingForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm}
        onSuccess={loadData}
      />

      <EnrollEmployeeTrainingForm 
        open={showEnrollForm} 
        onOpenChange={setShowEnrollForm}
        onSuccess={loadData}
      />

      <AddCertificationForm 
        open={showCertificationForm} 
        onOpenChange={setShowCertificationForm}
        onSuccess={loadData}
      />
    </div>
  );
};