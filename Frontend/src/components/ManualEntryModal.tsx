import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ManualEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (employeeId: string, password: string) => Promise<void>;
  isProcessing: boolean;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isProcessing,
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    await onSubmit(employeeId, password);
    setEmployeeId('');
    setPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            QR Scan Failed
          </DialogTitle>
          <DialogDescription>
            QR failure - try manual entry to check in
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="modal-employeeId">Employee ID</Label>
            <Input
              id="modal-employeeId"
              placeholder="Enter employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="h-12"
            />
          </div>
          <div>
            <Label htmlFor="modal-password">Password</Label>
            <Input
              id="modal-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Check In'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
