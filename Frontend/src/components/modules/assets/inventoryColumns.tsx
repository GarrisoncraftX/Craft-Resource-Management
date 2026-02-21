import React from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { ColumnDef } from './AssetDataTable';
import type { Consumable, Component } from '@/types/javabackendapi/assetTypes';

export function createInventoryColumns<T extends Consumable | Component>(
  type: 'consumables' | 'components'
): ColumnDef<T>[] {
  const baseColumns: ColumnDef<T>[] = [
    { key: 'id', header: 'ID', accessor: (r) => r.id, defaultVisible: false },
    { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span>, defaultVisible: true },
    { key: 'company_id', header: 'Company', accessor: (r) => r.company_id || '-', defaultVisible: false },
    {
      key: 'image',
      header: 'Image',
      accessor: () => <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center"><Package className="w-4 h-4 text-purple-600" /></div>,
      defaultVisible: true
    }
  ];

  if (type === 'components') {
    baseColumns.push({
      key: 'serial',
      header: 'Serial',
      accessor: (r) => <span className="font-mono text-xs">{(r as Component).serial || 'N/A'}</span>,
      defaultVisible: false
    });
  }

  baseColumns.push(
    { key: 'category_id', header: 'Category', accessor: (r) => r.category_id || '-', defaultVisible: true },
    { key: 'supplier_id', header: 'Supplier', accessor: (r) => r.supplier_id || '-', defaultVisible: false },
    { key: 'model_no', header: 'Model No.', accessor: (r) => r.model_no ? <span className="font-mono text-xs">{r.model_no}</span> : '-', defaultVisible: true }
  );

  if (type === 'consumables') {
    baseColumns.push({
      key: 'item_no',
      header: 'Item No.',
      accessor: (r) => (r as Consumable).item_no || '-',
      defaultVisible: false
    });
  }

  baseColumns.push(
    { key: 'manufacturer_id', header: 'Manufacturer', accessor: (r) => r.manufacturer_id || '-', defaultVisible: false },
    { key: 'location_id', header: 'Location', accessor: (r) => r.location_id || '-', defaultVisible: true },
    { key: 'min_qty', header: 'Min. QTY', accessor: (r) => r.min_qty, defaultVisible: true },
    { key: 'qty_total', header: 'Total', accessor: (r) => r.qty_total, defaultVisible: true },
    { key: 'qty_remaining', header: 'Remaining', accessor: (r) => r.qty_remaining, defaultVisible: true },
    { key: 'unit_cost', header: 'Unit Cost', accessor: (r) => r.unit_cost || '—', defaultVisible: true },
    { key: 'notes', header: 'Notes', accessor: (r) => r.notes || '-', defaultVisible: false },
    { key: 'created_at', header: 'Created At', accessor: (r) => r.created_at || '-', defaultVisible: false },
    { key: 'updated_at', header: 'Updated At', accessor: (r) => r.updated_at || '-', defaultVisible: false },
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
