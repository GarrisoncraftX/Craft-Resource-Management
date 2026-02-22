import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch?: (filters: Record<string, string>) => void;
}

const searchFields = [
  { key: 'assetTag', label: 'Asset Tag' },
  { key: 'assetName', label: 'Asset Name' },
  { key: 'serial', label: 'Serial' },
  { key: 'model', label: 'Model' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'checkedOutTo', label: 'Checked Out To' },
  { key: 'location', label: 'Location' },
  { key: 'purchaseCost', label: 'Purchase Cost' },
];

export const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({ open, onOpenChange, onSearch }) => {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value.trim() !== '')
    );
    onSearch?.(activeFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Advanced search</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {searchFields.map(field => (
            <div key={field.key} className="flex items-center gap-4">
              <label className="w-36 text-sm font-bold text-gray-700 text-right shrink-0">{field.label}</label>
              <Input
                value={filters[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.label}
                className="flex-1"
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleReset} variant="outline" className="mr-auto">
            Reset
          </Button>
          <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Search
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-red-500 hover:bg-red-600 text-white">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
