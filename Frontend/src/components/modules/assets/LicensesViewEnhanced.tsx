import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Copy, Pencil, Trash2 } from 'lucide-react';

interface License {
  id: number;
  name: string;
  productKey: string;
  expirationDate: string;
  licensedToEmail: string;
  licensedTo: string;
  manufacturer: string;
  minQty: number;
  total: number;
  checkinCheckout: string;
}

const mockLicenses: License[] = [
  {
    id: 1,
    name: 'Photoshop',
    productKey: '0281cda-...',
    expirationDate: '—',
    licensedToEmail: 'vsteuber@example.net',
    licensedTo: 'Adobe',
    manufacturer: 'Adobe',
    minQty: 10,
    total: 10,
    checkinCheckout: 'Available',
  },
  {
    id: 2,
    name: 'InDesign',
    productKey: '0c700f45-...',
    expirationDate: '—',
    licensedToEmail: 'liza65@example.com',
    licensedTo: 'Adobe',
    manufacturer: 'Adobe',
    minQty: 10,
    total: 10,
    checkinCheckout: 'Available',
  },
  {
    id: 3,
    name: 'Acrobat',
    productKey: '644532b9-...',
    expirationDate: '—',
    licensedToEmail: 'bquitzon@example.com',
    licensedTo: 'Adobe',
    manufacturer: 'Adobe',
    minQty: 10,
    total: 10,
    checkinCheckout: 'Available',
  },
  {
    id: 4,
    name: 'Office',
    productKey: '07be4282-...',
    expirationDate: '—',
    licensedToEmail: 'zakary.wunsch@example.com',
    licensedTo: 'Microsoft',
    manufacturer: 'Microsoft',
    minQty: 20,
    total: 20,
    checkinCheckout: 'Available',
  },
];

const columns: ColumnDef<License>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'productKey', header: 'Product Key', accessor: (r) => r.productKey },
  { key: 'expirationDate', header: 'Expiration Date', accessor: (r) => r.expirationDate },
  { key: 'licensedToEmail', header: 'Licensed to Email', accessor: (r) => <span className="text-sky-600 hover:underline cursor-pointer">📧 {r.licensedToEmail}</span> },
  { key: 'licensedTo', header: 'Licensed To', accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />{r.licensedTo}</span> },
  { key: 'manufacturer', header: 'Manufacturer', accessor: (r) => r.manufacturer },
  { key: 'minQty', header: 'Min QTY', accessor: (r) => r.minQty },
  { key: 'total', header: 'Total', accessor: (r) => r.total },
  { key: 'checkinCheckout', header: 'Checkin/Checkout', accessor: () => <Button size="sm" className="h-7 bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 rounded">Checkout</Button> },
];

export const LicensesViewEnhanced: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Licenses</span>
      </div>

      

      <AssetDataTable
        data={mockLicenses}
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
