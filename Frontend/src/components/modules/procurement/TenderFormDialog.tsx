import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';

interface TenderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const TenderFormDialog: React.FC<TenderFormDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    procurementRequestId: '',
    closeDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await procurementApiService.createTender({
        ...formData,
        status: 'draft'
      });
      toast({ title: 'Success', description: 'Tender created successfully' });
      onSuccess();
      onOpenChange(false);
      setFormData({ title: '', description: '', procurementRequestId: '', closeDate: '' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create tender', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Tender</DialogTitle>
          <DialogDescription>Publish a new tender solicitation</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requestId">Procurement Request ID</Label>
              <Input id="requestId" value={formData.procurementRequestId} onChange={(e) => setFormData({ ...formData, procurementRequestId: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="closeDate">Close Date</Label>
              <Input id="closeDate" type="date" value={formData.closeDate} onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })} required />
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
