import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Pencil, Trash2 } from 'lucide-react';

interface Depreciation {
  id: number;
  name: string;
  term: string;
  floorValue: number;
  assets: number;
  assetModels: number;
  licenses: number;
}

const mockDepreciations: Depreciation[] = [
  { id: 1, name: 'Computer Depreciation', term: '36 months', floorValue: 0, assets: 2530, assetModels: 15, licenses: 0 },
  { id: 2, name: 'Display Depreciation', term: '12 months', floorValue: 0, assets: 40, assetModels: 2, licenses: 0 },
  { id: 3, name: 'Furniture Depreciation', term: '24 months', floorValue: 0, assets: 27, assetModels: 1, licenses: 0 },
];

const columns: ColumnDef<Depreciation>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'term', header: 'Term', accessor: (r) => r.term },
  { key: 'floorValue', header: 'Floor Value', accessor: (r) => r.floorValue },
  { key: 'assets', header: 'Assets', accessor: (r) => r.assets },
  { key: 'assetModels', header: 'Asset Models', accessor: (r) => r.assetModels },
  { key: 'licenses', header: 'Licenses', accessor: (r) => r.licenses },
];

export const DepreciationView: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Depreciation</span>
      </div>

      

      <AssetDataTable
        data={mockDepreciations}
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
