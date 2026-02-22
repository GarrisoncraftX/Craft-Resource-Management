import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import type { Component } from '@/types/javabackendapi/assetTypes';

interface ComponentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Component;
  onSubmit: (data: Partial<Component>) => void;
}

export const ComponentForm: React.FC<ComponentFormProps> = ({ open, onOpenChange, initialData, onSubmit }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [qtyTotal, setQtyTotal] = useState(initialData?.qtyTotal || initialData?.qty_total || 0);
  const [qtyRemaining, setQtyRemaining] = useState(initialData?.qtyRemaining || initialData?.qty_remaining || 0);
  const [minQty, setMinQty] = useState(initialData?.minQty || initialData?.min_qty || 0);
  const [locationId, setLocationId] = useState(initialData?.locationId || initialData?.location_id || undefined);
  const [companyId, setCompanyId] = useState(initialData?.companyId || initialData?.company_id || undefined);
  const [unitCost, setUnitCost] = useState(initialData?.unitCost || initialData?.unit_cost || undefined);
  const [modelNo, setModelNo] = useState(initialData?.modelNo || initialData?.model_no || '');
  const [serial, setSerial] = useState(initialData?.serial || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, qtyTotal, qtyRemaining, minQty, locationId, companyId, unitCost, modelNo, serial, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initialData ? 'Edit Component' : 'Create Component'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Qty Total</label>
            <Input type="number" value={qtyTotal} onChange={(e) => setQtyTotal(Number(e.target.value))} required className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Qty Remaining</label>
            <Input type="number" value={qtyRemaining} onChange={(e) => setQtyRemaining(Number(e.target.value))} required className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Min Qty</label>
            <Input type="number" value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Model No</label>
            <Input value={modelNo} onChange={(e) => setModelNo(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Serial</label>
            <Input value={serial} onChange={(e) => setSerial(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Unit Cost</label>
            <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} className="w-40" />
          </div>
          <div className="flex items-start gap-4">
            <label className="w-40 text-sm font-bold text-right mt-2">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-h-20" />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="w-4 h-4 mr-1" /> Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
