import React, { useEffect, useState } from 'react';
import { Package, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchAssets } from '@/services/api';
import type { Asset } from '@/types/asset';
import { mockAssets } from '@/services/mockData/assets';
import { AssetFormDialog } from './AssetFormDialog';
import { AssetDataTable, ColumnDef, getStatusBadge } from './AssetDataTable';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  count: number;
  filter: (asset: Asset) => boolean;
  color?: string;
}

export const AssetHardware: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    if (filter) setActiveFilter(filter);
  }, []);

  const handleAssetCreated = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchAssets();
        if (!cancelled && Array.isArray(list) && list.length > 0) {
          setAssets(list);
        }
      } catch (err) {
        console.warn('Failed to fetch assets — using fallback dummies.', err instanceof Error ? err.message : err);
        setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filterOptions: FilterOption[] = [
    {
      label: 'List All',
      count: assets.length,
      filter: () => true,
      color: 'text-gray-700'
    },
    {
      label: 'Deployed',
      count: assets.filter(a => a.status === 'Deployed' || a.status === 'In Use').length,
      filter: (a) => a.status === 'Deployed' || a.status === 'In Use',
      color: 'text-sky-600'
    },
    {
      label: 'Ready to Deploy',
      count: assets.filter(a => a.status === 'Ready to Deploy' || a.status === 'Deployable').length,
      filter: (a) => a.status === 'Ready to Deploy' || a.status === 'Deployable',
      color: 'text-emerald-600'
    },
    {
      label: 'Pending',
      count: assets.filter(a => a.status === 'Pending').length,
      filter: (a) => a.status === 'Pending',
      color: 'text-amber-600'
    },
    {
      label: 'Un-deployable',
      count: assets.filter(a => a.status === 'Maintenance').length,
      filter: (a) => a.status === 'Maintenance',
      color: 'text-orange-600'
    },
    {
      label: 'BYOD',
      count: 0,
      filter: () => false,
      color: 'text-purple-600'
    },
    {
      label: 'Archived',
      count: assets.filter(a => a.status === 'Archived' || a.status === 'Disposed').length,
      filter: (a) => a.status === 'Archived' || a.status === 'Disposed',
      color: 'text-red-600'
    },
    {
      label: 'Requestable',
      count: 0,
      filter: () => false,
      color: 'text-blue-600'
    },
    {
      label: 'Due for Audit',
      count: 0,
      filter: () => false,
      color: 'text-indigo-600'
    },
    {
      label: 'Due for Check-in',
      count: 0,
      filter: () => false,
      color: 'text-pink-600'
    }
  ];

  const filteredAssets = activeFilter === 'all' 
    ? assets 
    : assets.filter(filterOptions.find(f => f.label.toLowerCase().replace(/\s+/g, '-') === activeFilter)?.filter || (() => true));

  const columns: ColumnDef<Asset>[] = [
    {
      key: 'assetTag',
      header: 'Asset Tag',
      accessor: (row) => <span className="font-mono text-xs">{row.assetTag || row.id}</span>,
      defaultVisible: true
    },
    {
      key: 'assetName',
      header: 'Asset Name',
      accessor: (row) => <span className="font-medium">{row.assetName}</span>,
      defaultVisible: true
    },
    {
      key: 'deviceImage',
      header: 'Device Image',
      accessor: () => <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center"><Package className="w-4 h-4 text-purple-600" /></div>,
      defaultVisible: true
    },
    {
      key: 'serial',
      header: 'Serial',
      accessor: (row) => <span className="font-mono text-xs">{row.serialNumber || 'N/A'}</span>,
      defaultVisible: true
    },
    {
      key: 'model',
      header: 'Model',
      accessor: (row) => row.description || 'N/A',
      defaultVisible: true
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (row) => row.description || 'Laptops',
      defaultVisible: true
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status || 'Unknown'),
      defaultVisible: true
    },
    {
      key: 'checkedOutTo',
      header: 'Checked Out To',
      accessor: () => '-',
      defaultVisible: true
    },
    {
      key: 'location',
      header: 'Location',
      accessor: (row) => row.location || 'N/A',
      defaultVisible: true
    }
  ];

  if (loading) return <div className="p-6">Loading assets…</div>;

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        {/* Header with Filter Panel */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Assets Hardware</h1>
              <p className="text-sm text-muted-foreground">Manage and track all hardware assets</p>
            </div>
          </div>

          {showAddDialog && (
            <AssetFormDialog 
              onAssetCreated={handleAssetCreated}
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
            />
          )}
        </div>

        {/* Active Filter Badge */}
        {activeFilter !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active Filter:</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium capitalize">
              {activeFilter.replace(/-/g, ' ')}
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Data Table */}
        <AssetDataTable
          data={filteredAssets}
          columns={columns}
          actions={(row) => (
            <>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>View Details</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Edit Asset</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Delete Asset</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        />
      </div>
    </div>
  );
};
