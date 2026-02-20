import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from '../AssetDataTable';
import { Pencil, Trash2 } from 'lucide-react';
import type { Depreciation } from '@/types/javabackendapi/assetTypes';
import { mockDepreciations } from '@/services/mockData/assets';
import { assetApiService } from '@/services/javabackendapi/assetApi';





const columns: ColumnDef<Depreciation>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'term', header: 'Term', accessor: (r) => r.term },
  { key: 'floorValue', header: 'Floor Value', accessor: (r) => r.floorValue },
  { key: 'assets', header: 'Assets', accessor: (r) => r.assets },
  { key: 'assetModels', header: 'Asset Models', accessor: (r) => r.assetModels },
  { key: 'licenses', header: 'Licenses', accessor: (r) => r.licenses },
];

export const DepreciationView: React.FC = () => {
  const [data, setData] = useState<Depreciation[]>(mockDepreciations);

  useEffect(() => {
    assetApiService.getAllDepreciations().then(setData).catch(() => setData(mockDepreciations));
  }, []);

  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Depreciation</span>
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
