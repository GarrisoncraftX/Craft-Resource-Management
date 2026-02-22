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
  const [seatsTotal, setSeatsTotal] = useState(initialData?.seatsTotal || initialData?.seats_total || 1);
  const [seatsUsed, setSeatsUsed] = useState(initialData?.seatsUsed || initialData?.seats_used || 0);
  const [companyId, setCompanyId] = useState(initialData?.companyId || initialData?.company_id || undefined);
  const [supplierId, setSupplierId] = useState(initialData?.supplierId || initialData?.supplier_id || undefined);
  const [manufacturerId, setManufacturerId] = useState(initialData?.manufacturerId || initialData?.manufacturer_id || undefined);
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || initialData?.expiration_date || '');
  const [productKey, setProductKey] = useState(initialData?.productKey || initialData?.product_key || '');
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || initialData?.purchase_date || '');
  const [purchaseCost, setPurchaseCost] = useState(initialData?.purchaseCost || initialData?.purchase_cost || undefined);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      name, 
      seatsTotal, 
      seatsUsed, 
      companyId, 
      supplierId, 
      manufacturerId, 
      expirationDate, 
      productKey, 
      purchaseDate, 
      purchaseCost, 
      notes 
    });
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
            <Input type="number" value={seatsTotal} onChange={(e) => setSeatsTotal(Number(e.target.value))} required className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Seats Used</label>
            <Input type="number" value={seatsUsed} onChange={(e) => setSeatsUsed(Number(e.target.value))} className="w-32" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Expiration Date</label>
            <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="w-52" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Product Key</label>
            <Input value={productKey} onChange={(e) => setProductKey(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Purchase Date</label>
            <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-52" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-right">Purchase Cost</label>
            <Input type="number" step="0.01" value={purchaseCost} onChange={(e) => setPurchaseCost(Number(e.target.value))} className="w-40" />
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
