import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, AlertCircle, Calculator } from 'lucide-react';
import { financeApiService, BudgetResponse, JournalEntry, AccountPayable } from '@/services/javabackendapi/financeApi';
import { mockDashboardBudgets, mockDashboardTransactions, mockFinanceDashboardKPIs } from '@/services/mockData/mockData';

export const FinanceDashboard: React.FC = () => {
  const [budgetData, setBudgetData] = useState(mockDashboardBudgets);
  const [recentTransactions, setRecentTransactions] = useState(mockDashboardTransactions);
  const [kpis, setKpis] = useState(mockFinanceDashboardKPIs);


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Budget Data
      try {
        const budgets = await financeApiService.getAllBudgets();
        if (budgets.length > 0) {
          const budgetDataFromApi = budgets.map((b: BudgetResponse) => ({
            department: b.budgetName,
            allocated: b.amount,
            spent: b.spentAmount || 0,
            remaining: b.amount - (b.spentAmount || 0)
          }));
          setBudgetData(budgetDataFromApi);
        }
      } catch (error) {
        console.error('Failed to fetch budgets, using mock data:', error);
      }

      // Fetch Journal Entries for recent transactions
      try {
        const entries = await financeApiService.getAllJournalEntries();
        if (entries.length > 0) {
          const transactionsFromApi = entries.slice(0, 5).map((e: JournalEntry, index: number) => ({
            id: e.id?.toString() || index.toString(),
            date: e.entryDate,
            description: e.description,
            amount: e.debit - e.credit,
            type: e.debit > e.credit ? 'Revenue' as const : 'Expense' as const
          }));
          setRecentTransactions(transactionsFromApi);
        }
      } catch (error) {
        console.error('Failed to fetch transactions, using mock data:', error);
      }

      try {
        const entries = await financeApiService.getAllJournalEntries();
        const totalRevenue = entries.reduce((sum: number, e: JournalEntry) => sum + (e.debit > e.credit ? e.debit : 0), 0);
        const totalExpenses = entries.reduce((sum: number, e: JournalEntry) => sum + (e.credit > e.debit ? e.credit : 0), 0);
        
        const payables = await financeApiService.getAllAccountPayables();
        const pendingPayables = payables.filter((p: AccountPayable) => p.status === 'Pending');
        
        setKpis({
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          pendingInvoices: pendingPayables.length,
          pendingInvoicesValue: pendingPayables.reduce((sum: number, p: AccountPayable) => sum + p.amount, 0)
        });
      } catch (error) {
        console.error('Failed to calculate KPIs, using mock data:', error);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };
  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis.netProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">${kpis.pendingInvoicesValue.toLocaleString()} total value</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'Revenue' ? 'default' : 'secondary'}>
                          {transaction.type}
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
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Department budget allocation and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetData.map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-sm text-muted-foreground">
                        {((dept.spent / dept.allocated) * 100).toFixed(1)}% used
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(dept.spent / dept.allocated) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Spent: ${dept.spent.toLocaleString()}</span>
                      <span>Remaining: ${dept.remaining.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
