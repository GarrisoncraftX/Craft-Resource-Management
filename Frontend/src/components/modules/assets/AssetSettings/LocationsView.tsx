'use client';
import React, { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from '../AssetDataTable';
import type { Location } from '@/types/javabackendapi/assetTypes';
import { mockLocations } from '@/services/mockData/assets';



export const LocationsView: React.FC = () => {
  const [locations] = useState<Location[]>(mockLocations);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<Location>[] = [
    {
      key: 'name',
      header: 'Location Name',
      accessor: (row) => <span className="text-blue-600 hover:underline cursor-pointer">{row.name}</span>,
      defaultVisible: true,
    },
    {
      key: 'image',
      header: 'Image',
      accessor: (row) => <span className="text-xs text-gray-500">{row.image}</span>,
      defaultVisible: true,
    },
    {
      key: 'parent',
      header: 'Parent',
      accessor: (row) => row.parent || '—',
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
    {
      key: 'components',
      header: 'Components',
      accessor: (row) => row.components,
      defaultVisible: true,
    },
    {
      key: 'address',
      header: 'Address',
      accessor: (row) => row.address,
      defaultVisible: true,
    },
    {
      key: 'city',
      header: 'City',
      accessor: (row) => row.city,
      defaultVisible: true,
    },
    {
      key: 'state',
      header: 'State',
      accessor: (row) => row.state,
      defaultVisible: true,
    },
  ];

  const handleDelete = (location: Location) => {
    console.log('Delete location:', location.id);
  };

  const handleEdit = (location: Location) => {
    console.log('Edit location:', location.id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 text-sm p-2">
          <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
          <span className="font-bold text-2xl text-foreground">Locations</span>
        </div>
        <AssetDataTable<Location>
          data={filteredLocations}
          columns={columns}
          viewType="settings"
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

export default LocationsView;
