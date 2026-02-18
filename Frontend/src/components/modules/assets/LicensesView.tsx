import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Copy, Pencil, Trash2, Key } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { License } from '@/types/javabackendapi/assetTypes';
import { mockLicenses } from '@/services/mockData/assets';

export const LicensesView: React.FC = () => {

  const columns: ColumnDef<License>[] = [
    { key: 'id', header: 'ID', accessor: (r) => r.id, defaultVisible: false },
    { key: 'company', header: 'Company', accessor: () => '-', defaultVisible: false },
    { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span>, defaultVisible: true },
    { key: 'productKey', header: 'Product Key', accessor: (r) => <span className="font-mono text-xs">{r.productKey}</span>, defaultVisible: true },
    { key: 'expirationDate', header: 'Expiration Date', accessor: (r) => r.expirationDate, defaultVisible: true },
    { key: 'terminationDate', header: 'Termination Date', accessor: (r) => r.terminationDate || '—', defaultVisible: false },
    { key: 'licensedToEmail', header: 'Licensed to Email', accessor: (r) => <span className="text-sky-600 hover:underline cursor-pointer">📧 {r.licensedToEmail}</span>, defaultVisible: true },
    { key: 'licensedTo', header: 'Licensed To', accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />{r.licensedTo}</span>, defaultVisible: true },
    { key: 'category', header: 'Category', accessor: (r) => r.category || '-', defaultVisible: false },
    { key: 'supplier', header: 'Supplier', accessor: (r) => r.supplier || '-', defaultVisible: false },
    { key: 'manufacturer', header: 'Manufacturer', accessor: (r) => r.manufacturer, defaultVisible: true },
    { key: 'minQty', header: 'Min QTY', accessor: (r) => r.minQty, defaultVisible: true },
    { key: 'total', header: 'Total', accessor: (r) => r.total, defaultVisible: true },
    { key: 'avail', header: 'Avail', accessor: (r) => r.avail, defaultVisible: true },
    { key: 'purchaseDate', header: 'Purchase Date', accessor: (r) => r.purchaseDate || '-', defaultVisible: false },
    { key: 'depreciation', header: 'Depreciation', accessor: (r) => r.depreciation || '-', defaultVisible: false },
    { key: 'maintained', header: 'Maintained', accessor: (r) => r.maintained ? 'Yes' : 'No', defaultVisible: false },
    { key: 'reassignable', header: 'Reassignable', accessor: (r) => r.reassignable ? 'Yes' : 'No', defaultVisible: false },
    { key: 'purchaseCost', header: 'Purchase Cost', accessor: (r) => r.purchaseCost || '-', defaultVisible: false },
    { key: 'purchaseOrderNumber', header: 'Purchase Order Number', accessor: (r) => r.purchaseOrderNumber || '-', defaultVisible: false },
    { key: 'orderNumber', header: 'Order Number', accessor: (r) => r.orderNumber || '-', defaultVisible: false },
    { key: 'createdBy', header: 'Created By', accessor: (r) => r.createdBy || '-', defaultVisible: false },
    { key: 'createdAt', header: 'Created At', accessor: (r) => r.createdAt || '-', defaultVisible: false },
    { key: 'updatedAt', header: 'Updated At', accessor: (r) => r.updatedAt || '-', defaultVisible: false },
    { key: 'notes', header: 'Notes', accessor: (r) => r.notes || '-', defaultVisible: false },
    {
      key: 'checkInOut',
      header: 'Check In/Out',
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
