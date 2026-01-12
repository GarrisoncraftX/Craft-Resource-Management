import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Scale, FileText, Gavel, Shield, AlertTriangle, Users, BookOpen, Home } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchLegalCases, fetchComplianceRecords } from '@/services/api';
import { mockLegalCases, mockComplianceRecords } from '@/services/mockData/legal';
import type { LegalCase, ComplianceRecord } from '@/services/mockData/legal';

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
  const [legalCases, setLegalCases] = useState<LegalCase[]>(mockLegalCases);
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>(mockComplianceRecords);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesData, complianceData] = await Promise.all([
        fetchLegalCases().catch(() => mockLegalCases),
        fetchComplianceRecords().catch(() => mockComplianceRecords)
      ]);
      
      if (Array.isArray(casesData) && casesData.length > 0) {
        const mapped = casesData.map((c: any) => ({
          id: c.id ?? `LEG-${Math.random().toString(36).slice(2, 8)}`,
          caseNumber: c.caseNumber ?? '',
          title: c.title ?? 'Untitled Case',
          description: c.description ?? '',
          status: c.status ?? 'Pending',
          priority: c.priority ?? 'Medium',
          assignedLawyer: c.assignedLawyer ?? '',
          filingDate: c.filingDate ?? '',
          resolutionDate: c.resolutionDate,
          stage: c.stage ?? c.status ?? 'Investigation',
          counsel: c.counsel ?? c.assignedLawyer ?? '',
          nextDate: c.nextDate
        }));
        setLegalCases(mapped);
      }
      
      if (Array.isArray(complianceData) && complianceData.length > 0) {
        const mapped = complianceData.map((r: any) => ({
          id: r.id ?? `CMP-${Math.random().toString(36).slice(2, 8)}`,
          entity: r.entity ?? '',
          regulation: r.regulation ?? '',
          complianceDate: r.complianceDate ?? '',
          status: r.status ?? 'Unknown',
          notes: r.notes,
          area: r.area ?? r.entity ?? 'Unknown',
          lastAudit: r.lastAudit ?? r.complianceDate ?? '',
          nextReview: r.nextReview ?? ''
        }));
        setComplianceRecords(mapped);
      }
    } catch (error) {
      console.warn('Failed to load legal data, using mock data', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCases = legalCases.filter(c => c.status === 'Active').length;
  const pendingContracts = legalCases.filter(c => c.status === 'Pending').length;
  const compliantRecords = complianceRecords.filter(r => r.status === 'Compliant').length;
  const complianceRate = complianceRecords.length > 0 ? Math.round((compliantRecords / complianceRecords.length) * 100) : 0;
  const highPriorityCases = legalCases.filter(c => c.priority === 'High').length;

  const casesByStatus = [
    { name: 'Active', value: legalCases.filter(c => c.status === 'Active').length, fill: '#3b82f6' },
    { name: 'Pending', value: legalCases.filter(c => c.status === 'Pending').length, fill: '#f59e0b' },
    { name: 'Completed', value: legalCases.filter(c => c.status === 'Completed').length, fill: '#10b981' },
    { name: 'Dismissed', value: legalCases.filter(c => c.status === 'Dismissed').length, fill: '#ef4444' }
  ].filter(item => item.value > 0);

  const casesByPriority = [
    { priority: 'Critical', count: legalCases.filter(c => c.priority === 'Critical').length, fill: '#dc2626' },
    { priority: 'High', count: legalCases.filter(c => c.priority === 'High').length, fill: '#f59e0b' },
    { priority: 'Medium', count: legalCases.filter(c => c.priority === 'Medium').length, fill: '#3b82f6' },
    { priority: 'Low', count: legalCases.filter(c => c.priority === 'Low').length, fill: '#10b981' }
  ];

  const complianceByStatus = [
    { status: 'Compliant', count: complianceRecords.filter(r => r.status === 'Compliant').length, fill: '#10b981' },
    { status: 'Review Required', count: complianceRecords.filter(r => r.status === 'Review Required').length, fill: '#f59e0b' },
    { status: 'Non-Compliant', count: complianceRecords.filter(r => r.status === 'Non-Compliant').length, fill: '#ef4444' }
  ].filter(item => item.count > 0);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
                  <div className="text-2xl font-bold">{activeCases}</div>
                  <p className="text-xs text-muted-foreground">{highPriorityCases} high priority</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingContracts}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complianceRate}%</div>
                  <p className="text-xs text-muted-foreground">{compliantRecords} of {complianceRecords.length} compliant</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{legalCases.length}</div>
                  <p className="text-xs text-muted-foreground">All legal matters</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cases by Status</CardTitle>
                  <CardDescription>Distribution of legal cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={casesByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {casesByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cases by Priority</CardTitle>
                  <CardDescription>Priority distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={casesByPriority}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6">
                        {casesByPriority.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Legal Cases</CardTitle>
                  <CardDescription>Latest legal matters</CardDescription>
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
                      {legalCases.slice(0, 5).map((legalCase) => (
                        <TableRow key={legalCase.id}>
                          <TableCell className="font-medium">{legalCase.id}</TableCell>
                          <TableCell>{legalCase.title}</TableCell>
                          <TableCell>
                            <Badge variant={legalCase.priority === 'High' || legalCase.priority === 'Critical' ? 'destructive' : legalCase.priority === 'Medium' ? 'default' : 'secondary'}>
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
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>Compliance by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={complianceByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981">
                        {complianceByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};