import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Copy, Pencil, Trash2 } from 'lucide-react';

interface Component {
  id: number;
  name: string;
  serial: string;
  category: string;
  modelNo: string;
  location: string;
  orderNumber: string;
  purchaseDate: string;
  minQty: number;
  total: number;
  remaining: number;
  unitCost: number;
  totalCost: number;
}

const mockComponents: Component[] = [
  {
    id: 1,
    name: 'Crucial BX300 120GB SATA Internal SSD',
    serial: 'bbad40e2-bbdf-3bef-9170-6ccb97f647d1',
    category: 'HDD/SSD',
    modelNo: '1667292',
    location: 'Alycefurt',
    orderNumber: '33982543',
    purchaseDate: 'Sat Jul 04, 2009',
    minQty: 2,
    total: 10,
    remaining: 10,
    unitCost: 782.88,
    totalCost: 7828.80,
  },
  {
    id: 2,
    name: 'Crucial BX300 240GB SATA Internal SSD',
    serial: 'd169686e-0d6b-307a-be9b-bd89231ec3b2',
    category: 'HDD/SSD',
    modelNo: '7713582',
    location: 'Alycefurt',
    orderNumber: '12104514',
    purchaseDate: 'Sun Mar 10, 1991',
    minQty: 2,
    total: 10,
    remaining: 10,
    unitCost: 5185339.89,
    totalCost: 51853398.90,
  },
  {
    id: 3,
    name: 'Crucial 4GB DDR3L-1600 SODIMM',
    serial: 'b0e0c2b6-65f0-37a8-9ecc-2e7aaefdb54',
    category: 'RAM',
    modelNo: '13638707',
    location: 'Alycefurt',
    orderNumber: '43469529',
    purchaseDate: 'Mon Nov 12, 1973',
    minQty: 2,
    total: 10,
    remaining: 10,
    unitCost: 587775.82,
    totalCost: 5877758.20,
  },
  {
    id: 4,
    name: 'Crucial 8GB DDR3L-1600 SODIMM Memory for Mac',
    serial: 'bcff75cb-24d7-3f67-9f8e-959a4adee950',
    category: 'RAM',
    modelNo: '24970230',
    location: 'Port Elsie',
    orderNumber: '5358154',
    purchaseDate: 'Thu Mar 30, 2000',
    minQty: 2,
    total: 10,
    remaining: 10,
    unitCost: 225213910.65,
    totalCost: 2252139106.50,
  },
];

const columns: ColumnDef<Component>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'serial', header: 'Serial', accessor: (r) => r.serial },
  { key: 'category', header: 'Category', accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />{r.category}</span> },
  { key: 'modelNo', header: 'Model No.', accessor: (r) => r.modelNo },
  { key: 'location', header: 'Location', accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-400 inline-block" />{r.location}</span> },
  { key: 'orderNumber', header: 'Order Number', accessor: (r) => r.orderNumber },
  { key: 'purchaseDate', header: 'Purchase Date', accessor: (r) => r.purchaseDate },
  { key: 'minQty', header: 'Min. QTY', accessor: (r) => r.minQty },
  { key: 'total', header: 'Total', accessor: (r) => r.total },
  { key: 'remaining', header: 'Remaining', accessor: (r) => r.remaining },
  { key: 'unitCost', header: 'Unit Cost', accessor: (r) => `$${r.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
  { key: 'totalCost', header: 'Total Cost', accessor: (r) => `$${r.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
];

export const ComponentsView: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Components</span>
      </div>

      <AssetDataTable
        data={mockComponents}
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
