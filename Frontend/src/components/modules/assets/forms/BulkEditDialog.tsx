import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, AlertTriangle } from 'lucide-react';
import { mockSuppliers, mockCompanies, mockStatusLabels, mockModels, mockLocations, mockCustomFields } from '@/services/mockData/assets';
import { toast } from 'sonner';

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSubmit?: (data) => void;
}

export const BulkEditDialog: React.FC<BulkEditDialogProps> = ({ open, onOpenChange, selectedCount, onSubmit }) => {
  const [assetName, setAssetName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expectedCheckinDate, setExpectedCheckinDate] = useState('');
  const [eolDate, setEolDate] = useState('');
  const [status, setStatus] = useState('');
  const [model, setModel] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [locationUpdateType, setLocationUpdateType] = useState('both');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [company, setCompany] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [warranty, setWarranty] = useState('');
  const [nextAuditDate, setNextAuditDate] = useState('');
  const [requestable, setRequestable] = useState('do-not-change');
  const [notes, setNotes] = useState('');

  // Delete checkboxes
  const [deleteFlags, setDeleteFlags] = useState<Record<string, boolean>>({});

  const toggleDelete = (field: string) => {
    setDeleteFlags(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ assetName, purchaseDate, expectedCheckinDate, eolDate, status, model, defaultLocation, locationUpdateType, purchaseCost, supplier, company, orderNumber, warranty, nextAuditDate, requestable, notes, deleteFlags });
    toast.success(`${selectedCount} assets updated`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Bulk Edit Assets</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">This form allows you to update multiple assets at once. Only fill in the fields you need to change. Any fields left blank will remain unchanged.</p>

        <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-3 rounded">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">You are about to edit the properties of {selectedCount} assets.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Asset Name */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Asset Name</label>
            <Input value={assetName} onChange={(e) => setAssetName(e.target.value)} className="flex-1" />
            <div className="flex items-center gap-1">
              <Checkbox checked={deleteFlags.assetName} onCheckedChange={() => toggleDelete('assetName')} />
              <span className="text-xs text-gray-500">Delete values for all {selectedCount} selections</span>
            </div>
          </div>

          {/* Purchase Date */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Purchase Date</label>
            <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-52" />
            <div className="flex items-center gap-1">
              <Checkbox checked={deleteFlags.purchaseDate} onCheckedChange={() => toggleDelete('purchaseDate')} />
              <span className="text-xs text-gray-500">Delete values for all {selectedCount} selections</span>
            </div>
          </div>

          {/* Expected Checkin Date */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Expected Checkin Date</label>
            <Input type="date" value={expectedCheckinDate} onChange={(e) => setExpectedCheckinDate(e.target.value)} className="w-52" />
            <div className="flex items-center gap-1">
              <Checkbox checked={deleteFlags.expectedCheckinDate} onCheckedChange={() => toggleDelete('expectedCheckinDate')} />
              <span className="text-xs text-gray-500">Delete values for all {selectedCount} selections</span>
            </div>
          </div>

          {/* EOL Date */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">EOL Date</label>
            <Input type="date" value={eolDate} onChange={(e) => setEolDate(e.target.value)} className="w-52" />
            <div className="flex items-center gap-1">
              <Checkbox checked={deleteFlags.eolDate} onCheckedChange={() => toggleDelete('eolDate')} />
              <span className="text-xs text-gray-500">Delete values for all {selectedCount} selections</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Status</label>
            <div className="flex-1 space-y-1">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  {mockStatusLabels.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">If assets are already assigned, they cannot be changed to a non-deployable status type and this value change will be skipped.</p>
            </div>
          </div>

          {/* Model */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select a Model" /></SelectTrigger>
              <SelectContent>
                {mockModels.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
          </div>

          {/* Default Location */}
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Default Location</label>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Select value={defaultLocation} onValueChange={setDefaultLocation}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select a Location" /></SelectTrigger>
                  <SelectContent>
                    {mockLocations.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
              </div>
              <RadioGroup value={locationUpdateType} onValueChange={setLocationUpdateType} className="space-y-1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="both" id="loc-both" />
                  <label htmlFor="loc-both" className="text-sm">Update default location AND actual location</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="default-only" id="loc-default" />
                  <label htmlFor="loc-default" className="text-sm">Update only default location</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="actual-only" id="loc-actual" />
                  <label htmlFor="loc-actual" className="text-sm">Update only actual location</label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Purchase Cost */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Purchase Cost</label>
            <div className="flex items-center gap-0">
              <span className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded-l border border-r-0 border-gray-200">USD</span>
              <Input type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} className="w-40 rounded-l-none" placeholder="Purchase Cost" />
            </div>
          </div>

          {/* Supplier */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Supplier</label>
            <div className="flex items-center gap-2 flex-1">
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select a Supplier" /></SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white"><Plus className="w-3 h-3 mr-1" /> New</Button>
            </div>
          </div>

          {/* Company */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Company</label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select Company" /></SelectTrigger>
              <SelectContent>
                {mockCompanies.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Number */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Order Number</label>
            <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="flex-1" />
          </div>

          {/* Warranty */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Warranty</label>
            <div className="flex items-center gap-2">
              <Input type="number" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="w-24" />
              <span className="text-sm text-gray-500 px-3 py-2 bg-gray-100 rounded border border-gray-200">months</span>
            </div>
          </div>

          {/* Next Audit Date */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Next Audit Date</label>
            <Input type="date" value={nextAuditDate} onChange={(e) => setNextAuditDate(e.target.value)} className="w-52" />
            <div className="flex items-center gap-1">
              <Checkbox checked={deleteFlags.nextAuditDate} onCheckedChange={() => toggleDelete('nextAuditDate')} />
              <span className="text-xs text-gray-500">Delete values for all {selectedCount} selections</span>
            </div>
          </div>

          {/* Requestable */}
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Users may request this asset</label>
            <RadioGroup value={requestable} onValueChange={setRequestable} className="space-y-1">
              <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="req-yes" /><label htmlFor="req-yes" className="text-sm">Yes</label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="no" id="req-no" /><label htmlFor="req-no" className="text-sm">No</label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="do-not-change" id="req-nc" /><label htmlFor="req-nc" className="text-sm">Do not change</label></div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Notes</label>
            <div className="flex-1 space-y-1">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-16" />
              <div className="flex items-center gap-1">
                <Checkbox checked={deleteFlags.notes} onCheckedChange={() => toggleDelete('notes')} />
                <span className="text-xs text-gray-500">Delete values for all {selectedCount} selections</span>
              </div>
            </div>
          </div>

          {/* Custom Fields Section */}
          <div className="border-t pt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Custom Fields</h3>
            {mockCustomFields.map(field => (
              <div key={field.id} className="flex items-start gap-4 mb-3">
                <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">{field.name}</label>
                <div className="flex-1 space-y-1">
                  {field.element === 'text' && (
                    <Input placeholder={`Enter ${field.format === 'ANY' ? 'any text' : field.format}`} />
                  )}
                  {field.element === 'checkbox' && (
                    <div className="space-y-1">
                      {['One', 'Two', 'Three'].map(opt => (
                        <div key={opt} className="flex items-center gap-2">
                          <Checkbox /><span className="text-sm">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {field.element === 'radio' && (
                    <RadioGroup className="space-y-1">
                      {['One', 'Two', 'Three'].map(opt => (
                        <div key={opt} className="flex items-center gap-2">
                          <RadioGroupItem value={opt.toLowerCase()} id={`${field.id}-${opt}`} />
                          <label htmlFor={`${field.id}-${opt}`} className="text-sm">{opt}</label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  <p className="text-xs text-gray-500">{field.helpText}</p>
                  <div className="flex items-center gap-1">
                    <Checkbox /><span className="text-xs text-gray-500">Delete values for all {selectedCount} selections</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">✓ Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
