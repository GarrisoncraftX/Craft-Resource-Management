import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Calendar, Award, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const trainingPrograms = [
  {
    id: 'TRN001',
    title: 'Leadership Development Program',
    category: 'Leadership',
    duration: '8 weeks',
    enrolled: 25,
    capacity: 30,
    startDate: '2024-03-01',
    status: 'Active',
    cost: 2500
  },
  {
    id: 'TRN002',
    title: 'Technical Skills Workshop',
    category: 'Technical',
    duration: '3 days',
    enrolled: 15,
    capacity: 20,
    startDate: '2024-02-15',
    status: 'Completed',
    cost: 800
  },
  {
    id: 'TRN003',
    title: 'Safety Training Certification',
    category: 'Safety',
    duration: '1 day',
    enrolled: 45,
    capacity: 50,
    startDate: '2024-02-28',
    status: 'Upcoming',
    cost: 300
  },
];

const employeeProgress = [
  {
    employee: 'John Doe',
    program: 'Leadership Development Program',
    progress: 65,
    status: 'In Progress',
    startDate: '2024-03-01',
    expectedCompletion: '2024-04-26'
  },
  {
    employee: 'Jane Smith',
    program: 'Technical Skills Workshop',
    progress: 100,
    status: 'Completed',
    startDate: '2024-02-15',
    expectedCompletion: '2024-02-17'
  },
  {
    employee: 'Mike Johnson',
    program: 'Safety Training Certification',
    progress: 0,
    status: 'Enrolled',
    startDate: '2024-02-28',
    expectedCompletion: '2024-02-28'
  },
];

const certifications = [
  {
    employee: 'John Doe',
    certification: 'Project Management Professional (PMP)',
    issueDate: '2023-12-15',
    expiryDate: '2026-12-15',
    status: 'Valid'
  },
  {
    employee: 'Jane Smith',
    certification: 'Certified Public Accountant (CPA)',
    issueDate: '2022-06-20',
    expiryDate: '2025-06-20',
    status: 'Valid'
  },
  {
    employee: 'Mike Johnson',
    certification: 'OSHA Safety Certification',
    issueDate: '2023-03-10',
    expiryDate: '2024-03-10',
    status: 'Expiring Soon'
  },
];

export const TrainingDevelopment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('programs');

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Training & Development</h1>
            <p className="text-muted-foreground">Manage employee training programs and certifications</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Training Program
          </Button>
        </div>

        {/* Training Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85</div>
              <p className="text-xs text-muted-foreground">Across all programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">+5% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Budget</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,600</div>
              <p className="text-xs text-muted-foreground">Used this year</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="programs">Training Programs</TabsTrigger>
            <TabsTrigger value="progress">Employee Progress</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
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
                    {trainingPrograms.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell className="font-medium">{program.title}</TableCell>
                        <TableCell>{program.category}</TableCell>
                        <TableCell>{program.duration}</TableCell>
                        <TableCell>{program.enrolled}/{program.capacity}</TableCell>
                        <TableCell>{program.startDate}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              program.status === 'Active' ? 'default' : 
                              program.status === 'Completed' ? 'secondary' : 'outline'
                            }
                          >
                            {program.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  {employeeProgress.map((progress, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{progress.employee}</h3>
                          <p className="text-sm text-muted-foreground">{progress.program}</p>
                        </div>
                        <Badge 
                          variant={
                            progress.status === 'Completed' ? 'default' : 
                            progress.status === 'In Progress' ? 'secondary' : 'outline'
                          }
                        >
                          {progress.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{progress.progress}%</span>
                        </div>
                        <Progress value={progress.progress} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started: {progress.startDate}</span>
                          <span>Expected: {progress.expectedCompletion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Certifications</CardTitle>
                <CardDescription>Track and manage employee professional certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications.map((cert, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{cert.employee}</TableCell>
                        <TableCell>{cert.certification}</TableCell>
                        <TableCell>{cert.issueDate}</TableCell>
                        <TableCell>{cert.expiryDate}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              cert.status === 'Valid' ? 'default' : 'destructive'
                            }
                          >
                            {cert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Renew</Button>
                          </div>
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
                  <CardTitle>Training Effectiveness Report</CardTitle>
                  <CardDescription>Analyze training program outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills Gap Analysis</CardTitle>
                  <CardDescription>Identify training needs by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training ROI Report</CardTitle>
                  <CardDescription>Calculate return on training investment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certification Tracking</CardTitle>
                  <CardDescription>Monitor certification renewals and compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Participation</CardTitle>
                  <CardDescription>Track employee participation rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Utilization</CardTitle>
                  <CardDescription>Analyze training budget allocation and usage</CardDescription>
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