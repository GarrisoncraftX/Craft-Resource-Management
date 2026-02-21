import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Copy, Pencil, Trash2, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { License } from '@/types/javabackendapi/assetTypes';
import { mockLicenses } from '@/services/mockData/assets';

export const LicensesView: React.FC = () => {

  const columns: ColumnDef<License>[] = [
    { key: 'id', header: 'ID', accessor: (r) => r.id, defaultVisible: false },
    { key: 'company_id', header: 'Company', accessor: (r) => r.company_id || '-', defaultVisible: false },
    { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span>, defaultVisible: true },
    { key: 'seats_total', header: 'Seats', accessor: (r) => r.seats_total, defaultVisible: true },
    { key: 'seats_used', header: 'Seats Used', accessor: (r) => r.seats_used, defaultVisible: true },
    { key: 'available_seats', header: 'Available', accessor: (r) => (r.available_seats !== undefined ? r.available_seats : r.seats_total - r.seats_used), defaultVisible: true },
    { key: 'company_id', header: 'Company ID', accessor: (r) => r.company_id || '-', defaultVisible: false },
    { key: 'supplier_id', header: 'Supplier ID', accessor: (r) => r.supplier_id || '-', defaultVisible: false },
    { key: 'manufacturer_id', header: 'Manufacturer ID', accessor: (r) => r.manufacturer_id || '-', defaultVisible: true },
    { key: 'expiration_date', header: 'Expiration Date', accessor: (r) => r.expiration_date || '-', defaultVisible: true },
    { key: 'product_key', header: 'Product Key', accessor: (r) => r.product_key ? <span className="font-mono text-xs">{r.product_key}</span> : '-', defaultVisible: false },
    { key: 'purchase_date', header: 'Purchase Date', accessor: (r) => r.purchase_date || '-', defaultVisible: false },
    { key: 'purchase_cost', header: 'Purchase Cost', accessor: (r) => r.purchase_cost || '-', defaultVisible: false },
    { key: 'notes', header: 'Notes', accessor: (r) => r.notes || '-', defaultVisible: false },
    { key: 'created_at', header: 'Created At', accessor: (r) => r.created_at || '-', defaultVisible: false },
    { key: 'updated_at', header: 'Updated At', accessor: (r) => r.updated_at || '-', defaultVisible: false },
    {
      key: 'checkout',
      header: 'Actions',
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
            <h1 className="text-3xl lg:text-2xl sm:text-sm font-bold tracking-tight">Licenses</h1>
          </div>
        </div>

        <AssetDataTable
          data={mockLicenses}
          columns={columns}
          viewType="licenses"
          actions={(row) => (
            <>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Clone License</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Edit License</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Delete License</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        />
      </div>
    </div>
  );
};
