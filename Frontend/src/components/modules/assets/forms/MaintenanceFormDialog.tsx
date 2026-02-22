import { assetApiService, uploadAssetImage } from '@/services/javabackendapi/assetApi';
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Asset, Supplier, MaintenanceRecordInput } from '@/types/javabackendapi/assetTypes';

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedAssetIds?: (number | string)[];
  onSubmit?: (data: unknown) => void;
}

export const MaintenanceFormDialog: React.FC<MaintenanceFormDialogProps> = ({ open, onOpenChange, preSelectedAssetIds = [], onSubmit }) => {
  const [name, setName] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [maintenanceType, setMaintenanceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [warrantyImprovement, setWarrantyImprovement] = useState(false);
  const [cost, setCost] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (open && preSelectedAssetIds.length > 0) {
      setSelectedAssets(preSelectedAssetIds.map(String));
    }
  }, [open, preSelectedAssetIds]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, assetsData] = await Promise.all([
          assetApiService.getAllSuppliers(),
          assetApiService.getAllAssets()
        ]);
        setSuppliers(suppliersData);
        setAssets(assetsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    if (open) {
      fetchData();
    } else {
      // Reset form when dialog closes
      setName('');
      setSelectedAssets([]);
      setMaintenanceType('');
      setStartDate('');
      setCompletionDate('');
      setSupplier('');
      setWarrantyImprovement(false);
      setCost('');
      setUrl('');
      setNotes('');
      setAssetSearch('');
      removeImage();
    }
  }, [open]);

  const filteredAssets = assets.filter(a => 
    !selectedAssets.includes(String(a.id)) &&
    (a.assetName?.toLowerCase().includes(assetSearch.toLowerCase()) || 
     a.assetTag?.toLowerCase().includes(assetSearch.toLowerCase()))
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload jpg, webp, png, gif, svg, or avif.');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error('File size must be less than 25MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addAsset = (id: string) => {
    setSelectedAssets(prev => [...prev, id]);
    setAssetSearch('');
  };

  const removeAsset = (id: string) => {
    setSelectedAssets(prev => prev.filter(a => a !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedAssets.length === 0 || !maintenanceType) {
      toast.error('Please fill required fields (Name, Assets, Type)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const maintenanceData: MaintenanceRecordInput = {
        name,
        asset_ids: selectedAssets,
        maintenance_type: maintenanceType,
        start_date: startDate,
        completion_date: completionDate,
        supplier_id: supplier,
        warranty_improvement: warrantyImprovement,
        cost: cost ? Number.parseFloat(cost) : 0,
        url,
        notes,
      };
      
      const result = await assetApiService.createMaintenanceRecord(maintenanceData);
      if (selectedImage && result?.id) {
        try {
          await uploadAssetImage(result.id, selectedImage);
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
      onSubmit?.(result);
    } catch (error) {
      console.error('Failed to create maintenance record:', error);
      toast.error('Failed to create maintenance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create Maintenance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label htmlFor="maintenance-name" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0">Name</label>
            <Input id="maintenance-name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 border-l-4 border-l-amber-400" />
          </div>

          {/* Assets - multi-select with tags */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <label htmlFor="maintenance-assets" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0 sm:mt-2">Assets</label>
            <div className="flex-1 space-y-2">
              {selectedAssets.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 border border-amber-400 border-l-4 rounded bg-white">
                  {selectedAssets.map(id => {
                    const asset = assets.find(a => String(a.id) === id);
                    return (
                      <Badge key={id} className="bg-sky-600 text-white gap-1 px-2 py-1">
                        <button type="button" onClick={() => removeAsset(id)} className="hover:text-red-200">
                          <X className="w-3 h-3" />
                        </button>
                        #{asset?.assetTag} - {asset?.asset_name || asset?.assetName}
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label htmlFor="maintenance-type" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0">Asset Maintenance Type</label>
            <Select value={maintenanceType} onValueChange={setMaintenanceType}>
              <SelectTrigger id="maintenance-type" className="flex-1 border-l-4 border-l-amber-400">
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label htmlFor="maintenance-start-date" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0">Start Date</label>
            <Input id="maintenance-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-56" />
          </div>

          {/* Completion Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label htmlFor="maintenance-completion-date" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0">Completion Date</label>
            <Input id="maintenance-completion-date" type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="w-full sm:w-56" />
          </div>

          {/* Supplier */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label htmlFor="maintenance-supplier" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0">Supplier</label>
            <div className="flex items-center gap-2 flex-1">
              <Select value={String(supplier)} onValueChange={setSupplier}>
                <SelectTrigger id="maintenance-supplier" className="flex-1">
                  <SelectValue placeholder="Select a Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
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
            <div className="hidden sm:block w-44 shrink-0" />
            <div className="flex items-center gap-2">
              <Checkbox checked={warrantyImprovement} onCheckedChange={(v) => setWarrantyImprovement(v as boolean)} />
              <span className="text-sm text-gray-700">Warranty Improvement</span>
            </div>
          </div>

          {/* Cost */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label htmlFor="maintenance-cost" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0">Cost</label>
            <div className="flex items-center gap-0">
              <span className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded-l border border-r-0 border-gray-200">USD</span>
              <Input id="maintenance-cost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-40 rounded-l-none" />
            </div>
          </div>

          {/* URL */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label htmlFor="maintenance-url" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0">URL</label>
            <Input id="maintenance-url" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" placeholder="https://example.com" />
          </div>

          {/* Upload Image */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <label htmlFor='upload-function' className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0 sm:mt-2">Upload Image</label>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                className="hidden"
                id="maintenance-image-upload"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-md border" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label htmlFor="maintenance-image-upload" className="cursor-pointer">
                  <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white pointer-events-none">
                    <Upload className="w-4 h-4 mr-1" /> Select File
                  </Button>
                </label>
              )}
              <p className="text-xs text-gray-500">Image will be uploaded when you save. Accepted filetypes are jpg, webp, png, gif, svg, and avif. Max upload size is 25M.</p>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <label htmlFor="maintenance-notes" className="sm:w-44 text-sm font-bold text-gray-700 sm:text-right shrink-0 sm:mt-2">Notes</label>
            <div className="flex-1 space-y-1">
              <Textarea id="maintenance-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20" />
              <p className="text-xs text-sky-600">This field allows Github flavored markdown.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              ✓ {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
