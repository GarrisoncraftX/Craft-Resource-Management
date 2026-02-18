'use client';
import React, { useState } from 'react';
import { Trash2, Edit, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';

interface Manufacturer {
  id: string;
  name: string;
  image?: string;
  url?: string;
  supportUrl?: string;
  supportPhone?: string;
  supportEmail?: string;
  assets: number;
  licenses: number;
  accessories: number;
}

const mockManufacturers: Manufacturer[] = [
  {
    id: '1',
    name: 'Apple',
    image: '🍎',
    url: 'https://apple.com',
    supportUrl: 'https://support.apple.com',
    supportPhone: '248-422-9948',
    supportEmail: 'wcremin@example.org',
    assets: 177,
    licenses: 0,
    accessories: 0,
  },
  {
    id: '2',
    name: 'Microsoft',
    image: '◻️',
    url: 'https://microsoft.com',
    supportUrl: 'https://support.microsoft.com',
    supportPhone: '435-917-2052',
    supportEmail: 'gardner.wissoky@example.org',
    assets: 50,
    licenses: 1,
    accessories: 0,
  },
];

export const ManufacturersView: React.FC = () => {
  const [manufacturers] = useState<Manufacturer[]>(mockManufacturers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredManufacturers = manufacturers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<Manufacturer>[] = [
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
      key: 'url',
      header: 'Website',
      accessor: (row) => (
        row.url ? (
          <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
            Link <ExternalLink className="w-3 h-3" />
          </a>
        ) : '—'
      ),
      defaultVisible: true,
    },
    {
      key: 'supportUrl',
      header: 'Support URL',
      accessor: (row) => (
        row.supportUrl ? (
          <a href={row.supportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
            Link <ExternalLink className="w-3 h-3" />
          </a>
        ) : '—'
      ),
      defaultVisible: true,
    },
    {
      key: 'supportPhone',
      header: 'Support Phone',
      accessor: (row) => row.supportPhone || '—',
      defaultVisible: true,
    },
    {
      key: 'supportEmail',
      header: 'Support Email',
      accessor: (row) => row.supportEmail || '—',
      defaultVisible: true,
    },
    {
      key: 'assets',
      header: 'Assets',
      accessor: (row) => row.assets,
      defaultVisible: true,
    },
    {
      key: 'licenses',
      header: 'Licenses',
      accessor: (row) => row.licenses,
      defaultVisible: true,
    },
    {
      key: 'accessories',
      header: 'Accessories',
      accessor: (row) => row.accessories,
      defaultVisible: true,
    },
  ];

  const handleDelete = (manufacturer: Manufacturer) => {
    console.log('Delete manufacturer:', manufacturer.id);
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    console.log('Edit manufacturer:', manufacturer.id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 text-sm p-2">
          <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
          <span className="font-bold text-2xl text-foreground">Manufacturers</span>
        </div>
        <AssetDataTable<Manufacturer>
          data={filteredManufacturers}
          columns={columns}
          actions={(row) => (
            <div className="flex gap-2 items-center justify-end">
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

export default ManufacturersView;
