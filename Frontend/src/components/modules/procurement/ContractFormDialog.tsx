import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ContractFormDialog: React.FC<ContractFormDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    vendorId: '',
    procurementRequestId: '',
    amount: '',
    startDate: '',
    endDate: '',
    terms: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await procurementApiService.createContract({
        ...formData,
        amount: Number.parseFloat(formData.amount),
        status: 'draft'
      });
      toast({ title: 'Success', description: 'Contract created successfully' });
      onSuccess();
      onOpenChange(false);
      setFormData({ title: '', vendorId: '', procurementRequestId: '', amount: '', startDate: '', endDate: '', terms: '' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create contract', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Contract</DialogTitle>
          <DialogDescription>Create a new supplier contract</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Contract Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vendorId">Vendor ID</Label>
              <Input id="vendorId" value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requestId">Procurement Request ID</Label>
              <Input id="requestId" value={formData.procurementRequestId} onChange={(e) => setFormData({ ...formData, procurementRequestId: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Contract Amount</Label>
              <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea id="terms" value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
