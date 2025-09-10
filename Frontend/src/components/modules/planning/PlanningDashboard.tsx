import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, MapPin, Calendar, TrendingUp, Users, FileText, BarChart3, Home } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const planningMenuItems = [
  { title: "Overview", path: "/planning/dashboard", icon: Home },
  { title: "Urban Planning", path: "/planning/urban", icon: Building },
  { title: "Zoning", path: "/planning/zoning", icon: MapPin },
  { title: "Project Management", path: "/planning/projects", icon: Calendar },
  { title: "Development Permits", path: "/planning/permits", icon: FileText },
  { title: "Community Engagement", path: "/planning/community", icon: Users },
  { title: "Reports & Analytics", path: "/planning/reports", icon: BarChart3 },
];

const PlanningSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

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
                    <NavLink 
                      to={item.path} 
                      className={({ isActive }) => 
                        isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                      }
                    >
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

export const PlanningDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const developmentProjects = [
    { id: 'DEV-001', name: 'Downtown Revitalization', status: 'In Progress', budget: 2500000, completion: 65 },
    { id: 'DEV-002', name: 'Green Park Expansion', status: 'Planning', budget: 800000, completion: 25 },
    { id: 'DEV-003', name: 'Residential Complex A', status: 'Approved', budget: 5200000, completion: 90 },
  ];

  const permits = [
    { id: 'PER-001', applicant: 'ABC Construction', type: 'Building Permit', status: 'Under Review', submitDate: '2024-01-15' },
    { id: 'PER-002', applicant: 'Green Developers', type: 'Zoning Variance', status: 'Approved', submitDate: '2024-01-10' },
    { id: 'PER-003', applicant: 'City Infrastructure', type: 'Development Permit', status: 'Pending', submitDate: '2024-01-12' },
  ];

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
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">3 new this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Permits</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45.2M</div>
                  <p className="text-xs text-muted-foreground">Allocated for projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Community Meetings</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Scheduled this month</p>
                </CardContent>
              </Card>
            </div>

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
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {developmentProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>
                            <Badge variant={project.status === 'In Progress' ? 'default' : project.status === 'Approved' ? 'secondary' : 'outline'}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${project.budget.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${project.completion}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{project.completion}%</span>
                            </div>
                          </TableCell>
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
                    {permits.map((permit, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{permit.applicant}</p>
                          <p className="text-sm text-muted-foreground">{permit.type}</p>
                          <p className="text-xs text-muted-foreground">Submitted: {permit.submitDate}</p>
                        </div>
                        <Badge variant={permit.status === 'Approved' ? 'default' : permit.status === 'Under Review' ? 'secondary' : 'outline'}>
                          {permit.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};