import { assetApiService } from '@/services/javabackendapi/assetApi';
import { toast } from 'sonner';
import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCompanies, mockModels, mockStatusLabels, mockLocations } from '@/services/mockData/assets';
import { OptionalInfoSection } from './forms/OptionalInfoSection';
import { OrderRelatedInfoSection } from './forms/OrderRelatedInfoSection';
import { Asset } from '@/types/javabackendapi/assetTypes';

interface AssetFormProps {
  onAssetCreated?: (asset) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Pre-fill for edit mode */
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

  if (!open) return null;

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
        toast.success('Asset updated successfully');
      } else {
        result = await assetApiService.createAsset(assetData);
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
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="w-4 h-4 mr-1" /> {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>

          {/* Form Fields - Snipe-IT single column label-left */}
          <div className="p-6 space-y-4">
            {/* Company */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Company</label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select Company" /></SelectTrigger>
                <SelectContent>
                  {mockCompanies.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Tag */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Asset Tag</label>
              <div className="flex items-center gap-2 flex-1">
                <Input value={assetTag} onChange={(e) => setAssetTag(e.target.value)} className="flex-1 border-l-4 border-l-amber-400" />
                <Button type="button" size="icon" className="bg-sky-500 hover:bg-sky-600 text-white h-9 w-9">
                  <Plus className="w-4 h-4" />
                </Button>
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
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select a Model" /></SelectTrigger>
                  <SelectContent>
                    {mockModels.map(m => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="w-3 h-3 mr-1" /> New
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Status</label>
              <div className="flex items-center gap-2 flex-1">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="flex-1 border-l-4 border-l-amber-400"><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    {mockStatusLabels.map(s => (<SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="w-3 h-3 mr-1" /> New
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-h-20" />
            </div>

            {/* Default Location */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Default Location</label>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Select value={defaultLocation} onValueChange={setDefaultLocation}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select a Location" /></SelectTrigger>
                    <SelectContent>
                      {mockLocations.map(l => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Plus className="w-3 h-3 mr-1" /> New
                  </Button>
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
              <div className="space-y-1">
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">Select File...</Button>
                <p className="text-xs text-gray-500">Accepted filetypes are jpg, webp, png, gif, svg, and avif. The maximum upload size allowed is 25M.</p>
              </div>
            </div>
          </div>

          {/* Collapsible Shared Sections */}
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
