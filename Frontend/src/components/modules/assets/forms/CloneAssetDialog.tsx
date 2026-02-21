import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, Upload, X } from 'lucide-react';
import type { Asset, Company, AssetModel, StatusLabel, Location } from '@/types/javabackendapi/assetTypes';
import { OptionalInfoSection } from './OptionalInfoSection';
import { OrderRelatedInfoSection } from './OrderRelatedInfoSection';
import { toast } from 'sonner';
import { assetApiService, uploadAssetImage } from '@/services/javabackendapi/assetApi';

interface CloneAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onClone?: (data) => void;
}

export const CloneAssetDialog: React.FC<CloneAssetDialogProps> = ({ open, onOpenChange, asset, onClone }) => {
  const [company, setCompany] = useState(asset.company || '');
  const [assetTag, setAssetTag] = useState(`AST-${Date.now().toString().slice(-10)}`);
  const [serial, setSerial] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState('Ready to Deploy');
  const [checkoutType, setCheckoutType] = useState<'user' | 'asset' | 'location'>('user');
  const [checkoutTo, setCheckoutTo] = useState('');
  const [notes, setNotes] = useState(asset.notes || '');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [requestable, setRequestable] = useState(asset.requestable || false);

  // Shared sections state
  const [optionalExpanded, setOptionalExpanded] = useState(false);
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [optionalData, setOptionalData] = useState({ assetName: asset.assetName || '', warranty: '', expectedCheckinDate: '', nextAuditDate: '', byod: false });
  const [orderData, setOrderData] = useState({ orderNumber: '', purchaseDate: asset.purchaseDate || '', eolDate: asset.eolDate || '', supplier: '', purchaseCost: '', currency: 'USD' });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [models, setModels] = useState<AssetModel[]>([]);
  const [statusLabels, setStatusLabels] = useState<StatusLabel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [companiesData, modelsData, statusData, locationsData] = await Promise.all([
          assetApiService.getAllCompanies(),
          assetApiService.getAllModels(),
          assetApiService.getAllStatusLabels(),
          assetApiService.getAllLocations()
        ]);
        setCompanies(companiesData);
        setModels(modelsData);
        setStatusLabels(statusData);
        setLocations(locationsData);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };
    if (open) fetchDropdownData();
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const clonedData = { company, assetTag, serial, model, status, checkoutType, checkoutTo, notes, defaultLocation, requestable, ...optionalData, ...orderData };
      const result = await assetApiService.createAsset(clonedData);
      if (selectedImage && result?.id) {
        try {
          await uploadAssetImage(result.id, selectedImage);
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
      onClone?.(result);
      toast.success('Asset cloned successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to clone asset:', error);
      toast.error('Failed to clone asset');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold">Clone Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Save button top */}
          <div className="px-6 py-2 flex justify-end">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="w-4 h-4 mr-1" /> Save</Button>
          </div>

          <div className="px-6 pb-4 space-y-4">
            {/* Company */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Company</label>
              <Select value={String(company)} onValueChange={setCompany}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select Company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Tag */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Asset Tag</label>
              <div className="flex items-center gap-2 flex-1">
                <Input value={assetTag} onChange={(e) => setAssetTag(e.target.value)} className="flex-1 border-l-4 border-l-amber-400" />
                <Button type="button" size="icon" className="bg-sky-500 hover:bg-sky-600 text-white h-9 w-9"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Serial */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Serial</label>
              <Input value={serial} onChange={(e) => setSerial(e.target.value)} className="flex-1" />
            </div>

            {/* Model */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Model</label>
              <div className="flex items-center gap-2 flex-1">
                <Select value={String(model)} onValueChange={setModel}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select a Model" /></SelectTrigger>
                  <SelectContent>
                    {models.map(m => (<SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Status</label>
              <div className="flex items-center gap-2 flex-1">
                <Select value={String(status)} onValueChange={setStatus}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    {statusLabels.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
              </div>
            </div>
            {status === 'Ready to Deploy' && (
              <div className="flex items-center gap-4">
                <div className="w-40 shrink-0" />
                <span className="text-sm text-emerald-600"><Check className="w-4 h-4 inline mr-1" />This asset can be checked out.</span>
              </div>
            )}

            {/* Checkout to type */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Checkout to</label>
              <div className="flex rounded overflow-hidden border border-sky-600">
                {(['user', 'asset', 'location'] as const).map(type => (
                  <button key={type} type="button"
                    onClick={() => setCheckoutType(type)}
                    className={`px-4 py-1.5 text-sm font-medium ${checkoutType === type ? 'bg-sky-600 text-white' : 'bg-white text-sky-600'}`}>
                    {type === 'user' ? '👤 User' : type === 'asset' ? '▦ Asset' : '📍 Location'}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkout to select */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Checkout to</label>
              <div className="flex items-center gap-2 flex-1">
                <Select value={checkoutTo} onValueChange={setCheckoutTo}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder={`Select a ${checkoutType}`} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
              </div>
            </div>

            {/* Notes */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-h-16" />
            </div>

            {/* Default Location */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Default Location</label>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Select value={String(defaultLocation)} onValueChange={setDefaultLocation}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select a Location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map(l => (<SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
                </div>
                <p className="text-xs text-gray-500">This is the location of the asset when it is not checked out</p>
              </div>
            </div>

            {/* Requestable */}
            <div className="flex items-center gap-4">
              <div className="w-40 shrink-0" />
              <div className="flex items-center gap-2">
                <Checkbox checked={requestable} onCheckedChange={(v) => setRequestable(v as boolean)} />
                <span className="text-sm text-gray-700">Requestable</span>
              </div>
            </div>

            {/* Upload Image */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Upload Image</label>
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                  className="hidden"
                  id="clone-image-upload"
                />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-md border" />
                    <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="clone-image-upload" className="cursor-pointer">
                    <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white pointer-events-none">
                      <Upload className="w-4 h-4 mr-1" /> Select File
                    </Button>
                  </label>
                )}
                <p className="text-xs text-gray-500">Image will be uploaded when you save. Accepted filetypes are jpg, webp, png, gif, svg, and avif. Max upload size is 25M.</p>
              </div>
            </div>
          </div>

          {/* Shared sections */}
          <OptionalInfoSection
            data={optionalData}
            onChange={(f, v) => setOptionalData(prev => ({ ...prev, [f]: v }))}
            expanded={optionalExpanded}
            onToggle={() => setOptionalExpanded(!optionalExpanded)}
          />
          <OrderRelatedInfoSection
            data={orderData}
            onChange={(f, v) => setOrderData(prev => ({ ...prev, [f]: v as string }))}
            expanded={orderExpanded}
            onToggle={() => setOrderExpanded(!orderExpanded)}
          />

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-sky-600 hover:underline">Cancel</button>
            <div className="flex items-center gap-2">
              <Select defaultValue="previous">
                <SelectTrigger className="w-44"><SelectValue placeholder="Go to Previous Page" /></SelectTrigger>
                <SelectContent><SelectItem value="previous">Go to Previous Page</SelectItem></SelectContent>
              </Select>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
