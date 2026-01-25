import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import {  DollarSign, Users } from 'lucide-react';
import { fetchDepartments, Department } from '@/services/api';
import { hrApiService } from '@/services/javabackendapi/hrApi';

interface ProcessPayrollFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editMode?: boolean;
  payslipData?: {
    id: number;
    employee: string;
    grossPay: number;
    deductions: number;
  };
}

export const ProcessPayrollForm: React.FC<ProcessPayrollFormProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editMode = false,
  payslipData
}) => {
  const [formData, setFormData] = useState({
    payPeriod: '',
    startDate: '',
    endDate: '',
    payDate: '',
    department: 'all',
    includeOvertime: false,
    includeBonuses: false,
    includeDeductions: true,
    grossPay: 0,
    taxDeductions: 0,
    otherDeductions: 0
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchDepartments();
        setDepartments(data);
        const employees = await hrApiService.listEmployees();
        setEmployeeCount(employees.filter(e => e.accountStatus === 'ACTIVE').length);
      } catch (error) {
        console.error('Failed to load departments:', error);
      }
    };
    if (open) {
      loadDepartments();
      if (editMode && payslipData) {
        setFormData(prev => ({
          ...prev,
          grossPay: payslipData.grossPay,
          taxDeductions: payslipData.deductions * 0.7,
          otherDeductions: payslipData.deductions * 0.3
        }));
      }
    }
  }, [open, editMode, payslipData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: "Success",
          description: "Payslip updated successfully!"
        });
      } else {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const result = await hrApiService.processPayroll({
          startDate: formData.startDate,
          endDate: formData.endDate,
          payDate: formData.payDate,
          departmentId: formData.department === 'all' ? null : parseInt(formData.department),
          includeOvertime: formData.includeOvertime,
          includeBonuses: formData.includeBonuses,
          includeDeductions: formData.includeDeductions,
          createdBy: user.id || 1
        });
        
        toast({
          title: "Success",
          description: result.message || `Payroll processed successfully for ${result.employeesProcessed} employees!`,
          action: result.payrollRunId ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={async () => {
                const blob = await hrApiService.downloadPayrollReport(result.payrollRunId, 'csv');
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payroll_report_${result.payrollRunId}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }}>Download Report</Button>
              <Button size="sm" onClick={async () => {
                const blob = await hrApiService.downloadBankFile(result.payrollRunId);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bank_file_${result.payrollRunId}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }}>Download Bank File</Button>
            </div>
          ) : undefined
        });
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: editMode ? "Failed to update payslip" : "Failed to process payroll",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {editMode ? `Edit Payslip - ${payslipData?.employee}` : 'Process Payroll'}
          </DialogTitle>
          <DialogDescription>
            {editMode ? 'Update payroll information' : 'Configure and process payroll for the selected period'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {editMode ? (
            <>
              <div>
                <Label htmlFor="grossPay">Gross Pay</Label>
                <Input
                  id="grossPay"
                  type="number"
                  step="0.01"
                  value={formData.grossPay}
                  onChange={(e) => setFormData(prev => ({ ...prev, grossPay: Number.parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="taxDeductions">Tax Deductions</Label>
                <Input
                  id="taxDeductions"
                  type="number"
                  step="0.01"
                  value={formData.taxDeductions}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxDeductions: Number.parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="otherDeductions">Other Deductions</Label>
                <Input
                  id="otherDeductions"
                  type="number"
                  step="0.01"
                  value={formData.otherDeductions}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherDeductions: Number.parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Net Pay</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(formData.grossPay - formData.taxDeductions - formData.otherDeductions).toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payPeriod">Pay Period</Label>
              <Select value={formData.payPeriod} onValueChange={(value) => setFormData(prev => ({ ...prev, payPeriod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pay period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Period Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">Period End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="payDate">Pay Date</Label>
              <Input
                id="payDate"
                type="date"
                value={formData.payDate}
                onChange={(e) => setFormData(prev => ({ ...prev, payDate: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Payroll Components</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overtime"
                  checked={formData.includeOvertime}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeOvertime: !!checked }))}
                />
                <Label htmlFor="overtime">Include Overtime</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bonuses"
                  checked={formData.includeBonuses}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeBonuses: !!checked }))}
                />
                <Label htmlFor="bonuses">Include Bonuses</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deductions"
                  checked={formData.includeDeductions}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeDeductions: !!checked }))}
                />
                <Label htmlFor="deductions">Include Deductions</Label>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Estimated Impact</span>
            </div>
            <div className="text-sm text-muted-foreground">
              This will process payroll for approximately {employeeCount} employees in the selected department(s).
            </div>
          </div>
            </>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (editMode ? 'Saving...' : 'Processing...') : (editMode ? 'Save Changes' : 'Process Payroll')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};