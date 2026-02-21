import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import type { License } from '@/types/javabackendapi/assetTypes';

interface LicenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: License;
  onSubmit: (data: Partial<License>) => void;
}

export const LicenseForm: React.FC<LicenseFormProps> = ({ open, onOpenChange, initialData, onSubmit }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [seats_total, setSeatsTotal] = useState(initialData?.seats_total || 1);
  const [seats_used, setSeatsUsed] = useState(initialData?.seats_used || 0);
  const [company_id, setCompanyId] = useState(initialData?.company_id || undefined);
  const [supplier_id, setSupplierId] = useState(initialData?.supplier_id || undefined);
  const [manufacturer_id, setManufacturerId] = useState(initialData?.manufacturer_id || undefined);
  const [expiration_date, setExpirationDate] = useState(initialData?.expiration_date || '');
  const [product_key, setProductKey] = useState(initialData?.product_key || '');
  const [purchase_date, setPurchaseDate] = useState(initialData?.purchase_date || '');
  const [purchase_cost, setPurchaseCost] = useState(initialData?.purchase_cost || undefined);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, seats_total, seats_used, company_id, supplier_id, manufacturer_id, expiration_date, product_key, purchase_date, purchase_cost, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initialData ? 'Edit License' : 'Create License'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Seats Total</label>
            <Input type="number" value={seats_total} onChange={(e) => setSeatsTotal(Number(e.target.value))} required className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Seats Used</label>
            <Input type="number" value={seats_used} onChange={(e) => setSeatsUsed(Number(e.target.value))} className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Expiration Date</label>
            <Input type="date" value={expiration_date} onChange={(e) => setExpirationDate(e.target.value)} className="w-52" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Product Key</label>
            <Input value={product_key} onChange={(e) => setProductKey(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Purchase Date</label>
            <Input type="date" value={purchase_date} onChange={(e) => setPurchaseDate(e.target.value)} className="w-52" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Purchase Cost</label>
            <Input type="number" step="0.01" value={purchase_cost} onChange={(e) => setPurchaseCost(Number(e.target.value))} className="w-40" />
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
