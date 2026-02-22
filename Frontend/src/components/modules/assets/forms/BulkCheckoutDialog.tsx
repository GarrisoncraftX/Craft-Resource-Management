import { assetApiService } from '@/services/javabackendapi/assetApi';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Check, AlertTriangle } from 'lucide-react';
import type { Asset } from '@/types/javabackendapi/assetTypes';
import { toast } from 'sonner';

interface BulkCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  onCheckout?: (data: { updatedAssets: Asset[] }) => void;
}

export const BulkCheckoutDialog: React.FC<BulkCheckoutDialogProps> = ({ open, onOpenChange, assets, onCheckout }) => {
  const normalizeStatus = (s?: string | null) => (s || '').trim().toLowerCase();
  const isAssetCheckedOut = (a: Asset) => {
    const s = normalizeStatus(a.status);
    return (
      s === 'deployed' ||
      s === 'in use' ||
      s === 'checked out' ||
      a.status_id === 2 ||
      !!(a.assignedTo ?? a.assigned_to)
    );
  };

  const alreadyCheckedOut = assets.filter(isAssetCheckedOut);
  const eligible = assets.filter((a) => !isAssetCheckedOut(a));

  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<number | string>>(new Set());
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('');
  const [checkoutType, setCheckoutType] = useState<'user' | 'asset' | 'location'>('user');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [expectedCheckinDate, setExpectedCheckinDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [assetsForCheckout, setAssetsForCheckout] = useState<Array<{ id: number; assetTag: string; assetName: string }>>([]);

  React.useEffect(() => {
    if (open) {
      setSelectedAssetIds(new Set(eligible.map((a) => a.id)));
      (async () => {
        try {
          const locData = await assetApiService.getAllLocations();
          setLocations(locData);
          setUsers([{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]);
          setAssetsForCheckout(assets.map(a => ({ id: Number(a.id), assetTag: a.assetTag || '', assetName: a.assetName || '' })));
        } catch (err) {
          console.error('Failed to fetch dropdown data:', err);
        }
      })();
    }
  }, [open, assets, eligible]);

  const removeAsset = (id: number | string) => {
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssetIds.size === 0) {
      toast.error('No eligible assets selected');
      return;
    }
    if (!assignedTo) {
      toast.error('Please select a user/location/asset to checkout to');
      return;
    }

    setIsSubmitting(true);
    try {
      const checkoutPromises = Array.from(selectedAssetIds).map((assetId) =>
        assetApiService.checkoutAsset(Number(assetId), Number(assignedTo), checkoutType, notes)
      );

      const results = await Promise.all(checkoutPromises);
      const updatedAssets = results.map((result, idx) => {
        const assetId = Array.from(selectedAssetIds)[idx];
        const originalAsset = assets.find((a) => a.id === assetId);
        return {
          ...originalAsset,
          ...result,
          status: status || 'Deployed',
          assignedTo: Number(assignedTo),
          assignedType: checkoutType,
          expectedCheckin: expectedCheckinDate || undefined,
        } as Asset;
      });

      onCheckout?.({ updatedAssets });
    } catch (error) {
      console.error('Failed to checkout assets:', error);
      toast.error('Failed to checkout some assets');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Bulk Checkout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning for already checked out */}
          {alreadyCheckedOut.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-3 rounded">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-bold">Warning</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-gray-700">
                <p className="font-semibold mb-1">The following assets are already checked out and will not be processed:</p>
                <ul className="list-disc list-inside mt-1">
                  {alreadyCheckedOut.map((a) => (
                    <li key={a.id}>
                      #{a.assetTag || a.asset_tag} - {a.assetName || a.asset_name || a.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Assets tags display */}
          <div className="flex items-start gap-4">
            <label htmlFor="bulk-checkout-assets" className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Assets</label>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1 p-2 border border-amber-400 border-l-4 rounded bg-white max-h-48 overflow-y-auto">
                {Array.from(selectedAssetIds).map(id => {
                  const asset = assets.find(a => a.id === id);
                  return (
                    <Badge key={String(id)} className="bg-sky-600 text-white gap-1 px-2 py-1">
                      <button type="button" onClick={() => removeAsset(id)} className="hover:text-red-200">
                        <X className="w-3 h-3" />
                      </button>
                      #{asset?.assetTag} - {asset?.assetName}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <label htmlFor="bulk-checkout-status" className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="bulk-checkout-status" className="flex-1"><SelectValue placeholder="Do not change" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Do not change</SelectItem>
                <SelectItem value="Deployed">Deployed</SelectItem>
                <SelectItem value="In Use">In Use</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkout to type */}
          <div className="flex items-center gap-4">
            <label htmlFor="bulk-checkout-type" className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Checkout to</label>
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

          {/* Assigned To */}
          <div className="flex items-center gap-4">
            <label htmlFor="bulk-checkout-assigned" className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">
              {checkoutType === 'user' ? 'User' : checkoutType === 'asset' ? 'Asset' : 'Location'}
            </label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="bulk-checkout-assigned" className="flex-1 border-l-4 border-l-amber-400">
                <SelectValue placeholder={`Select ${checkoutType}`} />
              </SelectTrigger>
              <SelectContent>
                {checkoutType === 'user' && users.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                ))}
                {checkoutType === 'location' && locations.map(l => (
                  <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                ))}
                {checkoutType === 'asset' && assetsForCheckout.map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>#{a.assetTag} - {a.assetName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkout Date */}
          <div className="flex items-center gap-4">
            <label htmlFor="bulk-checkout-date" className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Checkout Date</label>
            <Input id="bulk-checkout-date" type="date" value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} className="w-52" />
          </div>

          {/* Expected Checkin Date */}
          <div className="flex items-center gap-4">
            <label htmlFor="bulk-expected-checkin" className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Expected Checkin Date</label>
            <Input id="bulk-expected-checkin" type="date" value={expectedCheckinDate} onChange={(e) => setExpectedCheckinDate(e.target.value)} className="w-52" />
          </div>

          {/* Notes */}
          <div className="flex items-start gap-4">
            <label htmlFor="bulk-checkout-notes" className="w-40 text-sm font-bold text-gray-700 text-right shrink-0 mt-2">Notes</label>
            <Textarea id="bulk-checkout-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-h-20" />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-sky-600 hover:underline">Cancel</button>
            <Button type="submit" disabled={isSubmitting || selectedAssetIds.size === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="w-4 h-4 mr-1" /> {isSubmitting ? 'Checking out...' : 'Checkout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
