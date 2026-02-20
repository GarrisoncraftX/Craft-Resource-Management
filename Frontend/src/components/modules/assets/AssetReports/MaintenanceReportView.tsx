import React, { useEffect, useState } from 'react';
import { AssetDataTable, ColumnDef } from '../AssetDataTable';
import type { MaintenanceReport } from '@/types/javabackendapi/assetTypes';
import { mockMaintenanceReports } from '@/services/mockData/assets';
import { assetApiService } from '@/services/javabackendapi/assetApi';

const columns: ColumnDef<MaintenanceReport>[] = [
  { key: 'company', header: 'Company', accessor: (r) => r.company },
  { key: 'id', header: 'ID', accessor: (r) => r.id },
  { key: 'assetTag', header: 'Asset Tag', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.assetTag}</span> },
  { key: 'assetName', header: 'Asset Name', accessor: (r) => r.assetName },
  { key: 'supplier', header: 'Supplier', accessor: (r) => r.supplier },
  { key: 'assetMaintenanceType', header: 'Asset Maintenance Type', accessor: (r) => r.assetMaintenanceType },
  { key: 'title', header: 'Title', accessor: (r) => r.title },
  { key: 'startDate', header: 'Start Date', accessor: (r) => r.startDate },
  { key: 'completionDate', header: 'Completion Date', accessor: (r) => r.completionDate },
  { key: 'assetMaintenanceTime', header: 'Asset Maintenance Time (in days)', accessor: (r) => r.assetMaintenanceTime },
  { key: 'cost', header: 'Cost', accessor: (r) => `$${r.cost.toFixed(2)}` },
  { key: 'location', header: 'Location', accessor: (r) => r.location },
  { key: 'defaultLocation', header: 'Default Location', accessor: (r) => r.defaultLocation },
  { key: 'warranty', header: 'Warranty', accessor: (r) => r.warranty },
  { key: 'createdBy', header: 'Created By', accessor: (r) => r.createdBy },
  { key: 'notes', header: 'Notes', accessor: (r) => r.notes },
];

export const MaintenanceReportView: React.FC = () => {
  const [data, setData] = useState<MaintenanceReport[]>(mockMaintenanceReports);

  useEffect(() => {
    assetApiService.getMaintenanceReport().then(setData).catch(() => setData(mockMaintenanceReports));
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
        onAdd={() => {}}
      />
    </div>
  );
};
