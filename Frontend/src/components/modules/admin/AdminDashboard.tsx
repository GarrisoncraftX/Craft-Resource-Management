import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Users, Shield, Database, Activity, Bell, FileText, Home } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const adminMenuItems = [
  { title: "Overview", path: "/admin/dashboard", icon: Home },
  { title: "User Management", path: "/admin/users", icon: Users },
  { title: "System Settings", path: "/admin/settings", icon: Settings },
  { title: "Security", path: "/admin/security", icon: Shield },
  { title: "Database Management", path: "/admin/database", icon: Database },
  { title: "System Monitoring", path: "/admin/monitoring", icon: Activity },
  { title: "Notifications", path: "/admin/notifications", icon: Bell },
  { title: "Audit Logs", path: "/admin/logs", icon: FileText },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>System Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
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

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const systemStats = [
    { metric: 'Total Users', value: 247, change: '+5', status: 'up' },
    { metric: 'Active Sessions', value: 89, change: '+12', status: 'up' },
    { metric: 'Database Size', value: '2.4GB', change: '+0.1GB', status: 'neutral' },
    { metric: 'System Uptime', value: '99.9%', change: '0%', status: 'neutral' },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'User logged in', timestamp: '2024-01-15 10:30:00', type: 'info' },
    { id: 2, user: 'Admin', action: 'System backup completed', timestamp: '2024-01-15 09:00:00', type: 'success' },
    { id: 3, user: 'Jane Smith', action: 'Failed login attempt', timestamp: '2024-01-15 08:45:00', type: 'warning' },
    { id: 4, user: 'System', action: 'Database maintenance started', timestamp: '2024-01-15 08:00:00', type: 'info' },
  ];

  const usersByDepartment = [
    { department: 'Finance', count: 45, active: 42 },
    { department: 'HR', count: 38, active: 35 },
    { department: 'IT', count: 28, active: 28 },
    { department: 'Legal', count: 22, active: 20 },
    { department: 'Planning', count: 31, active: 29 },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b h-12 flex items-center">
            <SidebarTrigger className="ml-2" />
            <div className="ml-4">
              <h1 className="text-xl font-bold text-primary">System Administration</h1>
            </div>
          </header>

          <main className="flex-1 p-6 bg-background">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {systemStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.metric}</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.change} from last period
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Activities</CardTitle>
                  <CardDescription>Latest system events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">User: {activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                        <Badge variant={
                          activity.type === 'success' ? 'default' : 
                          activity.type === 'warning' ? 'destructive' : 
                          'secondary'
                        }>
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Users by Department</CardTitle>
                  <CardDescription>Active users across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Users</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Activity Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersByDepartment.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell>{dept.count}</TableCell>
                          <TableCell>{dept.active}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${(dept.active / dept.count) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {Math.round((dept.active / dept.count) * 100)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};