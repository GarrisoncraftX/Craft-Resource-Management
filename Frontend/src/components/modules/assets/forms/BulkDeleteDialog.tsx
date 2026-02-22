import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';
import type { Asset } from '@/types/javabackendapi/assetTypes';
import { toast } from 'sonner';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  onConfirmDelete: (ids: (number | string)[]) => void;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({ open, onOpenChange, assets, onConfirmDelete }) => {
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set(assets.map((a) => a.id)));
    }
  }, [open, assets]);

  const toggleId = (id: number | string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error('No assets selected for deletion');
      return;
    }
    setIsDeleting(true);
    try {
      onConfirmDelete(Array.from(selectedIds));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Bulk Delete Assets</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Review the assets for bulk deletion below. Once deleted, assets can be restored, but they will no longer be associated with any users they are currently assigned to.
        </p>

        {/* Warning Banner */}
        <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-3 rounded">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">You are about to delete {selectedIds.size} assets.</span>
        </div>

        {/* Asset Table */}
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 text-left w-10"></th>
                <th className="px-4 py-2 text-left font-bold text-gray-700">ID</th>
                <th className="px-4 py-2 text-left font-bold text-gray-700">Asset Name</th>
                <th className="px-4 py-2 text-left font-bold text-gray-700">Location</th>
                <th className="px-4 py-2 text-left font-bold text-gray-700">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, idx) => (
                <tr key={asset.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2">
                    <Checkbox
                      checked={selectedIds.has(asset.id)}
                      onCheckedChange={() => toggleId(asset.id)}
                    />
                  </td>
                  <td className="px-4 py-2 text-sky-600">{idx + 1}</td>
                  <td className="px-4 py-2">#{asset.assetTag} - {asset.assetName}</td>
                  <td className="px-4 py-2">{asset.location || ''}</td>
                  <td className="px-4 py-2">{asset.assignedTo || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-sm text-sky-600 hover:underline"
          >
            Cancel
          </button>
          <Button onClick={handleDelete} disabled={isDeleting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            ✓ {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
