import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, MapPin, Calendar, TrendingUp, FileText, BarChart3, Home, Plus } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { planningApiService, UrbanPlan, Project, DevelopmentPermit, PlanningReport } from '@/services/nodejsbackendapi/planningApi';
import { mockPlanningReport, mockUrbanPlans, mockProjects, mockDevelopmentPermits, mockProjectProgressAnalytics, mockPermitProcessingAnalytics, mockGoalAchievementMetrics, mockBudgetAllocation } from '@/services/mockData/planning';
import { UrbanPlanFormDialog } from './UrbanPlanFormDialog';
import { ProjectFormDialog } from './ProjectFormDialog';
import { PermitFormDialog } from './PermitFormDialog';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from '@/hooks/use-toast';

const planningMenuItems = [
  { title: "Overview", path: "/planning/dashboard", icon: Home },
  { title: "Urban Planning", path: "/planning/urban", icon: Building },
  { title: "Project Management", path: "/planning/projects", icon: Calendar },
  { title: "Development Permits", path: "/planning/permits", icon: FileText },
  { title: "Reports & Analytics", path: "/planning/reports", icon: BarChart3 },
];

const PlanningSidebar = () => {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Planning & Development</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {planningMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className={({ isActive }) => isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const PlanningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [report, setReport] = useState<PlanningReport>(mockPlanningReport);
  const [urbanPlans, setUrbanPlans] = useState<UrbanPlan[]>(mockUrbanPlans);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [permits, setPermits] = useState<DevelopmentPermit[]>(mockDevelopmentPermits);
  
  const [urbanPlanDialogOpen, setUrbanPlanDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [permitDialogOpen, setPermitDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportData, plansData, projectsData, permitsData] = await Promise.all([
        planningApiService.getPlanningReport().catch(() => mockPlanningReport),
        planningApiService.getUrbanPlans().catch(() => mockUrbanPlans),
        planningApiService.getProjects().catch(() => mockProjects),
        planningApiService.getDevelopmentPermits().catch(() => mockDevelopmentPermits)
      ]);
      setReport(reportData);
      setUrbanPlans(plansData);
      setProjects(projectsData);
      setPermits(permitsData);
    } catch (error) {
      console.error('Error loading planning data:', error);
      toast({ title: 'Error', description: 'Failed to load planning data', variant: 'destructive' });
    }
  };

  const handleCreateUrbanPlan = async (plan: Omit<UrbanPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await planningApiService.createUrbanPlan(plan);
      toast({ title: 'Success', description: 'Urban plan created successfully' });
      loadData();
    } catch (error) {
      console.error('Error creating urban plan:', error);
      toast({ title: 'Error', description: 'Failed to create urban plan', variant: 'destructive' });
    }
  };

  const handleCreateProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await planningApiService.createProject(project);
      toast({ title: 'Success', description: 'Project created successfully' });
      loadData();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
    }
  };

  const handleCreatePermit = async (permit: Omit<DevelopmentPermit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await planningApiService.createDevelopmentPermit(permit);
      toast({ title: 'Success', description: 'Permit created successfully' });
      loadData();
    } catch (error) {
      console.error('Error creating permit:', error);
      toast({ title: 'Error', description: 'Failed to create permit', variant: 'destructive' });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PlanningSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b h-12 flex items-center">
            <SidebarTrigger className="ml-2" />
            <div className="ml-4">
              <h1 className="text-xl font-bold text-primary">Planning & Development Module</h1>
            </div>
          </header>

          <main className="flex-1 p-6 bg-background">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">Currently in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Permits</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.permitsPending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Urban Plans</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalUrbanPlans}</div>
                  <p className="text-xs text-muted-foreground">Total plans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Permits Issued</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.permitsIssued}</div>
                  <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="urban-plans">Urban Plans</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="permits">Permits</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Development Projects</CardTitle>
                      <CardDescription>Current development initiatives</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Budget</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projects.slice(0, 3).map((project) => (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium">{project.name}</TableCell>
                              <TableCell>
                                <Badge variant={project.status === 'in_progress' || project.status === 'approved' ? 'default' : 'secondary'}>
                                  {project.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>${project.budget.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Permits</CardTitle>
                      <CardDescription>Development and building permits</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {permits.slice(0, 3).map((permit) => (
                          <div key={permit.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{permit.applicantId}</p>
                              <p className="text-sm text-muted-foreground">{permit.projectType}</p>
                              <p className="text-xs text-muted-foreground">Submitted: {permit.submissionDate}</p>
                            </div>
                            <Badge variant={permit.status === 'approved' || permit.status === 'under_review' ? 'default' : 'secondary'}>
                              {permit.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="urban-plans">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Urban Plans</CardTitle>
                        <CardDescription>Strategic urban development plans</CardDescription>
                      </div>
                      <PermissionGuard requiredPermissions={['planning.urban.create']}>
                        <Button onClick={() => setUrbanPlanDialogOpen(true)}>
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
                            <TableCell>{plan.planningPeriod.startDate} - {plan.planningPeriod.endDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>Development and infrastructure projects</CardDescription>
                      </div>
                      <PermissionGuard requiredPermissions={['planning.projects.create']}>
                        <Button onClick={() => setProjectDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Project
                        </Button>
                      </PermissionGuard>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Completion</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>{project.projectType}</TableCell>
                            <TableCell>
                              <Badge variant={project.status === 'in_progress' ? 'default' : 'secondary'}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>${project.budget.toLocaleString()}</TableCell>
                            <TableCell>{project.estimatedCompletion}</TableCell>
                            <TableCell>{project.location}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permits">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Development Permits</CardTitle>
                        <CardDescription>Building and development permit applications</CardDescription>
                      </div>
                      <PermissionGuard requiredPermissions={['planning.permits.create']}>
                        <Button onClick={() => setPermitDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Permit
                        </Button>
                      </PermissionGuard>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application #</TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permits.map((permit) => (
                          <TableRow key={permit.id}>
                            <TableCell className="font-medium">{permit.applicationNumber}</TableCell>
                            <TableCell>{permit.applicantId}</TableCell>
                            <TableCell>{permit.projectType}</TableCell>
                            <TableCell>{permit.location}</TableCell>
                            <TableCell>
                              <Badge variant={permit.status === 'approved' ? 'default' : 'secondary'}>
                                {permit.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{permit.submissionDate}</TableCell>
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
                      <CardTitle>Project Progress Analytics</CardTitle>
                      <CardDescription>Monthly project status tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mockProjectProgressAnalytics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" fill="#10b981" name="Completed" />
                          <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
                          <Bar dataKey="planned" fill="#f59e0b" name="Planned" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Permit Processing Analytics</CardTitle>
                      <CardDescription>Weekly permit application trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mockPermitProcessingAnalytics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="submitted" stroke="#8b5cf6" name="Submitted" />
                          <Line type="monotone" dataKey="approved" stroke="#10b981" name="Approved" />
                          <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Goal Achievement Metrics</CardTitle>
                      <CardDescription>Strategic goal progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mockGoalAchievementMetrics} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="goal" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                          <Bar dataKey="achieved" fill="#3b82f6" name="Achieved" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Budget Allocation</CardTitle>
                      <CardDescription>Project budget distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={mockBudgetAllocation} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
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
        </div>
      </div>

      <UrbanPlanFormDialog open={urbanPlanDialogOpen} onOpenChange={setUrbanPlanDialogOpen} onSubmit={handleCreateUrbanPlan} />
      <ProjectFormDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} onSubmit={handleCreateProject} />
      <PermitFormDialog open={permitDialogOpen} onOpenChange={setPermitDialogOpen} onSubmit={handleCreatePermit} />
    </SidebarProvider>
  );
};
