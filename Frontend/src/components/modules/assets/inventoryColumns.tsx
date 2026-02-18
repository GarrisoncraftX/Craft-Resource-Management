import React from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { ColumnDef } from './AssetDataTable';
import type { BaseInventoryItem } from '@/types/javabackendapi/assetTypes';

export function createInventoryColumns<T extends BaseInventoryItem>(
  type: 'accessories' | 'consumables' | 'components'
): ColumnDef<T>[] {
  const baseColumns: ColumnDef<T>[] = [
    { key: 'id', header: 'ID', accessor: (r) => r.id, defaultVisible: false },
  ];

  // Name column (only for accessories and components)
  if (type === 'accessories' || type === 'components') {
    baseColumns.push({
      key: 'name',
      header: 'Name',
      accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span>,
      defaultVisible: type === 'components'
    });
  }

  baseColumns.push(
    { key: 'company', header: 'Company', accessor: (r) => r.company || '-', defaultVisible: false },
    {
      key: 'image',
      header: type === 'accessories' ? 'Device Image' : 'Image',
      accessor: () => <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center"><Package className="w-4 h-4 text-purple-600" /></div>,
      defaultVisible: true
    }
  );

  // Serial (only for components)
  if (type === 'components') {
    baseColumns.push({
      key: 'serial',
      header: 'Serial',
      accessor: (r) => <span className="font-mono text-xs">{r.serial || 'N/A'}</span>,
      defaultVisible: false
    });
  }

  baseColumns.push(
    {
      key: 'category',
      header: 'Category',
      accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />{r.category}</span>,
      defaultVisible: true
    },
    { key: 'supplier', header: 'Supplier', accessor: (r) => r.supplier || '-', defaultVisible: false },
    { key: 'modelNo', header: 'Model No.', accessor: (r) => <span className="font-mono text-xs">{r.modelNo}</span>, defaultVisible: true }
  );

  // Item No. (only for consumables)
  if (type === 'consumables') {
    baseColumns.push({
      key: 'itemNo',
      header: 'Item No.',
      accessor: (r) => r.itemNo || '-',
      defaultVisible: false
    });
  }

  baseColumns.push(
    { key: 'manufacturer', header: 'Manufacturer', accessor: (r) => r.manufacturer || '-', defaultVisible: false },
    {
      key: 'location',
      header: 'Location',
      accessor: (r) => <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-400 inline-block" />{r.location}</span>,
      defaultVisible: true
    },
    { key: 'orderNumber', header: 'Order Number', accessor: (r) => r.orderNumber || '-', defaultVisible: false },
    { key: 'purchaseDate', header: 'Purchase Date', accessor: (r) => r.purchaseDate || '-', defaultVisible: false },
    { key: 'minQty', header: 'Min. QTY', accessor: (r) => r.minQty, defaultVisible: true },
    { key: 'total', header: 'Total', accessor: (r) => r.total, defaultVisible: true }
  );

  // Remaining (for consumables and components) or Avail (for accessories)
  if (type === 'consumables' || type === 'components') {
    baseColumns.push({
      key: 'remaining',
      header: 'Remaining',
      accessor: (r) => r.remaining || 0,
      defaultVisible: true
    });
  } else {
    baseColumns.push({
      key: 'avail',
      header: 'Avail',
      accessor: (r) => r.avail || 0,
      defaultVisible: true
    });
  }

  // Checked Out (only for accessories)
  if (type === 'accessories') {
    baseColumns.push({
      key: 'checkedOut',
      header: 'Checked Out',
      accessor: (r) => r.checkedOut || 0,
      defaultVisible: true
    });
  }

  baseColumns.push(
    { key: 'unitCost', header: 'Unit Cost', accessor: (r) => r.unitCost || '—', defaultVisible: true },
    { key: 'totalCost', header: 'Total Cost', accessor: (r) => r.totalCost || '-', defaultVisible: false },
    { key: 'notes', header: 'Notes', accessor: (r) => r.notes || '-', defaultVisible: false },
    { key: 'createdBy', header: 'Created By', accessor: (r) => r.createdBy || '-', defaultVisible: false },
    { key: 'createdAt', header: 'Created At', accessor: (r) => r.createdAt || '-', defaultVisible: false },
    { key: 'updatedAt', header: 'Updated At', accessor: (r) => r.updatedAt || '-', defaultVisible: false },
    {
      key: 'checkInOut',
      header: 'In/Out',
      accessor: () => (
        <Button size="sm" variant="outline" className="h-7 bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 rounded">
          Checkout
        </Button>
      ),
      defaultVisible: true,
      sticky: 'right'
    }
  );

  return baseColumns;
}
