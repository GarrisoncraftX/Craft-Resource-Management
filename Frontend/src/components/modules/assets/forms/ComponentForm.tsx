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
  const [qty_total, setQtyTotal] = useState(initialData?.qty_total || 0);
  const [qty_remaining, setQtyRemaining] = useState(initialData?.qty_remaining || 0);
  const [min_qty, setMinQty] = useState(initialData?.min_qty || 0);
  const [location_id, setLocationId] = useState(initialData?.location_id || undefined);
  const [company_id, setCompanyId] = useState(initialData?.company_id || undefined);
  const [unit_cost, setUnitCost] = useState(initialData?.unit_cost || undefined);
  const [model_no, setModelNo] = useState(initialData?.model_no || '');
  const [serial, setSerial] = useState(initialData?.serial || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, qty_total, qty_remaining, min_qty, location_id, company_id, unit_cost, model_no, serial, notes });
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
            <Input type="number" value={qty_total} onChange={(e) => setQtyTotal(Number(e.target.value))} required className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Qty Remaining</label>
            <Input type="number" value={qty_remaining} onChange={(e) => setQtyRemaining(Number(e.target.value))} required className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Min Qty</label>
            <Input type="number" value={min_qty} onChange={(e) => setMinQty(Number(e.target.value))} className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Model No</label>
            <Input value={model_no} onChange={(e) => setModelNo(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Serial</label>
            <Input value={serial} onChange={(e) => setSerial(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Unit Cost</label>
            <Input type="number" step="0.01" value={unit_cost} onChange={(e) => setUnitCost(Number(e.target.value))} className="w-40" />
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
