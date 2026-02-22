// src/components/modules/assets/AssetHardware.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
import { CheckoutDialog } from './forms/CheckoutDialog';
import { toast } from 'sonner';

interface FilterOption {
  label: string;
  count: number;
  filter: (asset: Asset) => boolean;
  color?: string;
}

const normalizeStatus = (s?: string | null) => (s || '').trim().toLowerCase();
const isAssetCheckedOut = (a: Asset) => {
  const s = normalizeStatus(a.status);
  return (
    s === 'deployed' ||
    s === 'in use' ||
    s === 'checked out' ||
    a.status_id === 2 ||
    !!(a.assigned_to ?? a.assignedTo ?? a.assigned_type === 'user')
  );
};

export const AssetHardware: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});

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
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedAssetForCheckout, setSelectedAssetForCheckout] = useState<Asset | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const filter = params.get('filter');
    if (filter) setActiveFilter(filter);
  }, []);

  const handleAssetCreated = (newAsset: Asset) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleAssetUpdated = (updatedAsset: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
  };

  const handleDelete = async (id: number | string) => {
    try {
      await assetApiService.deleteAsset(Number(id));
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSelectedRows((prev) => {
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

  const getSelectedAssets = () => assets.filter((a) => selectedRows.has(a.id));

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
        if (selectedRows.size > 0) setShowBulkDelete(true);
        else toast.error('No assets selected');
        break;
      case 'refresh':
        (async () => {
          try {
            const list = await assetApiService.getAllAssets();
            if (Array.isArray(list) && list.length > 0) {
              setAssets(list);
              toast.success('Assets refreshed successfully');
            }
          } catch {
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
      await Promise.all(ids.map((id) => assetApiService.deleteAsset(Number(id))));
      setAssets((prev) => prev.filter((a) => !ids.includes(a.id)));
      setSelectedRows(new Set());
      setShowBulkDelete(false);
      toast.success(`${ids.length} asset(s) deleted successfully`);
    } catch (err) {
      toast.error('Failed to delete some assets');
      console.error(err);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBulkEditSubmit = async (data: Record<string, unknown>) => {
    const selectedAssets = getSelectedAssets();
    const deleteFlags = data.deleteFlags as Record<string, boolean> | undefined;
    setIsSubmitting(true);
    try {
      const updates = await Promise.all(
        selectedAssets.map((asset) => {
          const updatePayload: Partial<Asset> = {};
          if (data.assetName && !deleteFlags?.assetName) updatePayload.assetName = data.assetName as string;
          if (data.purchaseDate && !deleteFlags?.purchaseDate) updatePayload.purchaseDate = data.purchaseDate as string;
          if (data.expectedCheckinDate && !deleteFlags?.expectedCheckinDate) updatePayload.expected_checkin = data.expectedCheckinDate as string;
          if (data.eolDate && !deleteFlags?.eolDate) updatePayload.eol_date = data.eolDate as string;
          if (data.status) updatePayload.status_id = Number(data.status);
          if (data.model) updatePayload.model_id = Number(data.model);
          if (data.defaultLocation) {
            if (data.locationUpdateType === 'both' || data.locationUpdateType === 'default-only') {
              updatePayload.rtd_location_id = Number(data.defaultLocation);
            }
            if (data.locationUpdateType === 'both' || data.locationUpdateType === 'actual-only') {
              updatePayload.location_id = Number(data.defaultLocation);
            }
          }
          if (data.purchaseCost) updatePayload.purchase_cost = Number(data.purchaseCost);
          if (data.supplier) updatePayload.supplier_id = Number(data.supplier);
          if (data.company) updatePayload.company_id = Number(data.company);
          if (data.orderNumber) updatePayload.order_number = data.orderNumber as string;
          if (data.warranty) updatePayload.warranty_months = Number(data.warranty);
          if (data.nextAuditDate && !deleteFlags?.nextAuditDate) updatePayload.next_audit_date = data.nextAuditDate as string;
          if (data.requestable === 'yes') updatePayload.requestable = true;
          else if (data.requestable === 'no') updatePayload.requestable = false;
          if (data.notes && !deleteFlags?.notes) updatePayload.notes = data.notes as string;
          
          if (deleteFlags?.assetName) updatePayload.assetName = '';
          if (deleteFlags?.purchaseDate) updatePayload.purchaseDate = '';
          if (deleteFlags?.expectedCheckinDate) updatePayload.expected_checkin = '';
          if (deleteFlags?.eolDate) updatePayload.eol_date = '';
          if (deleteFlags?.nextAuditDate) updatePayload.next_audit_date = '';
          if (deleteFlags?.notes) updatePayload.notes = '';

          return assetApiService.updateAsset(Number(asset.id), updatePayload);
        })
      );
      setAssets((prev) =>
        prev.map((a) => {
          const updated = updates.find((u) => u.id === a.id);
          return updated || a;
        })
      );
      setSelectedRows(new Set());
      setShowBulkEdit(false);
      toast.success(`${selectedAssets.length} asset(s) updated successfully`);
    } catch (err) {
      toast.error('Failed to update some assets');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaintenanceSubmit = (result: unknown) => {
    setMaintenancePreselected([]);
    setShowMaintenance(false);
    toast.success('Maintenance record created successfully');
  };

  const handleBulkCheckoutSubmit = async (data: { updatedAssets: Asset[] }) => {
    setAssets((prev) =>
      prev.map((a) => {
        const updated = data.updatedAssets.find((u) => u.id === a.id);
        return updated || a;
      })
    );
    setSelectedRows(new Set());
    setShowBulkCheckout(false);
    toast.success(`${data.updatedAssets.length} asset(s) checked out successfully`);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await assetApiService.getAllAssets();
        if (!cancelled && Array.isArray(list) && list.length > 0) setAssets(list);
      } catch (err) {
        console.warn('Failed to fetch assets — using fallback data.', err instanceof Error ? err.message : err);
        setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { label: 'List All', count: assets.length, filter: () => true, color: 'text-gray-700' },
      {
        label: 'Deployed',
        count: assets.filter((a) => a.status === 'Deployed' || a.status_id === 2).length,
        filter: (a) => a.status === 'Deployed' || a.status_id === 2,
        color: 'text-sky-600',
      },
      {
        label: 'Ready to Deploy',
        count: assets.filter((a) => a.status === 'Ready to Deploy' || (a.status_id === 1 && !(a.assigned_to ))).length,
        filter: (a) => a.status === 'Ready to Deploy' || (a.status_id === 1 && !(a.assigned_to ?? a.assignedToId)),
        color: 'text-emerald-600',
      },
      { label: 'Pending', count: assets.filter((a) => a.status === 'Pending').length, filter: (a) => a.status === 'Pending', color: 'text-amber-600' },
      {
        label: 'Un-deployable',
        count: assets.filter((a) => a.statusLabel?.statusType === 'undeployable').length,
        filter: (a) => a.statusLabel?.statusType === 'undeployable',
        color: 'text-orange-600',
      },
      { label: 'BYOD', count: assets.filter((a) => a.byod === true || a.byod === 1).length, filter: (a) => a.byod === true || a.byod === 1, color: 'text-purple-600' },
      { label: 'Archived', count: assets.filter((a) => a.status === 'Archived').length, filter: (a) => a.status === 'Archived', color: 'text-red-600' },
      {
        label: 'Requestable',
        count: assets.filter((a) => a.requestable === true || a.requestable === 1).length,
        filter: (a) => a.requestable === true || a.requestable === 1,
        color: 'text-blue-600',
      },
      {
        label: 'Due for Audit',
        count: assets.filter((a) => a.next_audit_date && new Date(a.next_audit_date) <= new Date()).length,
        filter: (a) => a.next_audit_date && new Date(a.next_audit_date) <= new Date(),
        color: 'text-indigo-600',
      },
      {
        label: 'Due for Check-in',
        count: assets.filter((a) => a.expected_checkin && new Date(a.expected_checkin) <= new Date()).length,
        filter: (a) => a.expected_checkin && new Date(a.expected_checkin) <= new Date(),
        color: 'text-pink-600',
      },
    ],
    [assets]
  );

  const getFilteredAssets = () => {
    let filtered = assets;
    
    // Apply category filter
    if (activeFilter !== 'all') {
      const filterKey = activeFilter.toLowerCase().replace(/\s+/g, '-');
      const filterOption = filterOptions.find((f) => f.label.toLowerCase().replace(/\s+/g, '-') === filterKey);
      if (filterOption) {
        filtered = filtered.filter(filterOption.filter);
      }
    }
    
    // Apply advanced search filters
    if (Object.keys(searchFilters).length > 0) {
      filtered = filtered.filter(asset => {
        return Object.entries(searchFilters).every(([key, value]) => {
          if (!value) return true;
          const searchValue = value.toLowerCase();
          
          switch(key) {
            case 'assetTag':
              return (asset.assetTag || asset.asset_tag || '')?.toString().toLowerCase().includes(searchValue);
            case 'assetName':
              return (asset.assetName || asset.asset_name || asset.name || '')?.toLowerCase().includes(searchValue);
            case 'serial':
              return (asset.serial || '')?.toLowerCase().includes(searchValue);
            case 'model':
              return (asset.model || '')?.toLowerCase().includes(searchValue);
            case 'category':
              return (asset.category || '')?.toLowerCase().includes(searchValue);
            case 'status':
              return (asset.status || '')?.toLowerCase().includes(searchValue);
            case 'checkedOutTo':
              return (asset.assigned_to || asset.assignedTo || '')?.toString().toLowerCase().includes(searchValue);
            case 'location':
              return (asset.location || asset.defaultLocation || asset.rtd_location || '')?.toLowerCase().includes(searchValue);
            case 'purchaseCost':
              return (asset.purchaseCost || asset.purchase_cost || '')?.toString().includes(searchValue);
            default:
              return true;
          }
        });
      });
    }
    
    return filtered;
  };

  const filteredAssets = getFilteredAssets();

  const toggleRowSelection = (id: number | string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllRows = () => {
    if (selectedRows.size === filteredAssets.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(filteredAssets.map((a) => a.id!)));
  };

  const columns: ColumnDef<Asset>[] = useMemo(
    () => [
      {
        key: 'checkbox',
        header: '',
        defaultVisible: true,
        accessor: (row) => (
          <input
            type="checkbox"
            checked={selectedRows.has(row.id!)}
            onChange={() => toggleRowSelection(row.id!)}
            className="w-4 h-4 rounded border-gray-300"
          />
        ),
      },
      { key: 'id', header: 'ID', accessor: (row) => row.id, defaultVisible: false },
      { key: 'assetTag', header: 'Asset Tag', accessor: (row) => <span className="font-mono text-xs">{row.assetTag || row.asset_tag || row.id}</span>, defaultVisible: true },
      { key: 'assetName', header: 'Asset Name', accessor: (row) => <span className="font-medium">{row.assetName || row.asset_name || row.name || 'N/A'}</span>, defaultVisible: true },
      { key: 'company', header: 'Company', accessor: (row) => (row.company as unknown as string) || '-', defaultVisible: false },
      {
        key: 'deviceImage',
        header: 'Device Image',
        accessor: (row) =>
          row.image ? (
            <img src={row.image} alt={row.assetName || 'Asset'} className="w-8 h-8 rounded object-cover" />
          ) : (
            <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-xs text-purple-600">N/A</div>
          ),
        defaultVisible: true,
      },
      { key: 'serial', header: 'Serial', accessor: (row) => <span className="font-mono text-xs">{row.serial || 'N/A'}</span>, defaultVisible: true },
      { key: 'model', header: 'Model', accessor: (row) => row.model || 'N/A', defaultVisible: true },
      { key: 'modelNo', header: 'Model No.', accessor: (row) => (row.modelNo as unknown as string) || row.model_no || '-', defaultVisible: false },
      { key: 'category', header: 'Category', accessor: (row) => row.category || (row.description as unknown as string) || 'N/A', defaultVisible: true },
      { key: 'status', header: 'Status', accessor: (row) => getStatusBadge(row.status || 'Unknown'), defaultVisible: true },
      { 
        key: 'checkedOutTo', 
        header: 'Checked Out To', 
        accessor: (row) => {
          if (row.assigned_to || row.assignedTo) {
            return row.assigned_to_name || row.assignedToName || `ID: ${row.assigned_to || row.assignedTo}`;
          }
          return '-';
        }, 
        defaultVisible: true 
      },
      { key: 'location', header: 'Location', accessor: (row) => row.location || 'N/A', defaultVisible: false },
      { key: 'defaultLocation', header: 'Default Location', accessor: (row) => row.defaultLocation || row.rtd_location || '-', defaultVisible: true },
      { key: 'manufacturer', header: 'Manufacturer', accessor: (row) => row.manufacturer || '-', defaultVisible: false },
      { key: 'supplier', header: 'Supplier', accessor: (row) => row.supplier || '-', defaultVisible: false },
      { key: 'purchaseDate', header: 'Purchase Date', accessor: (row) => row.purchaseDate || row.purchase_date || '-', defaultVisible: false },
      {
        key: 'purchaseCost',
        header: 'Purchase Cost',
        accessor: (row) => {
          const cost = row.purchaseCost || row.purchase_cost;
          return cost ? `$${Number(cost).toFixed(2)}` : '-';
        },
        defaultVisible: false,
      },
      {
        key: 'currentValue',
        header: 'Current Value',
        accessor: (row) => {
          const value = row.currentValue || row.current_value;
          return value ? `$${Number(value).toFixed(2)}` : '-';
        },
        defaultVisible: false,
      },
      { key: 'orderNumber', header: 'Order Number', accessor: (row) => row.orderNumber || row.order_number || '-', defaultVisible: false },
      {
        key: 'warranty',
        header: 'Warranty',
        accessor: (row) => {
          const months = row.warrantyMonths || row.warranty_months;
          return months ? `${months} months` : '-';
        },
        defaultVisible: false,
      },
      { key: 'notes', header: 'Notes', accessor: (row) => row.notes || '-', defaultVisible: false },
      {
        key: 'checkInOut',
        header: 'Check In/Out',
        defaultVisible: true,
        sticky: 'right',
        accessor: (row) => {
          const checkedOut = isAssetCheckedOut(row);
          return (
            <Button
              size="sm"
              variant="outline"
              className={`h-7 text-white text-xs px-3 rounded ${
                checkedOut ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
              }`}
              onClick={() => {
                setSelectedAssetForCheckout(row);
                setShowCheckoutDialog(true);
              }}
            >
              {checkedOut ? 'Check In' : 'Check Out'}
            </Button>
          );
        },
      },
    ],
    [selectedRows]
  );

  if (loading) return <div className="p-6">Loading assets…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen flex-1 flex flex-col p-2 sm:p-4 md:p-6 bg-background">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-start">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">Assets</h1>
        </div>

        {activeFilter !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active Filter:</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium capitalize">
              {activeFilter.replace(/-/g, ' ')}
            </span>
            <button onClick={() => setActiveFilter('all')} className="text-sm text-blue-600 hover:underline">
              Clear Filter
            </button>
          </div>
        )}

        {Object.keys(searchFilters).length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search Filters:</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(searchFilters).map(([key, value]) => (
                <span key={key} className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                  {key}: {value}
                </span>
              ))}
            </div>
            <button onClick={() => setSearchFilters({})} className="text-sm text-blue-600 hover:underline">
              Clear Search
            </button>
          </div>
        )}

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
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50" onClick={() => setCloneAsset(row)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clone Asset</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sky-600 hover:text-sky-700 hover:bg-sky-50" onClick={() => setAuditAsset(row)}>
                      <FileClock className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Audit Asset</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      onClick={() => {
                        setEditAsset(row);
                        setShowAddDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Asset</p>
                  </TooltipContent>
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
                        if (confirm('Are you sure you want to delete this asset?')) handleDelete(row.id!);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Asset</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        />
      </div>

      {showAddDialog && (
        <AssetForm
          onAssetCreated={editAsset ? handleAssetUpdated : handleAssetCreated}
          open={showAddDialog}
          onOpenChange={(v) => {
            setShowAddDialog(v);
            if (!v) setEditAsset(null);
          }}
          initialData={editAsset || undefined}
          title={editAsset ? 'Edit Asset' : 'Create New Asset'}
        />
      )}

      {showCheckoutDialog && selectedAssetForCheckout && (
        <CheckoutDialog
          open={showCheckoutDialog}
          onOpenChange={(open) => {
            setShowCheckoutDialog(open);
            if (!open) setSelectedAssetForCheckout(null);
          }}
          asset={selectedAssetForCheckout}
          onSuccess={(updatedAsset) => {
            handleAssetUpdated(updatedAsset);
            toast.success(isAssetCheckedOut(updatedAsset) ? 'Asset checked out successfully' : 'Asset checked in successfully');
          }}
        />
      )}

      <AdvancedSearchDialog 
        open={showAdvancedSearch} 
        onOpenChange={setShowAdvancedSearch}
        onSearch={(filters) => {
          setSearchFilters(filters);
          toast.success(`Applied ${Object.keys(filters).length} search filter(s)`);
        }}
      />

      <MaintenanceFormDialog 
        open={showMaintenance} 
        onOpenChange={setShowMaintenance} 
        preSelectedAssetIds={maintenancePreselected}
        onSubmit={handleMaintenanceSubmit}
      />

      {showBulkEdit && (
        <BulkEditDialog
          open={showBulkEdit}
          onOpenChange={setShowBulkEdit}
          selectedCount={selectedRows.size}
          assets={getSelectedAssets()}
          onSubmit={handleBulkEditSubmit}
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
          onCheckout={handleBulkCheckoutSubmit}
        />
      )}

      {cloneAsset && (
        <CloneAssetDialog
          open={!!cloneAsset}
          onOpenChange={(v) => {
            if (!v) setCloneAsset(null);
          }}
          asset={cloneAsset}
          onClone={(data) => {
            setAssets((prev) => [{ ...(data as Asset), id: Date.now() }, ...prev]);
          }}
        />
      )}

      {auditAsset && (
        <AuditAssetDialog
          open={!!auditAsset}
          onOpenChange={(v) => {
            if (!v) setAuditAsset(null);
          }}
          asset={auditAsset}
        />
      )}
    </div>
  );
};