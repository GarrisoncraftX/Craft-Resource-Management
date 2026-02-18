'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssetDataTable, ColumnDef } from './AssetDataTable';

interface RequestableItem {
  id: string;
  image?: string;
  assetTag: string;
  model: string;
  modelNo: string;
  assetName: string;
  serial: string;
  location: string;
  status: string;
  expectedCheckinDate?: string;
  cpu?: string;
}

const mockRequestableItems: RequestableItem[] = [
  {
    id: '1',
    image: '📱',
    assetTag: '888255196',
    model: 'iPhone 12',
    modelNo: '4708395437118939',
    assetName: 'iPhone-mobile-7046-80cd-c1fe1b84d816',
    serial: 'a0c7f7f84-2d84-8d67-6ecb9c3fbd16',
    location: 'New Nils',
    status: 'deployable',
    expectedCheckinDate: 'Jan 12, 2025',
    cpu: '6GB RAM',
  },
  {
    id: '2',
    image: '📱',
    assetTag: '1654990322',
    model: 'iPhone 11',
    modelNo: '5466429538486827',
    assetName: 'iPhone-mobile-d5efd89b-34ca-8ec3-4888809901c74',
    serial: 'cfe93abdf-0777-34ca-8ec3-4888809015c74',
    location: 'North Derickfort',
    status: 'deployable',
    expectedCheckinDate: 'Mar 5, 2025',
    cpu: '4GB RAM',
  },
  {
    id: '3',
    image: '📱',
    assetTag: '1011481556',
    model: 'iPhone 12',
    modelNo: '4708395437118939',
    assetName: 'iPhone-mobile-dbc819dd-1498-360c-b27c-171be0236689',
    serial: 'dbc819dd-1498-360c-b27c-1b6b26d0236689',
    location: 'Alycefurt',
    status: 'deployable',
    expectedCheckinDate: 'Feb 20, 2025',
    cpu: '6GB RAM',
  },
];

export const RequestableItemsView: React.FC = () => {
  const [items] = useState<RequestableItem[]>(mockRequestableItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredItems = items.filter(i =>
    i.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<RequestableItem>[] = [
    {
      key: 'image',
      header: 'Image',
      accessor: (row) => <span className="text-lg">{row.image}</span>,
      defaultVisible: true,
    },
    {
      key: 'assetTag',
      header: 'Asset Tag',
      accessor: (row) => row.assetTag,
      defaultVisible: true,
    },
    {
      key: 'model',
      header: 'Model',
      accessor: (row) => row.model,
      defaultVisible: true,
    },
    {
      key: 'modelNo',
      header: 'Model No.',
      accessor: (row) => row.modelNo,
      defaultVisible: true,
    },
    {
      key: 'assetName',
      header: 'Asset Name',
      accessor: (row) => <span className="text-blue-600">{row.assetName}</span>,
      defaultVisible: true,
    },
    {
      key: 'serial',
      header: 'Serial',
      accessor: (row) => row.serial.substring(0, 20) + '...',
      defaultVisible: true,
    },
    {
      key: 'location',
      header: 'Location',
      accessor: (row) => row.location,
      defaultVisible: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => (
        <Badge className="bg-emerald-500 text-white">
          {row.status}
        </Badge>
      ),
      defaultVisible: true,
    },
    {
      key: 'expectedCheckinDate',
      header: 'Expected Checkin Date',
      accessor: (row) => row.expectedCheckinDate || '—',
      defaultVisible: true,
    },
    {
      key: 'cpu',
      header: 'CPU',
      accessor: (row) => row.cpu || '—',
      defaultVisible: true,
    },
  ];

  const handleRequest = (item: RequestableItem) => {
    console.log('Request item:', item.id);
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Assets <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium ml-2">
              1256
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, paginatedItems.length)} of {filteredItems.length} rows</p>
        </div>

        <div className="overflow-hidden">
          <AssetDataTable<RequestableItem>
            data={paginatedItems}
            columns={columns}
            actions={(row) => (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleRequest(row)}
              >
                Request
              </Button>
            )}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestableItemsView;
