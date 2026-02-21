import { assetApiService, uploadAssetImage } from '@/services/javabackendapi/assetApi';
import { toast } from 'sonner';
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OptionalInfoSection } from './forms/OptionalInfoSection';
import { OrderRelatedInfoSection } from './forms/OrderRelatedInfoSection';
import { Asset, Company, AssetModel, StatusLabel, Location } from '@/types/javabackendapi/assetTypes';

interface AssetFormProps {
  onAssetCreated?: (asset) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: Asset;
  title?: string;
}

export const AssetForm: React.FC<AssetFormProps> = ({ onAssetCreated, open, onOpenChange, initialData, title = 'Create New Asset' }) => {
  const [company, setCompany] = useState(initialData?.company || '');
  const [assetTag, setAssetTag] = useState(initialData?.assetTag || `AST-${Date.now().toString().slice(-10)}`);
  const [serial, setSerial] = useState(initialData?.serial || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [status, setStatus] = useState(initialData?.status || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [defaultLocation, setDefaultLocation] = useState(initialData?.defaultLocation || '');
  const [requestable, setRequestable] = useState(initialData?.requestable || false);

  const [optionalExpanded, setOptionalExpanded] = useState(false);
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [optionalData, setOptionalData] = useState({
    assetName: initialData?.assetName || '',
    warranty: initialData?.warranty || '',
    expectedCheckinDate: initialData?.expectedCheckinDate || '',
    nextAuditDate: initialData?.nextAuditDate || '',
    byod: initialData?.byod || false,
  });
  const [orderData, setOrderData] = useState({
    orderNumber: initialData?.orderNumber || '',
    purchaseDate: initialData?.purchaseDate || '',
    eolDate: initialData?.eolDate || '',
    supplier: initialData?.supplier || '',
    purchaseCost: initialData?.purchaseCost || '',
    currency: initialData?.currency || 'USD',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
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

  React.useEffect(() => {
    if (initialData) {
      setCompany(initialData.company || '');
      setAssetTag(initialData.assetTag || `AST-${Date.now().toString().slice(-10)}`);
      setSerial(initialData.serial || '');
      setModel(initialData.model || '');
      setStatus(initialData.status || '');
      setNotes(initialData.notes || '');
      setDefaultLocation(initialData.defaultLocation || '');
      setRequestable(initialData.requestable || false);
      setImagePreview(initialData.imageUrl || null);
      setOptionalData({
        assetName: initialData.assetName || '',
        warranty: initialData.warranty || '',
        expectedCheckinDate: initialData.expectedCheckinDate || '',
        nextAuditDate: initialData.nextAuditDate || '',
        byod: initialData.byod || false,
      });
      setOrderData({
        orderNumber: initialData.orderNumber || '',
        purchaseDate: initialData.purchaseDate || '',
        eolDate: initialData.eolDate || '',
        supplier: initialData.supplier || '',
        purchaseCost: initialData.purchaseCost || '',
        currency: initialData.currency || 'USD',
      });
    }
  }, [initialData]);

  if (!open) return null;

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
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (assetId: number) => {
    if (!selectedImage) return;
    setIsUploading(true);
    try {
      await uploadAssetImage(assetId, selectedImage);
      toast.success('Image uploaded successfully');
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const assetData = {
        company, 
        asset_tag: assetTag, 
        serial, 
        model, 
        status, 
        notes, 
        defaultLocation, 
        requestable,
        asset_name: optionalData.assetName,
        warranty: optionalData.warranty,
        expected_checkin_date: optionalData.expectedCheckinDate,
        next_audit_date: optionalData.nextAuditDate,
        byod: optionalData.byod,
        order_number: orderData.orderNumber,
        purchase_date: orderData.purchaseDate,
        eol_date: orderData.eolDate,
        supplier: orderData.supplier,
        purchase_cost: orderData.purchaseCost,
        currency: orderData.currency,
      };

      let result;
      if (initialData?.id) {
        result = await assetApiService.updateAsset(initialData.id, assetData);
        if (selectedImage) await handleImageUpload(initialData.id);
        toast.success('Asset updated successfully');
      } else {
        result = await assetApiService.createAsset(assetData);
        if (selectedImage && result?.id) await handleImageUpload(result.id);
        toast.success('Asset created successfully');
      }
      
      onAssetCreated?.(result);
      onOpenChange?.(false);
    } catch (error) {
      console.error('Failed to save asset:', error);
      toast.error('Failed to save asset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-auto z-50 py-16">
      <div className="max-w-2xl w-full mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="w-4 h-4 mr-1" /> {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Company</label>
              <Select value={String(company)} onValueChange={setCompany}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select Company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Asset Tag</label>
              <div className="flex items-center gap-2 flex-1">
                <Input value={assetTag} onChange={(e) => setAssetTag(e.target.value)} className="flex-1 border-l-4 border-l-amber-400" />
                <Button type="button" size="icon" className="bg-sky-500 hover:bg-sky-600 text-white h-9 w-9">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Serial</label>
              <Input value={serial} onChange={(e) => setSerial(e.target.value)} className="flex-1" />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Model</label>
              <div className="flex items-center gap-2 flex-1">
                <Select value={String(model)} onValueChange={setModel}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select a Model" /></SelectTrigger>
                  <SelectContent>
                    {models.map(m => (<SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="w-3 h-3 mr-1" /> New
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Status</label>
              <div className="flex items-center gap-2 flex-1">
                <Select value={String(status)} onValueChange={setStatus}>
                  <SelectTrigger className="flex-1 border-l-4 border-l-amber-400"><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    {statusLabels.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="w-3 h-3 mr-1" /> New
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-h-20" />
            </div>

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
                  <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Plus className="w-3 h-3 mr-1" /> New
                  </Button>
                </div>
                <p className="text-xs text-gray-500">This is the location of the asset when it is not checked out</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-40 shrink-0" />
              <div className="flex items-center gap-2">
                <Checkbox checked={requestable} onCheckedChange={(v) => setRequestable(v as boolean)} />
                <span className="text-sm text-gray-700">Requestable</span>
              </div>
            </div>

            {/* Upload Image - Now functional */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Upload Image</label>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                  className="hidden"
                  id="asset-image-upload"
                />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Asset preview" className="h-24 w-24 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="asset-image-upload" className="cursor-pointer">
                    <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white pointer-events-none">
                      <Upload className="w-4 h-4 mr-1" /> Select File
                    </Button>
                  </label>
                )}
                <p className="text-xs text-gray-500">Image will be uploaded when you save. Accepted filetypes are jpg, webp, png, gif, svg, and avif. Max upload size is 25M.</p>
              </div>
            </div>
          </div>

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

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button type="button" onClick={() => onOpenChange?.(false)} className="text-sm text-sky-600 hover:underline">
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <Select defaultValue="previous">
                <SelectTrigger className="w-44"><SelectValue placeholder="Go to Previous Page" /></SelectTrigger>
                <SelectContent><SelectItem value="previous">Go to Previous Page</SelectItem></SelectContent>
              </Select>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Check className="w-4 h-4 mr-1" /> {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm;
