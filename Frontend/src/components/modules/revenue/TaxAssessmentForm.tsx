import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTaxAssessment } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface TaxAssessmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const TaxAssessmentForm: React.FC<TaxAssessmentFormProps> = ({ open, onOpenChange, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    taxpayerId: '',
    propertyAddress: '',
    ownerName: '',
    propertyType: 'Residential',
    landValue: '',
    improvementValue: '',
    taxRate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const landValue = Number(formData.landValue);
      const improvementValue = Number(formData.improvementValue);
      const totalValue = landValue + improvementValue;
      const taxRate = Number(formData.taxRate);
      const annualTax = (totalValue * taxRate) / 100;

      await createTaxAssessment({
        taxpayerId: formData.taxpayerId,
        propertyAddress: formData.propertyAddress,
        ownerName: formData.ownerName,
        propertyType: formData.propertyType,
        landValue,
        improvementValue,
        totalValue,
        taxRate,
        annualTax,
        status: 'Pending',
      });

      toast({ title: 'Success', description: 'Tax assessment created successfully' });
      onOpenChange(false);
      onSuccess?.();
      setFormData({ taxpayerId: '', propertyAddress: '', ownerName: '', propertyType: 'Residential', landValue: '', improvementValue: '', taxRate: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to create tax assessment', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Tax Assessment</DialogTitle>
          <DialogDescription>Create a new property tax assessment</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxpayerId">Taxpayer ID</Label>
                <Input id="taxpayerId" value={formData.taxpayerId} onChange={(e) => setFormData({ ...formData, taxpayerId: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input id="ownerName" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input id="propertyAddress" value={formData.propertyAddress} onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Agricultural">Agricultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" step="0.1" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="landValue">Land Value ($)</Label>
                <Input id="landValue" type="number" value={formData.landValue} onChange={(e) => setFormData({ ...formData, landValue: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="improvementValue">Improvement Value ($)</Label>
                <Input id="improvementValue" type="number" value={formData.improvementValue} onChange={(e) => setFormData({ ...formData, improvementValue: e.target.value })} required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Assessment'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
