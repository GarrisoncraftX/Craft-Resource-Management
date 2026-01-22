import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Calculator, FileText, DollarSign, Users, Download } from 'lucide-react';
import { fetchEmployees } from '@/services/api';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { mockPayslips } from '@/services/mockData/payroll';
import { Payslip as ApiPayslip, PayrollStatus, PayrollDisplayData } from '@/types/api';
import { Employee } from '@/types/hr';
import { ProcessPayrollForm } from './forms/ProcessPayrollForm';
import { PayslipDetailsDialog } from './forms/PayslipDetailsDialog';



export const PayrollProcessing: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [payslips, setPayslips] = useState<ApiPayslip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedPayslips, setDisplayedPayslips] = useState<PayrollDisplayData[]>([]);
  const [isProcessPayrollOpen, setIsProcessPayrollOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollDisplayData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employeesData = await fetchEmployees();
        setEmployees(employeesData);
        
        // Fetch from Java backend
        const payslipsData = await hrApiService.getAllPayslips();
        
        // Use real data from database, fallback to mock if empty
        const dataToUse = payslipsData.length > 0 ? payslipsData as unknown as ApiPayslip[] : mockPayslips;
        setPayslips(dataToUse);

        if (dataToUse.length > 0) {
          const latestPeriod = dataToUse.reduce((latest, current) => {
            const latestDate = new Date(latest.payPeriodEnd);
            const currentDate = new Date(current.payPeriodEnd);
            return currentDate > latestDate ? current : latest;
          }, dataToUse[0]);
          setSelectedPeriod(`${latestPeriod.payPeriodStart} - ${latestPeriod.payPeriodEnd}`);
        }
      } catch (err) {
        console.error("Failed to fetch payroll data from database, using mock data as fallback:", err);
        setPayslips(mockPayslips);

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

  const getEmployeeName = useCallback((payslip: ApiPayslip) => {
    // Try to get name from payslip.user object first
    if (payslip.user?.firstName && payslip.user?.lastName) {
      return `${payslip.user.firstName} ${payslip.user.lastName}`;
    }
    
    // Fallback to looking up by user_id or user.id
    const userId = payslip.user_id || payslip.user?.id;
    if (userId) {
      const id = String(userId);
      const employee = employees.find(emp => emp.id === id);
      if (employee) {
        return `${employee.firstName} ${employee.lastName}`;
      }
    }
    
    return `Unknown Employee (${userId || 'N/A'})`;
  }, [employees]);

  const uniquePeriods = useMemo(() => {
    return Array.from(new Set(payslips.map(p => `${p.payPeriodStart} - ${p.payPeriodEnd}`)));
  }, [payslips]);

  const mapPayrollStatus = (backendStatus?: string): PayrollStatus => {
    const status = backendStatus?.toUpperCase();
    switch (status) {
      case 'COMPLETED':
      case 'PROCESSED':
        return 'Processed';
      case 'PENDING':
        return 'Pending';
      case 'DRAFT':
      default:
        return 'Draft';
    }
  };

  const handleViewDetails = (payslip: PayrollDisplayData) => {
    setSelectedPayslip(payslip);
    setIsDetailsOpen(true);
  };

  const handleEdit = (payslip: PayrollDisplayData) => {
    setSelectedPayslip(payslip);
    setIsEditOpen(true);
  };

  const refreshData = () => {
    globalThis.location.reload();
  };

  const handleDownloadReport = async () => {
    if (!selectedPeriod || displayedPayslips.length === 0) return;
    
    try {
      const payrollRunId = displayedPayslips[0]?.id;
      if (!payrollRunId) return;
      
      const blob = await hrApiService.downloadPayrollReport(payrollRunId, 'csv');
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_report_${selectedPeriod.replace(/\s/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  useEffect(() => {
    const filtered = selectedPeriod
      ? payslips.filter(p => `${p.payPeriodStart} - ${p.payPeriodEnd}` === selectedPeriod)
      : payslips;

    setDisplayedPayslips(filtered.map(payslip => ({
      id: payslip.id,
      employee: getEmployeeName(payslip),
      period: `${payslip.payPeriodStart} - ${payslip.payPeriodEnd}`,
      grossPay: payslip.grossPay ?? 0,
      deductions: (payslip.taxDeductions ?? 0) + (payslip.otherDeductions ?? 0),
      netPay: payslip.netPay ?? 0,
      status: mapPayrollStatus(payslip.payrollRun?.status ?? 'DRAFT'),
    })));
  }, [payslips, selectedPeriod, employees, getEmployeeName]);

  const totalGrossPay = displayedPayslips.reduce((sum, p) => sum + p.grossPay, 0);
  const totalDeductions = displayedPayslips.reduce((sum, p) => sum + p.deductions, 0);
  const totalNetPay = displayedPayslips.reduce((sum, p) => sum + p.netPay, 0);
  const employeesProcessed = new Set(displayedPayslips.map(p => p.employee)).size;
  
  // Calculate previous period metrics for comparison
  const previousPeriodData = useMemo(() => {
    const periods = Array.from(new Set(payslips.map(p => `${p.payPeriodStart} - ${p.payPeriodEnd}`))).sort();
    const currentIndex = periods.indexOf(selectedPeriod);
    if (currentIndex > 0) {
      const prevPeriod = periods[currentIndex - 1];
      const prevPayslips = payslips.filter(p => `${p.payPeriodStart} - ${p.payPeriodEnd}` === prevPeriod);
      return {
        grossPay: prevPayslips.reduce((sum, p) => sum + (p.grossPay ?? 0), 0),
        employees: new Set(prevPayslips.map(p => getEmployeeName(p))).size
      };
    }
    return { grossPay: 0, employees: 0 };
  }, [payslips, selectedPeriod, getEmployeeName]);
  
  const grossPayChange = previousPeriodData.grossPay > 0 
    ? ((totalGrossPay - previousPeriodData.grossPay) / previousPeriodData.grossPay * 100).toFixed(1)
    : '0.0';
  
  const processedCount = displayedPayslips.filter(p => p.status === 'Processed').length;
  const completionRate = displayedPayslips.length > 0 
    ? ((processedCount / displayedPayslips.length) * 100).toFixed(0)
    : '0';

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
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={() => setIsProcessPayrollOpen(true)}>
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
              <p className="text-xs text-muted-foreground">
                {previousPeriodData.grossPay > 0 ? `${Number(grossPayChange) >= 0 ? '+' : ''}${grossPayChange}% from last period` : 'No previous period data'}
              </p>
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
              <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
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
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(payroll)}>
                          View Details
                        </Button>
                        {payroll.status !== 'Processed' && (
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(payroll)}>
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
              <Button className="w-full" onClick={handleDownloadReport}>
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
              <Button className="w-full" onClick={async () => {
                if (!selectedPeriod || displayedPayslips.length === 0) return;
                try {
                  const payrollRunId = displayedPayslips[0]?.id;
                  if (!payrollRunId) return;
                  const blob = await hrApiService.downloadBankFile(payrollRunId);
                  const url = globalThis.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `bank_transfer_${selectedPeriod.replace(/\s/g, '_')}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  globalThis.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error('Failed to download bank file:', error);
                }
              }}>
                <DollarSign className="h-4 w-4 mr-2" />
                Process Transfers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProcessPayrollForm
        open={isProcessPayrollOpen}
        onOpenChange={setIsProcessPayrollOpen}
        onSuccess={refreshData}
      />

      <PayslipDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        payslip={selectedPayslip}
      />

      <ProcessPayrollForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        editMode={true}
        payslipData={selectedPayslip ? {
          id: selectedPayslip.id,
          employee: selectedPayslip.employee,
          grossPay: selectedPayslip.grossPay,
          deductions: selectedPayslip.deductions
        } : undefined}
        onSuccess={refreshData}
      />
    </div>
  );
};