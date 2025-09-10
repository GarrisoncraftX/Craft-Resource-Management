import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, FileText, Gavel, Shield, AlertTriangle, Users, BookOpen, Home } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const legalMenuItems = [
  { title: "Overview", path: "/legal/dashboard", icon: Home },
  { title: "Legal Documents", path: "/legal/documents", icon: FileText },
  { title: "Contracts", path: "/legal/contracts", icon: BookOpen },
  { title: "Compliance", path: "/legal/compliance", icon: Shield },
  { title: "Litigation", path: "/legal/litigation", icon: Gavel },
  { title: "Legal Advisors", path: "/legal/advisors", icon: Users },
  { title: "Risk Management", path: "/legal/risk", icon: AlertTriangle },
];

const LegalSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Legal Affairs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {legalMenuItems.map((item) => (
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

export const LegalDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const legalCases = [
    { id: 'LEG-001', title: 'Contract Dispute - Vendor ABC', status: 'Active', priority: 'High', assignee: 'John Smith' },
    { id: 'LEG-002', title: 'Employment Law Review', status: 'Pending', priority: 'Medium', assignee: 'Jane Doe' },
    { id: 'LEG-003', title: 'Compliance Audit', status: 'Completed', priority: 'Low', assignee: 'Mike Johnson' },
  ];

  const complianceItems = [
    { area: 'Data Protection', status: 'Compliant', lastReview: '2024-01-15', nextReview: '2024-07-15' },
    { area: 'Employment Law', status: 'Review Required', lastReview: '2023-12-01', nextReview: '2024-06-01' },
    { area: 'Financial Regulations', status: 'Compliant', lastReview: '2024-01-10', nextReview: '2024-07-10' },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <LegalSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b h-12 flex items-center">
            <SidebarTrigger className="ml-2" />
            <div className="ml-4">
              <h1 className="text-xl font-bold text-primary">Legal Affairs Module</h1>
            </div>
          </header>

          <main className="flex-1 p-6 bg-background">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">3 high priority</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Contracts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">95%</div>
                  <p className="text-xs text-muted-foreground">Overall compliance rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Low</div>
                  <p className="text-xs text-muted-foreground">Current risk assessment</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Legal Cases</CardTitle>
                  <CardDescription>Current ongoing legal matters</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {legalCases.map((legalCase) => (
                        <TableRow key={legalCase.id}>
                          <TableCell className="font-medium">{legalCase.id}</TableCell>
                          <TableCell>{legalCase.title}</TableCell>
                          <TableCell>
                            <Badge variant={legalCase.priority === 'High' ? 'destructive' : legalCase.priority === 'Medium' ? 'default' : 'secondary'}>
                              {legalCase.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={legalCase.status === 'Active' ? 'default' : legalCase.status === 'Completed' ? 'secondary' : 'outline'}>
                              {legalCase.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Overview</CardTitle>
                  <CardDescription>Regulatory compliance status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.area}</p>
                          <p className="text-sm text-muted-foreground">Last reviewed: {item.lastReview}</p>
                          <p className="text-xs text-muted-foreground">Next review: {item.nextReview}</p>
                        </div>
                        <Badge variant={item.status === 'Compliant' ? 'default' : 'destructive'}>
                          {item.status}
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