import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Asset, Company, AssetModel, StatusLabel, Location, Supplier } from '@/types/javabackendapi/assetTypes';
import type { User } from '@/types/javabackendapi/hrTypes';
import { OptionalInfoSection } from './OptionalInfoSection';
import { OrderRelatedInfoSection } from './OrderRelatedInfoSection';
import { toast } from 'sonner';
import { assetApiService, uploadAssetImage } from '@/services/javabackendapi/assetApi';
import { hrApiService } from '@/services/javabackendapi/hrApi';

interface CloneAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onClone?: (data: Asset) => void;
}

export const CloneAssetDialog: React.FC<CloneAssetDialogProps> = ({ open, onOpenChange, asset, onClone }) => {
  const navigate = useNavigate();

  const [company, setCompany] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [serial, setSerial] = useState('');
  const [model, setModel] = useState('');
  const [status, setStatus] = useState('');
  const [checkoutType, setCheckoutType] = useState<'user' | 'asset' | 'location'>('user');
  const [checkoutTo, setCheckoutTo] = useState('');
  const [notes, setNotes] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [requestable, setRequestable] = useState(false);

  const [optionalExpanded, setOptionalExpanded] = useState(false);
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [optionalData, setOptionalData] = useState({ assetName: '', warranty: '', expectedCheckinDate: '', nextAuditDate: '', byod: false });
  const [orderData, setOrderData] = useState({ orderNumber: '', purchaseDate: '', eolDate: '', supplier: '', purchaseCost: '', currency: 'USD' });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [models, setModels] = useState<AssetModel[]>([]);
  const [statusLabels, setStatusLabels] = useState<StatusLabel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [checkoutAssets, setCheckoutAssets] = useState<Asset[]>([]);
  const [checkoutLocations, setCheckoutLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch all data (dropdown options + source asset) when dialog opens
  useEffect(() => {
    const fetchAllData = async () => {
      if (!open || !asset?.id) return;

      setLoading(true);
      setDataLoaded(false);

      try {
        // First, fetch all dropdown options
        const results = await Promise.allSettled([
          assetApiService.getAllCompanies(),
          assetApiService.getAllModels(),
          assetApiService.getAllStatusLabels(),
          assetApiService.getAllLocations(),
          assetApiService.getAllSuppliers(),
          hrApiService.listEmployees(),
          assetApiService.getAllAssets()
        ]);
        // Extract values from settled promises, defaulting to empty arrays on failure
        const companiesData = results[0].status === 'fulfilled' ? results[0].value : [];
        const modelsData = results[1].status === 'fulfilled' ? results[1].value : [];
        const statusData = results[2].status === 'fulfilled' ? results[2].value : [];
        const locationsData = results[3].status === 'fulfilled' ? results[3].value : [];
        const suppliersData = results[4].status === 'fulfilled' ? results[4].value : [];
        const usersData = results[5].status === 'fulfilled' ? results[5].value : [];
        const assetsData = results[6].status === 'fulfilled' ? results[6].value : []
        // Log any failures for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const requestNames = ['companies', 'models', 'statusLabels', 'locations', 'suppliers', 'users', 'assets'];
            console.warn(`Failed to fetch ${requestNames[index]}:`, result.reason);
          }
        })
        setCompanies(companiesData);
        setModels(modelsData);
        setStatusLabels(statusData);
        setLocations(locationsData);
        setUsers(usersData);
        setCheckoutAssets(assetsData);
        setCheckoutLocations(locationsData);
        setSuppliers(suppliersData);

        // Then, fetch source asset data
        let sourceAsset = null;
        try {
          const assetResult = await Promise.allSettled([
            assetApiService.getAssetById(Number(asset.id))
          ]);
          if (assetResult[0].status === 'fulfilled') {
            sourceAsset = assetResult[0].value;
          } else {
            console.warn('Failed to fetch source asset from API:', assetResult[0].reason);
            sourceAsset = asset;
          }
        } catch (error) {
          console.warn('Failed to fetch source asset from API, using prop data:', error);
          sourceAsset = asset;
        }

        if (sourceAsset) {
          // Now set all form values - dropdown options are guaranteed to be loaded
          setCompany(String(sourceAsset.company_id || sourceAsset.company || ''));
          setAssetTag('');
          setSerial('');
          setModel(String(sourceAsset.model_id || sourceAsset.model || ''));
          setStatus(String(sourceAsset.status_id || sourceAsset.status || ''));
          setNotes(sourceAsset.notes || '');
          setDefaultLocation(String(sourceAsset.rtd_location_id || sourceAsset.location_id || ''));
          setRequestable(Boolean(sourceAsset.requestable));
          setOptionalData({
            assetName: sourceAsset.assetName || sourceAsset.asset_name || sourceAsset.name || '',
            warranty: String(sourceAsset.warrantyMonths || sourceAsset.warranty_months || ''),
            expectedCheckinDate: sourceAsset.expectedCheckinDate || sourceAsset.expected_checkin || '',
            nextAuditDate: sourceAsset.nextAuditDate || sourceAsset.next_audit_date || '',
            byod: Boolean(sourceAsset.byod)
          });

          setOrderData({
            orderNumber: sourceAsset.orderNumber || sourceAsset.order_number || '',
            purchaseDate: sourceAsset.purchaseDate || sourceAsset.purchase_date || '',
            eolDate: sourceAsset.eolDate || sourceAsset.eol_date || '',
            supplier: String(sourceAsset.supplier_id || ''),
            purchaseCost: String(sourceAsset.purchaseCost || sourceAsset.purchase_cost || ''),
            currency: sourceAsset.currency || 'USD'
          });

          // Handle existing image preview
          if (sourceAsset.imageUrl || sourceAsset.image) {
            setImagePreview(sourceAsset.imageUrl || sourceAsset.image || null);
          }
        }
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load asset data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [open, asset?.id]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedImage(null);
      setImagePreview(null);
      setDataLoaded(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

    if (!model) {
      toast.error('Model is required');
      return;
    }
    if (!status) {
      toast.error('Status is required');
      return;
    }

    try {
      setLoading(true);

      const payload: Partial<Asset> = {
        companyId: company ? Number(company) : undefined,
        serial: serial || undefined,
        modelId: Number(model),
        statusId: Number(status),
        notes: notes || undefined,
        rtdLocationId: defaultLocation ? Number(defaultLocation) : undefined,
        requestable: requestable,
        name: optionalData.assetName || undefined,
        warrantyMonths: optionalData.warranty ? Number(optionalData.warranty) : undefined,
        expectedCheckin: optionalData.expectedCheckinDate || undefined,
        nextAuditDate: optionalData.nextAuditDate || undefined,
        byod: optionalData.byod,
        orderNumber: orderData.orderNumber || undefined,
        purchaseDate: orderData.purchaseDate || undefined,
        eolDate: orderData.eolDate || undefined,
        supplierId: orderData.supplier ? Number(orderData.supplier) : undefined,
        purchaseCost: orderData.purchaseCost ? Number(orderData.purchaseCost) : undefined
      };

      const result = await assetApiService.createAsset(payload);

      let finalResult = result;

      if (selectedImage && result?.id) {
        try {
          await uploadAssetImage(result.id, selectedImage);
        } catch (err) {
          console.error('Image upload failed:', err);
          toast.warning('Asset created but image upload failed');
        }
      }

      // Checkout if user selected
      if (checkoutTo && result?.id) {
        try {
          const checkoutResult = await assetApiService.checkoutAsset(
            result.id,
            Number(checkoutTo),
            checkoutType,
            notes
          );
          finalResult = checkoutResult; 
        } catch (err) {
          console.error('Checkout failed:', err);
          toast.warning('Asset created but checkout failed');
        }
      }

      onClone?.(finalResult);
      toast.success('Asset cloned successfully');

      if (result?.id) {
        navigate(`/assets/hardware?highlight=${result.id}`);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to clone asset:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to clone asset';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
          </div>

          <div className="px-6 pb-4 space-y-4">
            {/* Company */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Company</label>
              <Select value={company} onValueChange={setCompany} disabled={loading}>
                <SelectTrigger className="flex-1"><SelectValue placeholder={loading ? 'Loading...' : 'Select Company'} /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Tag */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Asset Tag</label>
              <div className="flex items-center gap-2 flex-1">
                <Input 
                  value={assetTag || 'Auto-generated on save'} 
                  readOnly 
                  disabled
                  className="flex-1 border-l-4 border-l-amber-400 bg-gray-50 cursor-not-allowed" 
                  placeholder="Auto-generated on save"
                />
              </div>
            </div>

            {/* Serial */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Serial</label>
              <Input value={serial} onChange={(e) => setSerial(e.target.value)} className="flex-1" placeholder="Enter serial number" />
            </div>

            {/* Model */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Model <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2 flex-1">
                <Select value={model} onValueChange={setModel} disabled={loading}>
                  <SelectTrigger className="flex-1 border-l-4 border-l-amber-400"><SelectValue placeholder={loading ? 'Loading...' : 'Select a Model'} /></SelectTrigger>
                  <SelectContent>
                    {models.map(m => (<SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Status <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2 flex-1">
                <Select value={status} onValueChange={setStatus} disabled={loading}>
                  <SelectTrigger className="flex-1 border-l-4 border-l-amber-400"><SelectValue placeholder={loading ? 'Loading...' : 'Select Status'} /></SelectTrigger>
                  <SelectContent>
                    {statusLabels.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
              </div>
            </div>
            {statusLabels.find(s => s.id === Number(status))?.statusType === 'deployable' && (
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
                <Select value={checkoutTo} onValueChange={setCheckoutTo} disabled={loading}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder={loading ? 'Loading...' : `Select a ${checkoutType}`} /></SelectTrigger>
                  <SelectContent>
                    {checkoutType === 'user' && users.map(u => (<SelectItem key={u.id} value={String(u.id)}>{u.firstName} {u.lastName}</SelectItem>))}
                    {checkoutType === 'asset' && checkoutAssets.map(a => (<SelectItem key={a.id} value={String(a.id)}>{a.assetTag || a.asset_tag} - {a.assetName || a.name}</SelectItem>))}
                    {checkoutType === 'location' && checkoutLocations.map(l => (<SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
              </div>
            </div>

            {/* Notes */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-h-16" placeholder="Enter notes" />
            </div>

            {/* Default Location */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Default Location</label>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Select value={defaultLocation} onValueChange={setDefaultLocation} disabled={loading}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder={loading ? 'Loading...' : 'Select a Location'} /></SelectTrigger>
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
            suppliers={suppliers}
          />

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-sky-600 hover:underline">Cancel</button>
            <div className="flex items-center gap-2">
              <Select defaultValue="previous">
                <SelectTrigger className="w-44"><SelectValue placeholder="Go to Previous Page" /></SelectTrigger>
                <SelectContent><SelectItem value="previous">Go to Previous Page</SelectItem></SelectContent>
              </Select>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}><Check className="w-4 h-4 mr-1" /> Save</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
