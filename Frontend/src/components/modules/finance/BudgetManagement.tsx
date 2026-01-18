import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, TrendingUp, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { BudgetItem, BudgetRequest } from '@/types/api';
import { budgetManagementData, mockBudgetRequest } from '@/services/mockData/mockData';
import { BudgetForm } from './BudgetForm';
import { BudgetRequestForm } from './BudgetRequestForm';
import { fetchDepartments } from '@/services/api';
import { fetchBudgets, createBudgetItem, updateBudgetItem, deleteBudgetItem, fetchBudgetRequests, approveBudgetRequest, rejectBudgetRequest } from '@/services/javabackendapi/financeApi';
import type { Department } from '@/types/api';
import { useToast } from '@/hooks/use-toast';


export const BudgetManagement: React.FC = () => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [activeTab, setActiveTab] = useState('budgets');
  const [editedBudget, setEditedBudget] = useState<BudgetItem | null>(null);

    const filteredBudgets = budgets.filter(budget => {
      const matchesSearch = (budget.departmentName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (budget.category ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || budget.departmentName === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'default';
      case 'Warning': return 'secondary';
      case 'Over Budget': return 'destructive';
      default: return 'outline';
    }
  };

  
  const getRequestStatusColor = (status: BudgetRequest['status']) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Approved': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const data = await fetchBudgets();
        setBudgets(data);
      } catch (error) {
        console.error("Failed to fetch budgets, using mock data:", error);
        setBudgets(budgetManagementData.map((item, index) => ({
          id: index.toString(),
          amount: item.budget,
          budgetName: 'General Budget',
          departmentId: 1,
          departmentName: item.name,
          description: 'Budget allocation',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          spentAmount: item.spent,
          remainingAmount: item.budget - item.spent,
          budgetAmount: item.budget,
          remaining: item.budget - item.spent,
          percentage: (item.spent / item.budget) * 100,
          period: 'Q1 2024',
          status: item.spent > item.budget ? 'Over Budget' : 'On Track',
          lastUpdated: new Date().toISOString().split('T')[0],
          category: 'General',
          department: '1',
        })));
      }
    };

    const loadDepartments = async () => {
      try {
        const data = await fetchDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };

    const loadBudgetRequests = async () => {
      try {
        const data = await fetchBudgetRequests();
        setBudgetRequests(data);
      } catch (error) {
        console.error("Failed to fetch budget requests, using mock data:", error);
        setBudgetRequests(mockBudgetRequest.map(request => ({
          ...request,
          status: request.status as "Pending" | "Approved" | "Rejected"
        })));
      }
    };

    loadBudgets();
    loadDepartments();
    loadBudgetRequests();
  }, []);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  

  const handleUpdateBudget = async (updatedBudget) => {
    try {
      await updateBudgetItem(updatedBudget.id, updatedBudget);
      const refreshedBudgets = await fetchBudgets();
      setBudgets(refreshedBudgets);
      setEditedBudget(null);
      toast({
        title: "Budget Updated",
        description: "Budget has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update budget", error);
      toast({
        title: "Update Failed",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateBudget = async (newBudget) => {
    try {
      const savedBudget = await createBudgetItem(newBudget);
      setBudgets([...budgets, savedBudget]);
      setIsAddingBudget(false);
     toast({
        title: "Budget Created",
        description: "Budget has been successfully created.",
      });
    } catch (error) {
      console.error("Failed to create budget", error);
      toast({
        title: "Create Failed",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      await deleteBudgetItem(budgetId);
      setBudgets(budgets.filter(b => b.id !== budgetId));
    toast({
        title: "Budget Deleted",
        description: "Budget has been successfully deleted.",
      });
    } catch (error) {
      console.error("Failed to delete budget", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveBudgetRequest = async (requestId: string) => {
    try {
      await approveBudgetRequest(requestId);
      const [refreshedRequests, refreshedBudgets] = await Promise.all([
        fetchBudgetRequests(),
        fetchBudgets()
      ]);
      setBudgetRequests(refreshedRequests);
      setBudgets(refreshedBudgets);
      toast({
        title: "Request Approved",
        description: "Budget request approved and budget created.",
      });
    } catch (error) {
      console.error("Failed to approve budget request", error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve budget request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectBudgetRequest = async (requestId: string) => {
    try {
      await rejectBudgetRequest(requestId);
      const refreshedRequests = await fetchBudgetRequests();
      setBudgetRequests(refreshedRequests);
      toast({
        title: "Request Rejected",
        description: "Budget request has been rejected.",
      });
    } catch (error) {
      console.error("Failed to reject budget request", error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject budget request. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Budget Management</h2>
          <p className="text-white">Monitor and control organizational budgets</p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
            <Dialog open={isAddingBudget} onOpenChange={setIsAddingBudget}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                  <DialogDescription>
                    Set up a new budget allocation
                  </DialogDescription>
                </DialogHeader>
                {/* Using the external BudgetForm component */}
                <BudgetForm onSubmit={(budget) => { handleCreateBudget(budget); }} onCancel={() => setIsAddingBudget(false)} />
              </DialogContent>
            </Dialog>
          </PermissionGuard>
          <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
            <Dialog open={isAddingRequest} onOpenChange={setIsAddingRequest}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Request Additional Budget</DialogTitle>
                  <DialogDescription>
                    Submit a request for additional budget allocation
                  </DialogDescription>
                </DialogHeader>
                {/* Using the external BudgetRequestForm component */}
                <BudgetRequestForm onSubmit={(request) => { setBudgetRequests([...budgetRequests, request]); setIsAddingRequest(false); }} onCancel={() => setIsAddingRequest(false)} />
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{overallPercentage.toFixed(1)}% of total budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available for spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.filter(b => b.status === 'Warning' || b.status === 'Over Budget').length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="budgets">Budget Overview</TabsTrigger>
          <TabsTrigger value="requests">Budget Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Search Budgets</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by department or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="department-filter">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Allocations</CardTitle>
              <CardDescription>
                {filteredBudgets.length} of {budgets.length} budgets displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.map((budget) => (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">{budget.departmentName}</TableCell>
                      <TableCell>{budget.category}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${(budget.budgetAmount ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${(budget.spentAmount ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${(budget.remaining ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress value={budget.percentage} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {(budget.percentage ?? 0).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(budget.status)}>
                          {budget.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                                              <div className="flex gap-2">
                          <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
                            <Dialog open={editedBudget?.id === budget.id} onOpenChange={(open) => { if (!open) setEditedBudget(null); }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setEditedBudget(budget)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                <BudgetForm
                  budget={{
                    ...budget,
                    department_id: Number(budget.department),
                    spentAmount: budget.spentAmount,
                  }}
                  onSubmit={(updatedBudget) => {
                    handleUpdateBudget(updatedBudget);
                  }}
                  onCancel={() => setEditedBudget(null)}
                />
                              </DialogContent>
                            </Dialog>
                          </PermissionGuard>
                          <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
                            <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteBudget(budget.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Requests</CardTitle>
              <CardDescription>
                Pending and processed budget requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Justification</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.department}</TableCell>
                      <TableCell>{request.category}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${request.requestedAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.justification}</TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>{request.requestDate}</TableCell>
                      <TableCell>
                        <Badge variant={getRequestStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
                            <Button variant="outline" size="sm" disabled={request.status !== 'Pending'} onClick={() => handleApproveBudgetRequest(request.id)}>
                              Approve
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
                            <Button variant="outline" size="sm" disabled={request.status !== 'Pending'} onClick={() => handleRejectBudgetRequest(request.id)}>
                              Reject
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};