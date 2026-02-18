import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Pencil, Trash2, Check, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  image: string;
  type: string;
  qty: number;
  acceptance: boolean;
  useDefaultEULA: boolean;
}

const mockCategories: Category[] = [
  { id: 1, name: 'Desktops', image: '💻', type: 'Asset', qty: 90, acceptance: true, useDefaultEULA: false },
  { id: 2, name: 'Office Software', image: '📊', type: 'License', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 3, name: 'Graphics Software', image: '🎨', type: 'License', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 4, name: 'RAM', image: '⚡', type: 'Component', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 5, name: 'HDD/SSD', image: '💾', type: 'Component', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 6, name: 'Printer Ink', image: '🖨️', type: 'Consumable', qty: 1, acceptance: true, useDefaultEULA: false },
  { id: 7, name: 'Printer Paper', image: '📄', type: 'Consumable', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 8, name: 'Mouse', image: '🖱️', type: 'Accessory', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 9, name: 'Keyboards', image: '⌨️', type: 'Accessory', qty: 2, acceptance: true, useDefaultEULA: false },
  { id: 10, name: 'Conference Phones', image: '☎️', type: 'Asset', qty: 0, acceptance: true, useDefaultEULA: false },
  { id: 11, name: 'VOIP Phones', image: '📞', type: 'Asset', qty: 70, acceptance: true, useDefaultEULA: false },
  { id: 12, name: 'Displays', image: '🖥️', type: 'Asset', qty: 40, acceptance: true, useDefaultEULA: false },
  { id: 13, name: 'Mobile Phone', image: '📱', type: 'Asset', qty: 67, acceptance: true, useDefaultEULA: false },
  { id: 14, name: 'Tablets', image: '📲', type: 'Asset', qty: 40, acceptance: true, useDefaultEULA: false },
  { id: 15, name: 'Laptops', image: '💻', type: 'Asset', qty: 2290, acceptance: true, useDefaultEULA: true },
  { id: 16, name: 'GSMR', image: '📡', type: 'Asset', qty: 2, acceptance: true, useDefaultEULA: true },
  { id: 17, name: 'Dockstation TBT 3', image: '🔌', type: 'Accessory', qty: 1, acceptance: true, useDefaultEULA: true },
];

const columns: ColumnDef<Category>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer flex items-center gap-2">{r.image} {r.name}</span> },
  { key: 'image', header: 'Image', accessor: (r) => <span className="text-2xl">{r.image}</span> },
  { key: 'type', header: 'Type', accessor: (r) => r.type },
  { key: 'qty', header: 'QTY', accessor: (r) => r.qty },
  { key: 'acceptance', header: 'Acceptance', accessor: (r) => r.acceptance ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
  { key: 'useDefaultEULA', header: 'Use default EULA', accessor: (r) => r.useDefaultEULA ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
];

export const CategoriesView: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Categories</span>
      </div>

      

      <AssetDataTable
        data={mockCategories}
        columns={columns}
        onAdd={() => {}}
        actions={(row) => (
          <>
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
