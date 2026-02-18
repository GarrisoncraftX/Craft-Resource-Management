'use client';
import React, { useState } from 'react';
import { Trash2, Edit, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AssetDataTable, ColumnDef } from './AssetDataTable';

interface Company {
  id: string;
  name: string;
  email?: string;
  image?: string;
  assets: number;
  licenses: number;
  accessories: number;
  components: number;
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Gleichner, Runolfsson and Howell',
    email: 'info@company1.com',
    image: '🏢',
    assets: 143,
    licenses: 0,
    accessories: 0,
    components: 0,
  },
  {
    id: '2',
    name: 'Bogan-Lesch',
    email: 'info@bogan.com',
    image: '🏢',
    assets: 137,
    licenses: 0,
    accessories: 0,
    components: 0,
  },
];

export const CompaniesView: React.FC = () => {
  const [companies] = useState<Company[]>(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: ColumnDef<Company>[] = [
    {
      key: 'name',
      header: 'Company Name',
      accessor: (row) => <span className="text-blue-600 hover:underline cursor-pointer">{row.name}</span>,
      defaultVisible: true,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (row) => row.email || '—',
      defaultVisible: true,
    },
    {
      key: 'image',
      header: 'Image',
      accessor: (row) => <span className="text-sm">{row.image}</span>,
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
  ];

  const handleDelete = (company: Company) => {
    console.log('Delete company:', company.id);
  };

  const handleEdit = (company: Company) => {
    console.log('Edit company:', company.id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 text-sm p-2">
              <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
              <span className="font-bold text-2xl text-foreground">Companies</span>
            </div>
            <AssetDataTable<Company>
              data={filteredCompanies}
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

        <Card className="p-6 h-fit">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About Companies</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                You can use companies as a simple informative field, or you can use them to restrict asset visibility and availability to users with a specific company by enabling Full Company Support in your Admin Settings.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompaniesView;
