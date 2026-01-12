import React, { useEffect, useState } from 'react';
import { NavLink} from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Shield, Database, Activity, Bell, FileText, Home, Headphones } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { SuperAdminDashboardSelector } from './SuperAdminDashboardSelector';
import { useAuth } from '@/contexts/AuthContext';
import { adminApiService } from '@/services/javabackendapi/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const adminMenuItems = [
  { title: "Overview", path: "/admin/dashboard", icon: Home },
  { title: "User Management", path: "/admin/users", icon: Users },
  { title: "System Settings", path: "/admin/settings", icon: Settings },
  { title: "Security", path: "/admin/security", icon: Shield },
  { title: "Database Management", path: "/admin/database", icon: Database },
  { title: "System Monitoring", path: "/admin/monitoring", icon: Activity },
  { title: "Support Tickets", path: "/admin/support", icon: Headphones },
  { title: "Notifications", path: "/admin/notifications", icon: Bell },
  { title: "Audit Logs", path: "/admin/logs", icon: FileText },
];

const AdminSidebar = () => {
  const { state } = useSidebar();

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
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeSessions: number;
    databaseSize: string;
    systemUptime: string;
  } | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: number;
    action: string;
    resource: string;
    user: string;
    timestamp: string;
    severity: string;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [statsData, logsData] = await Promise.all([
        adminApiService.getSystemStats(),
        adminApiService.getAuditLogs()
      ]);
      setStats(statsData);
      setAuditLogs(logsData.slice(0, 4));
    };
    fetchData();
  }, []);

  if (user?.roleCode === 'SUPER_ADMIN') {
    return <SuperAdminDashboardSelector />;
  }

  if (!stats) return null;

  const systemStats = [
    { metric: 'Total Users', value: stats.totalUsers, change: '+5', status: 'up' },
    { metric: 'Active Sessions', value: stats.activeSessions, change: '+12', status: 'up' },
    { metric: 'Database Size', value: stats.databaseSize, change: '+0.1GB', status: 'neutral' },
    { metric: 'System Uptime', value: stats.systemUptime, change: '0%', status: 'neutral' },
  ];

  const usersByDepartment = [
    { department: 'Finance', count: 45, active: 42 },
    { department: 'HR', count: 38, active: 35 },
    { department: 'IT', count: 28, active: 28 },
    { department: 'Legal', count: 22, active: 20 },
    { department: 'Planning', count: 31, active: 29 },
  ];

  const performanceData = [
    { time: '00:00', users: 45, sessions: 12 },
    { time: '04:00', users: 38, sessions: 8 },
    { time: '08:00', users: 156, sessions: 89 },
    { time: '12:00', users: 189, sessions: 102 },
    { time: '16:00', users: 167, sessions: 95 },
    { time: '20:00', users: 98, sessions: 45 }
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
                  <CardTitle>System Activity Trends</CardTitle>
                  <CardDescription>User and session activity over 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
                      <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} name="Sessions" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Users by Department</CardTitle>
                  <CardDescription>Active users across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usersByDepartment}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Total" />
                      <Bar dataKey="active" fill="#10b981" name="Active" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Logs</CardTitle>
                <CardDescription>Latest system events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{log.action} - {log.resource}</p>
                        <p className="text-sm text-muted-foreground">User: {log.user}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      </div>
                      <Badge variant={log.severity === 'Warning' ? 'destructive' : 'secondary'}>
                        {log.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
