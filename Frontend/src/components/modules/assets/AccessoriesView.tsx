import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Copy, Pencil, Trash2 } from 'lucide-react';

interface Accessory {
  id: number;
  name: string;
  category: string;
  modelNo: string;
  location: string;
  minQty: number;
  total: number;
  checkedOut: number;
  unitCost: number;
}

const mockAccessories: Accessory[] = [
  { id: 1, name: 'USB Keyboard', category: 'Keyboards', modelNo: '39356161', location: 'New Nils', minQty: 2, total: 15, checkedOut: 0, unitCost: 0 },
  { id: 2, name: 'Bluetooth Keyboard', category: 'Keyboards', modelNo: '47637307', location: 'Huelsborough', minQty: 2, total: 10, checkedOut: 0, unitCost: 0 },
  { id: 3, name: 'Magic Mouse', category: 'Mouse', modelNo: '23203310', location: 'Huelsborough', minQty: 2, total: 13, checkedOut: 0, unitCost: 0 },
  { id: 4, name: 'Sculpt Comfort Mouse', category: 'Mouse', modelNo: '45469059', location: 'North Derickfort', minQty: 2, total: 13, checkedOut: 0, unitCost: 0 },
];

const columns: ColumnDef<Accessory>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'category', header: 'Category', accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />{r.category}</span> },
  { key: 'modelNo', header: 'Model No.', accessor: (r) => r.modelNo },
  { key: 'location', header: 'Location', accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-400 inline-block" />{r.location}</span> },
  { key: 'minQty', header: 'Min. QTY', accessor: (r) => r.minQty },
  { key: 'total', header: 'Total', accessor: (r) => r.total },
  { key: 'checkedOut', header: 'Checked Out', accessor: (r) => r.checkedOut },
  { key: 'unitCost', header: 'Unit Cost', accessor: (r) => r.unitCost || '—' },
  { key: 'checkout', header: 'In/Out', accessor: () => <Button size="sm" className="h-7 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 rounded">Checkout</Button> },
];

export const AccessoriesView: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Accessories</span>
      </div>

      <AssetDataTable
        data={mockAccessories}
        columns={columns}
        onAdd={() => {}}
        actions={(row) => (
          <>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-sky-400 hover:bg-sky-500 text-white rounded">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-amber-400 hover:bg-amber-500 text-white rounded">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-red-400 hover:bg-red-500 text-white rounded">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      />
    </div>
  );
};
