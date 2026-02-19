import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { mockSuppliers, mockAssets } from '@/services/mockData/assets';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-selected asset IDs (for bulk maintenance) */
  preSelectedAssetIds?: (number | string)[];
  onSubmit?: (data: any) => void;
}

export const MaintenanceFormDialog: React.FC<MaintenanceFormDialogProps> = ({ open, onOpenChange, preSelectedAssetIds = [], onSubmit }) => {
  const [name, setName] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>(
    preSelectedAssetIds.map(id => String(id))
  );
  const [maintenanceType, setMaintenanceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [warrantyImprovement, setWarrantyImprovement] = useState(false);
  const [cost, setCost] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [assetSearch, setAssetSearch] = useState('');

  const filteredAssets = mockAssets.filter(a => 
    !selectedAssets.includes(String(a.id)) &&
    (a.assetName?.toLowerCase().includes(assetSearch.toLowerCase()) || 
     a.assetTag?.toLowerCase().includes(assetSearch.toLowerCase()))
  );

  const addAsset = (id: string) => {
    setSelectedAssets(prev => [...prev, id]);
    setAssetSearch('');
  };

  const removeAsset = (id: string) => {
    setSelectedAssets(prev => prev.filter(a => a !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedAssets.length === 0 || !maintenanceType) {
      toast.error('Please fill required fields (Name, Assets, Type)');
      return;
    }
    onSubmit?.({ name, assets: selectedAssets, maintenanceType, startDate, completionDate, supplier, warrantyImprovement, cost, url, notes });
    toast.success('Maintenance record created');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create Maintenance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Name */}
          <div className="flex items-center gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 border-l-4 border-l-amber-400" />
          </div>

          {/* Assets - multi-select with tags */}
          <div className="flex items-start gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Assets</label>
            <div className="flex-1 space-y-2">
              {selectedAssets.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 border border-amber-400 border-l-4 rounded bg-white">
                  {selectedAssets.map(id => {
                    const asset = mockAssets.find(a => String(a.id) === id);
                    return (
                      <Badge key={id} className="bg-sky-600 text-white gap-1 px-2 py-1">
                        <button type="button" onClick={() => removeAsset(id)} className="hover:text-red-200">
                          <X className="w-3 h-3" />
                        </button>
                        #{asset?.assetTag} - {asset?.assetName}
                      </Badge>
                    );
                  })}
                </div>
              )}
              <div className="relative">
                <Input
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  placeholder="Search and select assets..."
                  className="border-l-4 border-l-amber-400"
                />
                {assetSearch && filteredAssets.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-40 overflow-y-auto mt-1">
                    {filteredAssets.slice(0, 10).map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => addAsset(String(a.id))}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-sky-50 border-b last:border-b-0"
                      >
                        #{a.assetTag} - {a.assetName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-center gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0">Asset Maintenance Type</label>
            <Select value={maintenanceType} onValueChange={setMaintenanceType}>
              <SelectTrigger className="flex-1 border-l-4 border-l-amber-400">
                <SelectValue placeholder="Select Maintenance Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
                <SelectItem value="Upgrade">Upgrade</SelectItem>
                <SelectItem value="Hardware Support">Hardware Support</SelectItem>
                <SelectItem value="Software Support">Software Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-56" />
          </div>

          {/* Completion Date */}
          <div className="flex items-center gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0">Completion Date</label>
            <Input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="w-56" />
          </div>

          {/* Supplier */}
          <div className="flex items-center gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0">Supplier</label>
            <div className="flex items-center gap-2 flex-1">
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                <Plus className="w-3 h-3 mr-1" /> New
              </Button>
            </div>
          </div>

          {/* Warranty Improvement */}
          <div className="flex items-center gap-4">
            <div className="w-44 shrink-0" />
            <div className="flex items-center gap-2">
              <Checkbox checked={warrantyImprovement} onCheckedChange={(v) => setWarrantyImprovement(v as boolean)} />
              <span className="text-sm text-gray-700">Warranty Improvement</span>
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0">Cost</label>
            <div className="flex items-center gap-0">
              <span className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded-l border border-r-0 border-gray-200">USD</span>
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-40 rounded-l-none" />
            </div>
          </div>

          {/* URL */}
          <div className="flex items-center gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0">URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" placeholder="https://example.com" />
          </div>

          {/* Upload Image */}
          <div className="flex items-start gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Upload Image</label>
            <div className="space-y-1">
              <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">Select File...</Button>
              <p className="text-xs text-gray-500">Accepted filetypes are jpg, webp, png, gif, svg, and avif. The maximum upload size allowed is 25M.</p>
            </div>
          </div>

          {/* Notes */}
          <div className="flex items-start gap-4">
            <label className="w-44 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Notes</label>
            <div className="flex-1 space-y-1">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20" />
              <p className="text-xs text-sky-600">This field allows Github flavored markdown.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              ✓ Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
