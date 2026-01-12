import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';
import { createAsset } from '@/services/api';
import type { Asset } from '@/types/asset';

interface AssetFormDialogProps {
  onAssetCreated?: (asset: Asset) => void;
}

export const AssetFormDialog: React.FC<AssetFormDialogProps> = ({ onAssetCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    assetName: '',
    assetTag: '',
    description: '',
    location: '',
    acquisitionDate: '',
    acquisitionCost: '',
    currentValue: '',
    status: 'Active',
    condition: 'Good',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      assetName: formData.assetName,
      assetTag: formData.assetTag,
      description: formData.description,
      location: formData.location,
      acquisitionDate: formData.acquisitionDate,
      acquisitionCost: Number(formData.acquisitionCost) || 0,
      currentValue: Number(formData.currentValue) || 0,
      status: formData.status,
      condition: formData.condition,
    };

    try {
      const created = await createAsset(payload);
      onAssetCreated?.(created);
      setOpen(false);
      setFormData({
        assetName: '',
        assetTag: '',
        description: '',
        location: '',
        acquisitionDate: '',
        acquisitionCost: '',
        currentValue: '',
        status: 'Active',
        condition: 'Good',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>Register a new asset in the system</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assetName">Asset Name *</Label>
              <Input
                id="assetName"
                value={formData.assetName}
                onChange={(e) => handleChange('assetName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="assetTag">Asset Tag</Label>
              <Input
                id="assetTag"
                value={formData.assetTag}
                onChange={(e) => handleChange('assetTag', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="acquisitionDate">Acquisition Date</Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => handleChange('acquisitionDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="acquisitionCost">Acquisition Cost</Label>
              <Input
                id="acquisitionCost"
                type="number"
                value={formData.acquisitionCost}
                onChange={(e) => handleChange('acquisitionCost', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currentValue">Current Value</Label>
              <Input
                id="currentValue"
                type="number"
                value={formData.currentValue}
                onChange={(e) => handleChange('currentValue', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
              />
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
