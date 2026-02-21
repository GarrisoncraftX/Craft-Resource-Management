import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Copy, FileClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { assetApiService } from '@/services/javabackendapi/assetApi';
import type { Asset } from '@/types/javabackendapi/assetTypes';
import { mockAssets } from '@/services/mockData/assets';
import { AssetForm } from './AssetForm';
import { AssetDataTable, ColumnDef, getStatusBadge } from './AssetDataTable';
import { AdvancedSearchDialog } from './forms/AdvancedSearchDialog';
import { MaintenanceFormDialog } from './forms/MaintenanceFormDialog';
import { BulkEditDialog } from './forms/BulkEditDialog';
import { BulkDeleteDialog } from './forms/BulkDeleteDialog';
import { CloneAssetDialog } from './forms/CloneAssetDialog';
import { AuditAssetDialog } from './forms/AuditAssetDialog';
import { BulkCheckoutDialog } from './forms/BulkCheckoutDialog';
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

  // Dialog states
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showBulkCheckout, setShowBulkCheckout] = useState(false);
  const [cloneAsset, setCloneAsset] = useState<Asset | null>(null);
  const [auditAsset, setAuditAsset] = useState<Asset | null>(null);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [maintenancePreselected, setMaintenancePreselected] = useState<(number | string)[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const filter = params.get('filter');
    if (filter) setActiveFilter(filter);
  }, []);

  const handleAssetCreated = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
  };

  const handleAssetUpdated = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  };

  const handleDelete = async (id: number | string) => {
    try {
      await assetApiService.deleteAsset(Number(id));
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

  const getSelectedAssets = () => assets.filter(a => selectedRows.has(a.id));

  const handleBulkAction = (action: string) => {
    if (selectedRows.size === 0) {
      toast.error('No assets selected');
      return;
    }
    switch (action) {
      case 'Bulk Delete':
        setShowBulkDelete(true);
        break;
      case 'Bulk Edit':
        setShowBulkEdit(true);
        break;
      case 'Add Maintenance':
        setMaintenancePreselected(Array.from(selectedRows));
        setShowMaintenance(true);
        break;
      case 'Bulk Checkout':
        setShowBulkCheckout(true);
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
          setShowBulkDelete(true);
        } else {
          toast.error('No assets selected');
        }
        break;
      case 'refresh':
        (async () => {
          try {
            const list = await assetApiService.getAllAssets();
            if (Array.isArray(list) && list.length > 0) {
              setAssets(list);
              toast.success('Assets refreshed successfully');
            }
          } catch (err) {
            toast.error('Failed to refresh assets');
          }
        })();
        break;
      case 'maintenance':
        setMaintenancePreselected([]);
        setShowMaintenance(true);
        break;
      case 'search':
        setShowAdvancedSearch(true);
        break;
      default:
        toast.info(`${action} feature coming soon`);
    }
  };

  const handleBulkDeleteConfirm = async (ids: (number | string)[]) => {
    try {
      await Promise.all(ids.map(id => assetApiService.deleteAsset(Number(id))));
      setAssets(prev => prev.filter(a => !ids.includes(a.id)));
      setSelectedRows(new Set());
      toast.success(`${ids.length} asset(s) deleted successfully`);
    } catch (err) {
      toast.error('Failed to delete some assets');
      console.error(err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await assetApiService.getAllAssets();
        if (!cancelled && Array.isArray(list) && list.length > 0) {
          console.log('API Response:', list[0]);
          setAssets(list);
        }
      } catch (err) {
        console.warn('Failed to fetch assets — using fallback data.', err instanceof Error ? err.message : err);
        setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filterOptions: FilterOption[] = [
    { label: 'List All', count: assets.length, filter: () => true, color: 'text-gray-700' },
    { label: 'Deployed', count: assets.filter(a => a.status === 'Deployed' || a.status_id === 2).length, filter: (a) => a.status === 'Deployed' || a.status_id === 2, color: 'text-sky-600' },
    { label: 'Ready to Deploy', count: assets.filter(a => a.status === 'Ready to Deploy' || (a.status_id === 1 && !a.assigned_to)).length, filter: (a) => a.status === 'Ready to Deploy' || (a.status_id === 1 && !a.assigned_to), color: 'text-emerald-600' },
    { label: 'Pending', count: assets.filter(a => a.status === 'Pending').length, filter: (a) => a.status === 'Pending', color: 'text-amber-600' },
    { label: 'Un-deployable', count: assets.filter(a => a.statusLabel?.statusType === 'undeployable').length, filter: (a) => a.statusLabel?.statusType === 'undeployable', color: 'text-orange-600' },
    { label: 'BYOD', count: assets.filter(a => a.byod === true || a.byod === 1).length, filter: (a) => a.byod === true || a.byod === 1, color: 'text-purple-600' },
    { label: 'Archived', count: assets.filter(a => a.status === 'Archived').length, filter: (a) => a.status === 'Archived', color: 'text-red-600' },
    { label: 'Requestable', count: assets.filter(a => a.requestable === true || a.requestable === 1).length, filter: (a) => a.requestable === true || a.requestable === 1, color: 'text-blue-600' },
    { label: 'Due for Audit', count: assets.filter(a => a.next_audit_date && new Date(a.next_audit_date) <= new Date()).length, filter: (a) => a.next_audit_date && new Date(a.next_audit_date) <= new Date(), color: 'text-indigo-600' },
    { label: 'Due for Check-in', count: assets.filter(a => a.expected_checkin && new Date(a.expected_checkin) <= new Date()).length, filter: (a) => a.expected_checkin && new Date(a.expected_checkin) <= new Date(), color: 'text-pink-600' }
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
      key: 'checkbox', header: '', defaultVisible: true,
      accessor: (row) => (
        <input type="checkbox" checked={selectedRows.has(row.id!)} onChange={() => toggleRowSelection(row.id!)} className="w-4 h-4 rounded border-gray-300" />
      ),
    },
    { key: 'id', header: 'ID', accessor: (row) => row.id, defaultVisible: false },
    { key: 'assetTag', header: 'Asset Tag', accessor: (row) => <span className="font-mono text-xs">{row.assetTag || row.asset_tag || row.id}</span>, defaultVisible: true },
    { key: 'assetName', header: 'Asset Name', accessor: (row) => <span className="font-medium">{row.assetName || row.asset_name || row.name || 'N/A'}</span>, defaultVisible: true },
    { key: 'company', header: 'Company', accessor: (row) => row.company || '-', defaultVisible: false },
    { key: 'deviceImage', header: 'Device Image', accessor: (row) => row.image ? <img src={row.image} alt={row.assetName || 'Asset'} className="w-8 h-8 rounded object-cover" /> : <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-xs text-purple-600">N/A</div>, defaultVisible: true },
    { key: 'serial', header: 'Serial', accessor: (row) => <span className="font-mono text-xs">{row.serial || 'N/A'}</span>, defaultVisible: true },
    { key: 'model', header: 'Model', accessor: (row) => row.model || 'N/A', defaultVisible: true },
    { key: 'modelNo', header: 'Model No.', accessor: (row) => row.modelNo || row.model_no || '-', defaultVisible: false },
    { key: 'category', header: 'Category', accessor: (row) => row.category || row.description || 'N/A', defaultVisible: true },
    { key: 'status', header: 'Status', accessor: (row) => getStatusBadge(row.status || 'Unknown'), defaultVisible: true },
    { key: 'checkedOutTo', header: 'Checked Out To', accessor: () => '-', defaultVisible: true },
    { key: 'location', header: 'Location', accessor: (row) => row.location || 'N/A', defaultVisible: false },
    { key: 'defaultLocation', header: 'Default Location', accessor: (row) => row.defaultLocation || row.rtd_location || '-', defaultVisible: true },
    { key: 'manufacturer', header: 'Manufacturer', accessor: (row) => row.manufacturer || '-', defaultVisible: false },
    { key: 'supplier', header: 'Supplier', accessor: (row) => row.supplier || '-', defaultVisible: false },
    { key: 'purchaseDate', header: 'Purchase Date', accessor: (row) => row.purchaseDate || row.purchase_date || '-', defaultVisible: false },
    { key: 'purchaseCost', header: 'Purchase Cost', accessor: (row) => {
      const cost = row.purchaseCost || row.purchase_cost;
      return cost ? `$${Number(cost).toFixed(2)}` : '-';
    }, defaultVisible: false },
    { key: 'currentValue', header: 'Current Value', accessor: (row) => {
      const value = row.currentValue || row.current_value;
      return value ? `$${Number(value).toFixed(2)}` : '-';
    }, defaultVisible: false },
    { key: 'orderNumber', header: 'Order Number', accessor: (row) => row.orderNumber || row.order_number || '-', defaultVisible: false },
    { key: 'warranty', header: 'Warranty', accessor: (row) => {
      const months = row.warrantyMonths || row.warranty_months;
      return months ? `${months} months` : '-';
    }, defaultVisible: false },
    { key: 'notes', header: 'Notes', accessor: (row) => row.notes || '-', defaultVisible: false },
    {
      key: 'checkInOut', header: 'Check In/Out', defaultVisible: true, sticky: 'right',
      accessor: (row) => (
        <Button size="sm" variant="outline" className="h-7 bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 rounded">
          {row.status === 'Deployed' ? 'Check In' : 'Check Out'}
        </Button>
      ),
    },
  ];

  if (loading) return <div className="p-6">Loading assets…</div>;

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h1 className="text-3xl lg:text-2xl sm:text-sm font-bold tracking-tight">Assets</h1>
        </div>

        {/* Active Filter Badge */}
        {activeFilter !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active Filter:</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium capitalize">
              {activeFilter.replace(/-/g, ' ')}
            </span>
            <button onClick={() => setActiveFilter('all')} className="text-sm text-blue-600 hover:underline">Clear Filter</button>
          </div>
        )}

        {/* Data Table */}
        <AssetDataTable
          data={filteredAssets}
          columns={columns}
          showCheckboxHeader
          checkboxHeaderContent={
            <input type="checkbox" checked={selectedRows.size === filteredAssets.length && filteredAssets.length > 0} onChange={toggleAllRows} className="w-4 h-4 rounded border-gray-300" />
          }
          onBulkGo={handleBulkAction}
          onAction={handleToolbarAction}
          selectedCount={selectedRows.size}
          actions={(row) => (
            <>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50" onClick={() => setCloneAsset(row)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Clone Asset</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50" onClick={() => setAuditAsset(row)}>
                      <FileClock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Audit Asset</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => { setEditAsset(row); setShowAddDialog(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Edit Asset</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => { if (confirm('Are you sure you want to delete this asset?')) handleDelete(row.id!); }}>
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

      {/* Dialogs */}
      {showAddDialog && (
        <AssetForm
          onAssetCreated={editAsset ? handleAssetUpdated : handleAssetCreated}
          open={showAddDialog}
          onOpenChange={(v) => { setShowAddDialog(v); if (!v) setEditAsset(null); }}
          initialData={editAsset || undefined}
          title={editAsset ? 'Edit Asset' : 'Create New Asset'}
        />
      )}

      <AdvancedSearchDialog open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch} />

      <MaintenanceFormDialog
        open={showMaintenance}
        onOpenChange={setShowMaintenance}
        preSelectedAssetIds={maintenancePreselected}
      />

      {showBulkEdit && (
        <BulkEditDialog
          open={showBulkEdit}
          onOpenChange={setShowBulkEdit}
          selectedCount={selectedRows.size}
        />
      )}

      {showBulkDelete && (
        <BulkDeleteDialog
          open={showBulkDelete}
          onOpenChange={setShowBulkDelete}
          assets={getSelectedAssets()}
          onConfirmDelete={handleBulkDeleteConfirm}
        />
      )}

      {showBulkCheckout && (
        <BulkCheckoutDialog
          open={showBulkCheckout}
          onOpenChange={setShowBulkCheckout}
          assets={getSelectedAssets()}
        />
      )}

      {cloneAsset && (
        <CloneAssetDialog
          open={!!cloneAsset}
          onOpenChange={(v) => { if (!v) setCloneAsset(null); }}
          asset={cloneAsset}
          onClone={(data) => {
            setAssets(prev => [{ ...data, id: Date.now() }, ...prev]);
          }}
        />
      )}

      {auditAsset && (
        <AuditAssetDialog
          open={!!auditAsset}
          onOpenChange={(v) => { if (!v) setAuditAsset(null); }}
          asset={auditAsset}
        />
      )}
    </div>
  );
};
