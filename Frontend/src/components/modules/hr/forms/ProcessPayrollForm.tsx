import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import {  DollarSign, Users } from 'lucide-react';

interface ProcessPayrollFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ProcessPayrollForm: React.FC<ProcessPayrollFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    payPeriod: '',
    startDate: '',
    endDate: '',
    payDate: '',
    department: 'all',
    includeOvertime: false,
    includeBonuses: false,
    includeDeductions: true
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payroll processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: "Payroll processed successfully for selected employees!"
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payroll"
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
            Process Payroll
          </DialogTitle>
          <DialogDescription>
            Configure and process payroll for the selected period
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
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
              This will process payroll for approximately 156 employees in the selected department(s).
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Process Payroll'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};