import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from '../AssetDataTable';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Category } from '@/types/javabackendapi/assetTypes';
import { mockCategories } from '@/services/mockData/assets';
import { assetApiService } from '@/services/javabackendapi/assetApi';


const columns: ColumnDef<Category>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer flex items-center gap-2">{r.image} {r.name}</span> },
  { key: 'image', header: 'Image', accessor: (r) => <span className="text-2xl">{r.image}</span> },
  { key: 'type', header: 'Type', accessor: (r) => r.type },
  { key: 'qty', header: 'QTY', accessor: (r) => r.qty },
  { key: 'acceptance', header: 'Acceptance', accessor: (r) => r.acceptance ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
  { key: 'useDefaultEULA', header: 'Use default EULA', accessor: (r) => r.useDefaultEULA ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
];

export const CategoriesView: React.FC = () => {
  const [data, setData] = useState<Category[]>(mockCategories);

  useEffect(() => {
    assetApiService.getAllCategories().then(setData).catch(() => setData(mockCategories));
  }, []);

  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Categories</span>
      </div>

      <AssetDataTable
        data={data}
        columns={columns}
        onAdd={() => {}}
        viewType="settings"
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
