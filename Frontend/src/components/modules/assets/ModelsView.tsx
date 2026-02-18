'use client';
import React, { useState } from 'react';
import { Trash2, Edit, Settings, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';

interface AssetModel {
  id: string;
  name: string;
  image?: string;
  modelNo: string;
  minQty: number;
  assets: number;
  assigned: number;
  remaining: number;
  archived: number;
  category: string;
  eolRate?: string;
  fieldset?: string;
}

const mockModels: AssetModel[] = [
  {
    id: '1',
    name: 'Macbook Air',
    image: '💻',
    modelNo: '5575783075815347',
    minQty: 0,
    assets: 50,
    assigned: 8,
    remaining: 42,
    archived: 0,
    category: 'Laptops',
    eolRate: '36 months',
    fieldset: 'Mobile Devices',
  },
  {
    id: '2',
    name: 'Ultrasharp U2415',
    image: '🖥️',
    modelNo: '2395597366246282',
    minQty: 0,
    assets: 20,
    assigned: 7,
    remaining: 13,
    archived: 0,
    category: 'Displays',
    eolRate: '12 months',
    fieldset: 'Mobile Devices',
  },
  {
    id: '3',
    name: 'iPhone 12',
    image: '📱',
    modelNo: '4708395437118939',
    minQty: 0,
    assets: 40,
    assigned: 3,
    remaining: 37,
    archived: 0,
    category: 'Mobile Phone',
    eolRate: '12 months',
    fieldset: 'Laptops and Desktops',
  },
];

export const ModelsView: React.FC = () => {
  const [models] = useState<AssetModel[]>(mockModels);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.modelNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<AssetModel>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (row) => <span className="text-blue-600 hover:underline cursor-pointer">{row.name}</span>,
      defaultVisible: true,
    },
    {
      key: 'image',
      header: 'Image',
      accessor: (row) => <span className="text-sm">{row.image}</span>,
      defaultVisible: true,
    },
    {
      key: 'modelNo',
      header: 'Model No.',
      accessor: (row) => row.modelNo.substring(0, 20) + '...',
      defaultVisible: true,
    },
    {
      key: 'minQty',
      header: 'Min QTY',
      accessor: (row) => row.minQty,
      defaultVisible: true,
    },
    {
      key: 'assets',
      header: 'Assets',
      accessor: (row) => row.assets,
      defaultVisible: true,
    },
    {
      key: 'assigned',
      header: 'Assigned',
      accessor: (row) => row.assigned,
      defaultVisible: true,
    },
    {
      key: 'remaining',
      header: 'Remaining',
      accessor: (row) => row.remaining,
      defaultVisible: true,
    },
    {
      key: 'archived',
      header: 'Archived',
      accessor: (row) => row.archived,
      defaultVisible: true,
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (row) => (
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {row.category}
        </span>
      ),
      defaultVisible: true,
    },
    {
      key: 'eolRate',
      header: 'EOL Rate',
      accessor: (row) => row.eolRate || '—',
      defaultVisible: true,
    },
    {
      key: 'fieldset',
      header: 'Fieldset',
      accessor: (row) => row.fieldset || '—',
      defaultVisible: true,
    },
  ];

  const handleDelete = (model: AssetModel) => {
    console.log('Delete model:', model.id);
  };

  const handleEdit = (model: AssetModel) => {
    console.log('Edit model:', model.id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
         <div className="flex items-center gap-2 text-sm p-2">
          <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
          <span className="font-bold text-2xl text-foreground">Models</span>
        </div>
        <AssetDataTable<AssetModel>
          data={filteredModels}
          columns={columns}
          actions={(row) => (
            <div className="flex gap-2 items-center justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                <Copy className="w-4 h-4 text-blue-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-orange-100"
                onClick={() => handleEdit(row)}
              >
                <Edit className="w-4 h-4 text-orange-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-red-100"
                onClick={() => handleDelete(row)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ModelsView;
