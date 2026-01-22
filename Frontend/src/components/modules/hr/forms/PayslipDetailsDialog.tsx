import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, DollarSign, User } from 'lucide-react';
import { PayrollStatus } from '@/types/api';

interface PayslipDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslip: {
    id: number;
    employee: string;
    period: string;
    grossPay: number;
    deductions: number;
    netPay: number;
    status: PayrollStatus;
  } | null;
}

export const PayslipDetailsDialog: React.FC<PayslipDetailsDialogProps> = ({
  open,
  onOpenChange,
  payslip
}) => {
  if (!payslip) return null;

  const getStatusVariant = (status: PayrollStatus) => {
    switch (status) {
      case 'Processed': return 'default';
      case 'Pending': return 'secondary';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payslip Details
          </DialogTitle>
          <DialogDescription>
            View detailed payroll information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{payslip.employee}</span>
            </div>
            <Badge variant={getStatusVariant(payslip.status)}>{payslip.status}</Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{payslip.period}</span>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gross Pay</span>
              <span className="font-medium">${payslip.grossPay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Deductions</span>
              <span className="font-medium text-red-600">-${payslip.deductions.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Net Pay</span>
              </div>
              <span className="text-xl font-bold text-green-600">${payslip.netPay.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
