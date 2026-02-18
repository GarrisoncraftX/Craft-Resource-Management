import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Copy, Pencil, Trash2 } from 'lucide-react';

interface Consumable {
  id: number;
  name: string;
  category: string;
  modelNo: string;
  location: string;
  itemNo: string;
  orderNumber: string;
  purchaseDate: string;
  minQty: number;
  total: number;
  remain: number;
  inOut: string;
}

const mockConsumables: Consumable[] = [
  {
    id: 1,
    name: 'Cardstock (White)',
    category: 'Printer Paper',
    modelNo: '20666418',
    location: '—',
    itemNo: '25879908',
    orderNumber: '—',
    purchaseDate: 'Wed Oct 15, 2025',
    minQty: 2,
    total: 10,
    remain: 8,
    inOut: 'In',
  },
  {
    id: 2,
    name: 'Laserjet Paper (Ream)',
    category: 'Printer Paper',
    modelNo: '31397262',
    location: '—',
    itemNo: '11681605',
    orderNumber: '—',
    purchaseDate: 'Wed Mar 19, 2025',
    minQty: 2,
    total: 20,
    remain: 18,
    inOut: 'In',
  },
  {
    id: 3,
    name: 'Laserjet Toner (black)',
    category: 'Printer Ink',
    modelNo: '13331167',
    location: '—',
    itemNo: '33956975',
    orderNumber: '—',
    purchaseDate: 'Wed Jan 14, 2026',
    minQty: 2,
    total: 20,
    remain: 18,
    inOut: 'In',
  },
];

const columns: ColumnDef<Consumable>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'category', header: 'Category', accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />{r.category}</span> },
  { key: 'modelNo', header: 'Model No.', accessor: (r) => r.modelNo },
  { key: 'location', header: 'Location', accessor: (r) => r.location },
  { key: 'itemNo', header: 'Item No.', accessor: (r) => r.itemNo },
  { key: 'orderNumber', header: 'Order Number', accessor: (r) => r.orderNumber },
  { key: 'purchaseDate', header: 'Purchase Date', accessor: (r) => r.purchaseDate },
  { key: 'minQty', header: 'Min. QTY', accessor: (r) => r.minQty },
  { key: 'total', header: 'Total', accessor: (r) => r.total },
  { key: 'remain', header: 'Remain', accessor: (r) => r.remain },
  { key: 'inOut', header: 'In/Out', accessor: () => <Button size="sm" className="h-7 bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 rounded">Checkout</Button> },
];

export const ConsumablesView: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Consumables</span>
      </div>

      <AssetDataTable
        data={mockConsumables}
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
