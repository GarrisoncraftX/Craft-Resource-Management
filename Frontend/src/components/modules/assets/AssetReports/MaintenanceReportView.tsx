import React, { useEffect, useState } from 'react';
import { AssetDataTable, ColumnDef } from '../AssetDataTable';
import type { MaintenanceReportData } from '@/types/javabackendapi/assetTypes';
import { assetApiService } from '@/services/javabackendapi/assetApi';

const columns: ColumnDef<MaintenanceReportData>[] = [
  { key: 'id', header: 'ID', accessor: (r) => r.id },
  { key: 'companyName', header: 'Company', accessor: (r) => r.companyName || '-' },
  { key: 'assetTag', header: 'Asset Tag', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.assetTag}</span> },
  { key: 'assetName', header: 'Asset Name', accessor: (r) => r.assetName },
  { key: 'supplierName', header: 'Supplier', accessor: (r) => r.supplierName || '-' },
  { key: 'maintenanceType', header: 'Type', accessor: (r) => r.maintenanceType },
  { key: 'title', header: 'Title', accessor: (r) => r.title },
  { key: 'startDate', header: 'Start Date', accessor: (r) => r.startDate },
  { key: 'completionDate', header: 'Completion Date', accessor: (r) => r.completionDate || '-' },
  { key: 'assetMaintenanceTime', header: 'Time (days)', accessor: (r) => r.assetMaintenanceTime || '-' },
  { key: 'cost', header: 'Cost', accessor: (r) => r.cost ? `$${Number(r.cost).toFixed(2)}` : '-' },
  { key: 'locationName', header: 'Location', accessor: (r) => r.locationName || '-' },
  { key: 'defaultLocationName', header: 'Default Location', accessor: (r) => r.defaultLocationName || '-' },
  { key: 'warrantyExpiry', header: 'Warranty Expiry', accessor: (r) => r.warrantyExpiry || '-' },
  { key: 'createdByName', header: 'Created By', accessor: (r) => r.createdByName || '-' },
  { key: 'notes', header: 'Notes', accessor: (r) => r.notes || '-' },
];

export const MaintenanceReportView: React.FC = () => {
  const [data, setData] = useState<MaintenanceReportData[]>([]);

  const loadData = () => {
    assetApiService.getAllMaintenances().then(setData).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Maintenance Report</span>
      </div>

      <AssetDataTable
        data={data}
        columns={columns}
        viewType="settings"
        onRefresh={loadData}
      />
    </div>
  );
};
