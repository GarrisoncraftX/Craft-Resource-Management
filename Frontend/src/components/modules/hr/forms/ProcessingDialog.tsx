import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface ProcessingDialogProps {
  open: boolean;
  message?: string;
}

export const ProcessingDialog: React.FC<ProcessingDialogProps> = ({ open, message }) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md flex flex-col items-center justify-center py-12">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">{message || 'Processing...'}</p>
      </DialogContent>
    </Dialog>
  );
};
