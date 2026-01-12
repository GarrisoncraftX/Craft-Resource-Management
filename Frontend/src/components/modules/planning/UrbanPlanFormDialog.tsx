import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UrbanPlan } from '@/services/nodejsbackendapi/planningApi';

interface UrbanPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (plan: Omit<UrbanPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: UrbanPlan;
}

export const UrbanPlanFormDialog: React.FC<UrbanPlanFormDialogProps> = ({ open, onOpenChange, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Omit<UrbanPlan, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    planType: initialData?.planType || 'master',
    status: initialData?.status || 'draft',
    jurisdiction: initialData?.jurisdiction || '',
    planningPeriod: initialData?.planningPeriod || { startDate: '', endDate: '' },
    objectives: initialData?.objectives || [],
    stakeholders: initialData?.stakeholders || [],
    documents: initialData?.documents || []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Urban Plan' : 'Create Urban Plan'}</DialogTitle>
          <DialogDescription>Enter the details for the urban plan</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="planType">Plan Type</Label>
              <Select value={formData.planType} onValueChange={(value: any) => setFormData({ ...formData, planType: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="sectoral">Sectoral</SelectItem>
                  <SelectItem value="neighborhood">Neighborhood</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Input id="jurisdiction" value={formData.jurisdiction} onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={formData.planningPeriod.startDate} onChange={(e) => setFormData({ ...formData, planningPeriod: { ...formData.planningPeriod, startDate: e.target.value } })} required />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={formData.planningPeriod.endDate} onChange={(e) => setFormData({ ...formData, planningPeriod: { ...formData.planningPeriod, endDate: e.target.value } })} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
