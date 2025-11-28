import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Calculator, FileText, DollarSign, Users, Download } from 'lucide-react';
import { fetchPayslips, fetchEmployees } from '@/services/api';
import { mockPayslips } from '@/services/mockData/payroll';
import { Payslip, PayrollStatus } from '@/types/api';
import { Employee } from '@/types/hr';

interface PayrollDisplayData {
  id: number;
  employee: string;
  period: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
}

export const PayrollProcessing: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedPayslips, setDisplayedPayslips] = useState<PayrollDisplayData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payslipsData, employeesData] = await Promise.all([
          fetchPayslips(),
          fetchEmployees()
        ]);
        setPayslips(payslipsData);
        setEmployees(employeesData);

        // Set initial selected period to the latest available
        if (payslipsData.length > 0) {
          const latestPeriod = payslipsData.reduce((latest, current) => {
            const latestDate = new Date(latest.payPeriodEnd);
            const currentDate = new Date(current.payPeriodEnd);
            return currentDate > latestDate ? current : latest;
          }, payslipsData[0]);
          setSelectedPeriod(`${latestPeriod.payPeriodStart} - ${latestPeriod.payPeriodEnd}`);
        }


      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load payroll data. Using mock data as fallback.");
        setPayslips(mockPayslips);
        // For mock data, we don't have employee names, so we'll use placeholders
        setEmployees(mockPayslips.map(p => ({ id: String(p.user_id), firstName: `Employee ${p.user_id}`, lastName: '', tenantId: 0, employeeId: `EMP${p.user_id}`, email: `employee${p.user_id}@example.com`, departmentId: 1, roleId: 1, isActive: 1, biometricEnrollmentStatus: 'NONE', failedLoginAttempts: 0, createdAt: '', updatedAt: '' } as Employee)));

        // Set initial selected period for mock data
        if (mockPayslips.length > 0) {
          const latestPeriod = mockPayslips.reduce((latest, current) => {
            const latestDate = new Date(latest.payPeriodEnd);
            const currentDate = new Date(current.payPeriodEnd);
            return currentDate > latestDate ? current : latest;
          }, mockPayslips[0]);
          setSelectedPeriod(`${latestPeriod.payPeriodStart} - ${latestPeriod.payPeriodEnd}`);
        }

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEmployeeName = useCallback((userId: number | string) => {
    const id = String(userId);
    const employee = employees.find(emp => emp.id === id);
    return employee ? `${employee.firstName} ${employee.lastName}` : `Unknown Employee (${userId})`;
  }, [employees]);

  const uniquePeriods = useMemo(() => {
    return Array.from(new Set(payslips.map(p => `${p.payPeriodStart} - ${p.payPeriodEnd}`)));
  }, [payslips]);

  const mapPayrollStatus = (backendStatus: string): PayrollStatus => {
    switch (backendStatus) {
      case 'COMPLETED':
        return 'Processed';
      case 'PENDING':
        return 'Pending';
      case 'DRAFT':
        return 'Draft';
      default:
        return 'Draft';
    }
  };

  useEffect(() => {
    const filtered = selectedPeriod
      ? payslips.filter(p => `${p.payPeriodStart} - ${p.payPeriodEnd}` === selectedPeriod)
      : payslips;

    setDisplayedPayslips(filtered.map(payslip => ({
      id: payslip.id,
      employee: getEmployeeName(payslip.user.id),
      period: `${payslip.payPeriodStart} - ${payslip.payPeriodEnd}`,
      grossPay: payslip.grossPay ?? 0,
      deductions: (payslip.taxDeductions ?? 0) + (payslip.otherDeductions ?? 0),
      netPay: payslip.netPay ?? 0,
      status: mapPayrollStatus(payslip.payrollRun.status),
    })));
  }, [payslips, selectedPeriod, employees, getEmployeeName]);

  const totalGrossPay = displayedPayslips.reduce((sum, p) => sum + p.grossPay, 0);
  const totalDeductions = displayedPayslips.reduce((sum, p) => sum + p.deductions, 0);
  const totalNetPay = displayedPayslips.reduce((sum, p) => sum + p.netPay, 0);
  const employeesProcessed = new Set(displayedPayslips.map(p => p.employee)).size;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading payroll data...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  const getStatusVariant = (status: PayrollStatus) => {
    switch (status) {
      case 'Processed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payroll Processing</h1>
            <p className="text-muted-foreground">Manage employee payroll and compensation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Calculator className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          </div>
        </div>

        {/* Payroll Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Period</CardTitle>
            <CardDescription>Select the payroll period to view or process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {uniquePeriods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalGrossPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalDeductions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{(totalGrossPay > 0 ? (totalDeductions / totalGrossPay * 100) : 0).toFixed(1)}% of gross pay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalNetPay.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{(totalGrossPay > 0 ? (totalNetPay / totalGrossPay * 100) : 0).toFixed(1)}% of gross pay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees Processed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeesProcessed}</div>
              <p className="text-xs text-muted-foreground">95% completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Details - {selectedPeriod}</CardTitle>
            <CardDescription>Individual employee payroll information</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPayslips.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">{payroll.employee}</TableCell>
                    <TableCell>${payroll.grossPay.toLocaleString()}</TableCell>
                    <TableCell>${payroll.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">${payroll.netPay.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(payroll.status)}
                      >
                        {payroll.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                        {payroll.status !== 'Processed' && (
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Card>
            <CardHeader>
              <CardTitle>Generate Payslips</CardTitle>
              <CardDescription>Create and distribute employee payslips</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate Payslips
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Transfer</CardTitle>
              <CardDescription>Process salary payments to employee accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                Process Transfers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};