import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ComplianceRecord } from '@/services/mockData/legal';

interface ComplianceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ComplianceRecord>) => void;
  initialData?: ComplianceRecord;
}

export const ComplianceForm: React.FC<ComplianceFormProps> = ({ open, onOpenChange, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<ComplianceRecord>>(initialData || {
    entity: '',
    regulation: '',
    complianceDate: new Date().toISOString().split('T')[0],
    status: 'Compliant',
    area: '',
    lastAudit: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Compliance Record' : 'New Compliance Record'}</DialogTitle>
          <DialogDescription>Enter compliance details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entity">Entity/Department *</Label>
              <Input
                id="entity"
                value={formData.entity}
                onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Compliance Area *</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regulation">Regulation/Standard *</Label>
            <Input
              id="regulation"
              value={formData.regulation}
              onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Compliant">Compliant</SelectItem>
                  <SelectItem value="Review Required">Review Required</SelectItem>
                  <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complianceDate">Compliance Date</Label>
              <Input
                id="complianceDate"
                type="date"
                value={formData.complianceDate}
                onChange={(e) => setFormData({ ...formData, complianceDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastAudit">Last Audit Date</Label>
              <Input
                id="lastAudit"
                type="date"
                value={formData.lastAudit}
                onChange={(e) => setFormData({ ...formData, lastAudit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextReview">Next Review Date</Label>
              <Input
                id="nextReview"
                type="date"
                value={formData.nextReview || ''}
                onChange={(e) => setFormData({ ...formData, nextReview: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'} Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
