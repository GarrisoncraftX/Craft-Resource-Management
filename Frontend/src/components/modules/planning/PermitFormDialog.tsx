import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DevelopmentPermit } from '@/services/nodejsbackendapi/planningApi';

interface PermitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (permit: Omit<DevelopmentPermit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: DevelopmentPermit;
}

export const PermitFormDialog: React.FC<PermitFormDialogProps> = ({ open, onOpenChange, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Omit<DevelopmentPermit, 'id' | 'createdAt' | 'updatedAt'>>({
    applicationNumber: initialData?.applicationNumber || '',
    applicantId: initialData?.applicantId || '',
    projectType: initialData?.projectType || '',
    location: initialData?.location || '',
    status: initialData?.status || 'submitted',
    submissionDate: initialData?.submissionDate || new Date().toISOString().split('T')[0],
    conditions: initialData?.conditions || [],
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
          <DialogTitle>{initialData ? 'Edit Permit' : 'Create Development Permit'}</DialogTitle>
          <DialogDescription>Enter the permit application details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="applicationNumber">Application Number</Label>
            <Input id="applicationNumber" value={formData.applicationNumber} onChange={(e) => setFormData({ ...formData, applicationNumber: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="applicantId">Applicant Name/ID</Label>
            <Input id="applicantId" value={formData.applicantId} onChange={(e) => setFormData({ ...formData, applicantId: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectType">Project Type</Label>
              <Input id="projectType" value={formData.projectType} onChange={(e) => setFormData({ ...formData, projectType: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="submissionDate">Submission Date</Label>
            <Input id="submissionDate" type="date" value={formData.submissionDate} onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })} required />
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
