'use client';
import React, { useState } from 'react';
import { Trash2, Edit, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';

interface Department {
  id: string;
  name: string;
  image?: string;
  manager?: string;
  location?: string;
  assets: number;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Human Resources',
    image: '👥',
    manager: 'East Harley',
    location: 'East Harley',
    assets: 333,
  },
  {
    id: '2',
    name: 'Engineering',
    image: '⚙️',
    manager: 'East Luigtown',
    location: 'East Luigtown',
    assets: 344,
  },
  {
    id: '3',
    name: 'Marketing',
    image: '📊',
    manager: 'East Luigtown',
    location: 'East Luigtown',
    assets: 320,
  },
  {
    id: '4',
    name: 'Client Services',
    image: '💼',
    manager: 'Hodkiewiczfurt',
    location: 'Hodkiewiczfurt',
    assets: 316,
  },
  {
    id: '5',
    name: 'Product Management',
    image: '📦',
    manager: 'Lake Neldamouth',
    location: 'Lake Neldamouth',
    assets: 352,
  },
  {
    id: '6',
    name: 'Dept of Silly Walks',
    image: '🚶',
    manager: 'Jarvisfurt',
    location: 'Jarvisfurt',
    assets: 344,
  },
];

export const DepartmentsView: React.FC = () => {
  const [departments] = useState<Department[]>(mockDepartments);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.manager && d.manager.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: ColumnDef<Department>[] = [
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
      key: 'manager',
      header: 'Manager',
      accessor: (row) => row.manager || '—',
      defaultVisible: true,
    },
    {
      key: 'location',
      header: 'Location',
      accessor: (row) => row.location || '—',
      defaultVisible: true,
    },
    {
      key: 'assets',
      header: 'Assets',
      accessor: (row) => (
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center text-sm">🏠</span>
          {row.assets}
        </span>
      ),
      defaultVisible: true,
    },
  ];

  const handleDelete = (department: Department) => {
    console.log('Delete department:', department.id);
  };

  const handleEdit = (department: Department) => {
    console.log('Edit department:', department.id);
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

         <div className="flex items-center gap-2 text-sm p-2">
          <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
          <span className="font-bold text-2xl text-foreground">Departments</span>
        </div>
        <AssetDataTable<Department>
          data={filteredDepartments}
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

export default DepartmentsView;
