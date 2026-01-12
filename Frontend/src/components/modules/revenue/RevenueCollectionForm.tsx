import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createRevenueCollection } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface RevenueCollectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RevenueCollectionForm: React.FC<RevenueCollectionFormProps> = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    taxpayerId: '',
    amount: '',
    collectionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRevenueCollection({
        taxpayerId: formData.taxpayerId,
        amount: Number(formData.amount),
        collectionDate: formData.collectionDate,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
      });

      toast({ title: 'Success', description: 'Revenue collection recorded successfully' });
      onOpenChange(false);
      onSuccess?.();
      setFormData({ taxpayerId: '', amount: '', collectionDate: new Date().toISOString().split('T')[0], paymentMethod: 'Bank Transfer', referenceNumber: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to record collection', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Revenue Collection</DialogTitle>
          <DialogDescription>Record a new revenue collection payment</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="taxpayerId">Taxpayer ID</Label>
              <Input id="taxpayerId" value={formData.taxpayerId} onChange={(e) => setFormData({ ...formData, taxpayerId: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="collectionDate">Collection Date</Label>
              <Input id="collectionDate" type="date" value={formData.collectionDate} onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Online Payment">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input id="referenceNumber" value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Process Collection'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
