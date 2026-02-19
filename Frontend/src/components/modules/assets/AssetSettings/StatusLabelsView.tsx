import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from '../AssetDataTable';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StatusLabel } from '@/types/javabackendapi/assetTypes';
import { mockStatusLabels } from '@/services/mockData/assets';

const columns: ColumnDef<StatusLabel>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'statusType', header: 'Status Type', accessor: (r) => <Badge className="bg-sky-500 text-white text-xs px-2 py-0.5">{r.statusType}</Badge> },
  { key: 'assets', header: 'Assets', accessor: (r) => r.assets },
  { key: 'chartColor', header: 'Chart Color', accessor: (r) => r.chartColor },
  { key: 'showInSideNav', header: 'Show in side nav', accessor: (r) => r.showInSideNav ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
  { key: 'defaultLabel', header: 'Default Label', accessor: (r) => r.defaultLabel ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
];

export const StatusLabelsView: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Status Labels</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-800">Status Descriptions</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">🟢</span>
            <div>
              <p className="font-semibold text-emerald-600">Deployable</p>
              <p className="text-gray-600 text-xs">These assets can be checked out. Once they are assigned, they will assume a meta status of Deployed.</p>
            </div>
          </div>

          <hr className="my-2" />

          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">🟠</span>
            <div>
              <p className="font-semibold text-amber-600">Pending</p>
              <p className="text-gray-600 text-xs">These assets can not yet be assigned to anyone, often used for items in return to circulation.</p>
            </div>
          </div>

          <hr className="my-2" />

          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">🔴</span>
            <div>
              <p className="font-semibold text-red-600">Undeployable</p>
              <p className="text-gray-600 text-xs">These assets cannot be assigned to anyone.</p>
            </div>
          </div>

          <hr className="my-2" />

          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">🔲</span>
            <div>
              <p className="font-semibold text-gray-600">Archived</p>
              <p className="text-gray-600 text-xs">These assets cannot be checked out, and will only show up in the Archived view. This is useful for retaining information about assets for budgeting/historic purposes but keeping them out of the day-to-day asset list.</p>
            </div>
          </div>
        </div>
      </div>

      <AssetDataTable
        data={mockStatusLabels}
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
