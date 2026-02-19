import React, { useEffect, useState } from 'react';
import { Package, Edit, Trash2, Copy, FileClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchAssets, deleteAsset } from '@/services/api';
import type {Asset} from '@/types/javabackendapi/assetTypes';
import { mockAssets } from '@/services/mockData/assets';
import { AssetForm } from './AssetForm';
import { AssetDataTable, ColumnDef, getStatusBadge } from './AssetDataTable';
import { toast } from 'sonner';

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
  const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const filter = params.get('filter');
    if (filter) setActiveFilter(filter);
  }, []);

  const handleAssetCreated = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
    toast.success('Asset created successfully');
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      setSelectedRows(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Asset deleted successfully');
    } catch (err) {
      toast.error('Failed to delete asset');
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) {
      toast.error('No assets selected');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} asset(s)?`)) {
      return;
    }

    try {
      await Promise.all(Array.from(selectedRows).map(id => deleteAsset(id)));
      setAssets(prev => prev.filter(a => !selectedRows.has(a.id!)));
      setSelectedRows(new Set());
      toast.success(`${selectedRows.size} asset(s) deleted successfully`);
    } catch (err) {
      toast.error('Failed to delete some assets');
      console.error(err);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedRows.size === 0) {
      toast.error('No assets selected');
      return;
    }

    switch (action) {
      case 'Bulk Delete':
        handleBulkDelete();
        break;
      case 'Bulk Edit':
        toast.info('Bulk edit feature coming soon');
        break;
      case 'Add Maintenance':
        toast.info('Add maintenance feature coming soon');
        break;
      case 'Bulk Checkout':
        toast.info('Bulk checkout feature coming soon');
        break;
      case 'Generate Labels':
        toast.info('Generate labels feature coming soon');
        break;
      default:
        toast.error('Unknown action');
    }
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'add':
        setShowAddDialog(true);
        break;
      case 'delete':
        if (selectedRows.size > 0) {
          handleBulkDelete();
        } else {
          toast.error('No assets selected');
        }
        break;
      case 'refresh':
        globalThis.location.reload();
        break;
      case 'maintenance':
        toast.info('Maintenance feature coming soon');
        break;
      default:
        toast.info(`${action} feature coming soon`);
    }
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

  const getFilteredAssets = () => {
    if (activeFilter === 'all') return assets;
    const filterKey = activeFilter.toLowerCase().replace(/\s+/g, '-');
    const filterOption = filterOptions.find(f => f.label.toLowerCase().replace(/\s+/g, '-') === filterKey);
    return filterOption ? assets.filter(filterOption.filter) : assets;
  };

  const filteredAssets = getFilteredAssets();

  const toggleRowSelection = (id: number | string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllRows = () => {
    if (selectedRows.size === filteredAssets.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAssets.map(a => a.id!)));
    }
  };

  const columns: ColumnDef<Asset>[] = [
    {
      key: 'checkbox',
      header: '',
      accessor: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.has(row.id!)}
          onChange={() => toggleRowSelection(row.id!)}
          className="w-4 h-4 rounded border-gray-300"
        />
      ),
      defaultVisible: true
    },
    { key: 'id', header: 'ID', accessor: (row) => row.id, defaultVisible: false },
    { key: 'assetTag', header: 'Asset Tag', accessor: (row) => <span className="font-mono text-xs">{row.assetTag || row.id}</span>, defaultVisible: true },
    { key: 'assetName', header: 'Asset Name', accessor: (row) => <span className="font-medium">{row.assetName}</span>, defaultVisible: true },
    { key: 'company', header: 'Company', accessor: () => '-', defaultVisible: false },
    { key: 'deviceImage', header: 'Device Image', accessor: () => <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center"><Package className="w-4 h-4 text-purple-600" /></div>, defaultVisible: true },
    { key: 'serial', header: 'Serial', accessor: (row) => <span className="font-mono text-xs">{row.serialNumber || 'N/A'}</span>, defaultVisible: true },
    { key: 'model', header: 'Model', accessor: (row) => row.description || 'N/A', defaultVisible: true },
    { key: 'modelNo', header: 'Model No.', accessor: () => '-', defaultVisible: false },
    { key: 'category', header: 'Category', accessor: (row) => row.description || 'Laptops', defaultVisible: true },
    { key: 'status', header: 'Status', accessor: (row) => getStatusBadge(row.status || 'Unknown'), defaultVisible: true },
    { key: 'checkedOutTo', header: 'Checked Out To', accessor: () => '-', defaultVisible: true },
    { key: 'employeeNumber', header: 'Employee Number', accessor: () => '-', defaultVisible: false },
    { key: 'title', header: 'Title', accessor: () => '-', defaultVisible: false },
    { key: 'location', header: 'Location', accessor: (row) => row.location || 'N/A', defaultVisible: true },
    { key: 'defaultLocation', header: 'Default Location', accessor: () => '-', defaultVisible: false },
    { key: 'manufacturer', header: 'Manufacturer', accessor: () => '-', defaultVisible: false },
    { key: 'supplier', header: 'Supplier', accessor: () => '-', defaultVisible: false },
    { key: 'purchaseDate', header: 'Purchase Date', accessor: () => '-', defaultVisible: false },
    { key: 'age', header: 'Age', accessor: () => '-', defaultVisible: false },
    { key: 'purchaseCost', header: 'Purchase Cost', accessor: () => '-', defaultVisible: false },
    { key: 'currentValue', header: 'Current Value', accessor: () => '-', defaultVisible: false },
    { key: 'orderNumber', header: 'Order Number', accessor: () => '-', defaultVisible: false },
    { key: 'eolRate', header: 'EOL Rate', accessor: () => '-', defaultVisible: false },
    { key: 'eolDate', header: 'EOL Date', accessor: () => '-', defaultVisible: false },
    { key: 'warranty', header: 'Warranty', accessor: () => '-', defaultVisible: false },
    { key: 'warrantyExpires', header: 'Warranty Expires', accessor: () => '-', defaultVisible: false },
    { key: 'requestable', header: 'Requestable', accessor: () => '-', defaultVisible: false },
    { key: 'notes', header: 'Notes', accessor: () => '-', defaultVisible: false },
    { key: 'checkouts', header: 'Checkouts', accessor: () => '-', defaultVisible: false },
    { key: 'checkins', header: 'Checkins', accessor: () => '-', defaultVisible: false },
    { key: 'requests', header: 'Requests', accessor: () => '-', defaultVisible: false },
    { key: 'createdBy', header: 'Created By', accessor: () => '-', defaultVisible: false },
    { key: 'createdAt', header: 'Created At', accessor: () => '-', defaultVisible: false },
    { key: 'updatedAt', header: 'Updated At', accessor: () => '-', defaultVisible: false },
    { key: 'checkoutDate', header: 'Checkout Date', accessor: () => '-', defaultVisible: false },
    { key: 'lastCheckinDate', header: 'Last Checkin Date', accessor: () => '-', defaultVisible: false },
    { key: 'expectedCheckinDate', header: 'Expected Checkin Date', accessor: () => '-', defaultVisible: false },
    { key: 'lastAudit', header: 'Last Audit', accessor: () => '-', defaultVisible: false },
    { key: 'nextAuditDate', header: 'Next Audit Date', accessor: () => '-', defaultVisible: false },
    { key: 'byod', header: 'BYOD', accessor: () => '-', defaultVisible: false },
    { key: 'testRadio', header: 'Test Radio', accessor: () => '-', defaultVisible: false },
    { key: 'testCheckbox', header: 'Test Checkbox', accessor: () => '-', defaultVisible: false },
    { key: 'testEncrypted', header: 'Test Encrypted', accessor: () => '-', defaultVisible: false },
    { key: 'phoneNumber', header: 'Phone Number', accessor: () => '-', defaultVisible: false },
    { key: 'imei', header: 'IMEI', accessor: () => '-', defaultVisible: false },
    { key: 'macAddress', header: 'MAC Address', accessor: () => '-', defaultVisible: false },
    { key: 'cpu', header: 'CPU', accessor: () => '-', defaultVisible: false },
    { key: 'ram', header: 'RAM', accessor: () => '-', defaultVisible: false },
    {
      key: 'checkInOut',
      header: 'Check In/Out',
      accessor: (row) => (
        <Button size="sm" variant="outline" className="h-7 bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 rounded">
          {row.status === 'Deployed' ? 'Check In' : 'Check Out'}
        </Button>
      ),
      defaultVisible: true,
      sticky: 'right'
    },
  ];

  if (loading) return <div className="p-6">Loading assets…</div>;

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        {/* Header with Filter Panel */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
           <div>
              <h1 className="text-3xl lg:text-2xl sm:text-sm font-bold tracking-tight">Assets</h1>
            </div>
          </div>

          {showAddDialog && (
            <AssetForm 
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
          showCheckboxHeader
          checkboxHeaderContent={
            <input
              type="checkbox"
              checked={selectedRows.size === filteredAssets.length && filteredAssets.length > 0}
              onChange={toggleAllRows}
              className="w-4 h-4 rounded border-gray-300"
            />
          }
          onBulkGo={handleBulkAction}
          onAction={handleToolbarAction}
          selectedCount={selectedRows.size}
          actions={(row) => (
            <>
            <TooltipProvider delayDuration={200}>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                     <Copy className="h-4 w-4" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent><p>Clone Asset</p></TooltipContent>
               </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                     <FileClock className="h-4 w-4" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent><p>Audit Asset</p></TooltipContent>
               </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Update Asset</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this asset?')) {
                          handleDelete(row.id!);
                        }
                      }}
                    >
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
