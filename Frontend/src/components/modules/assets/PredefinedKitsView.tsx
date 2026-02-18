import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Pencil, Trash2, Package2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PredefinedKit } from '@/types/javabackendapi/assetTypes';
import { mockPredefinedKits } from '@/services/mockData/assets';

export const PredefinedKitsView: React.FC = () => {
  const columns: ColumnDef<PredefinedKit>[] = [
    { key: 'id', header: 'ID', accessor: (r) => r.id, defaultVisible: false },
    { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span>, defaultVisible: true },
    { key: 'createdBy', header: 'Created By', accessor: (r) => r.createdBy || '-', defaultVisible: false },
    { key: 'createdAt', header: 'Created At', accessor: (r) => r.createdAt || '-', defaultVisible: false },
    { key: 'updatedAt', header: 'Updated At', accessor: (r) => r.updatedAt || '-', defaultVisible: false },
    {
      key: 'checkInOut',
      header: 'Checkin/Checkout',
      accessor: () => (
        <Button size="sm" variant="outline" className="h-7 bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 rounded">
          Checkout
        </Button>
      ),
      defaultVisible: true,
      sticky: 'right'
    },
  ];
  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-3xl lg:text-2xl sm:text-sm font-bold tracking-tight">Predefined Kits</h1>
          </div>
        </div>

        <AssetDataTable
          data={mockPredefinedKits}
          columns={columns}
          viewType="kits"
          actions={(row) => (
            <>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Edit Kit</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Delete Kit</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        />
      </div>
    </div>
  );
};
