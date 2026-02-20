import React, { useEffect, useState } from 'react';
import { AssetDataTable, ColumnDef, getStatusBadge } from '../AssetDataTable';
import type { DepreciationReport } from '@/types/javabackendapi/assetTypes';
import { mockDepreciationReports } from '@/services/mockData/assets';
import { assetApiService } from '@/services/javabackendapi/assetApi';

const columns: ColumnDef<DepreciationReport>[] = [
  { key: 'company', header: 'Company', accessor: (r) => r.company },
  { key: 'category', header: 'Category', accessor: (r) => r.category },
  { key: 'assetTag', header: 'Asset Tag', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.assetTag}</span> },
  { key: 'model', header: 'Model', accessor: (r) => r.model },
  { key: 'modelNo', header: 'Model No.', accessor: (r) => r.modelNo },
  { key: 'serial', header: 'Serial', accessor: (r) => r.serial },
  { key: 'depreciation', header: 'Depreciation', accessor: (r) => r.depreciation },
  { key: 'numberOfMonths', header: 'Number of Months', accessor: (r) => r.numberOfMonths },
  { key: 'status', header: 'Status', accessor: (r) => getStatusBadge(r.status) },
  { key: 'checkedOut', header: 'Checked Out', accessor: (r) => r.checkedOut },
  { key: 'location', header: 'Location', accessor: (r) => r.location },
  { key: 'manufacturer', header: 'Manufacturer', accessor: (r) => r.manufacturer },
  { key: 'supplier', header: 'Supplier', accessor: (r) => r.supplier },
  { key: 'purchaseDate', header: 'Purchase Date', accessor: (r) => r.purchaseDate },
  { key: 'currency', header: 'Currency', accessor: (r) => r.currency },
  { key: 'purchaseCost', header: 'Purchase Cost', accessor: (r) => `$${r.purchaseCost.toFixed(2)}` },
  { key: 'orderNumber', header: 'Order Number', accessor: (r) => r.orderNumber },
  { key: 'eol', header: 'EOL', accessor: (r) => r.eol },
  { key: 'currentValue', header: 'Current Value', accessor: (r) => `$${r.currentValue.toFixed(2)}` },
  { key: 'monthlyDepreciation', header: 'Monthly Depreciation', accessor: (r) => `$${r.monthlyDepreciation.toFixed(2)}` },
  { key: 'diff', header: 'Diff', accessor: (r) => `$${r.diff.toFixed(2)}` },
  { key: 'warrantyExpires', header: 'Warranty Expires', accessor: (r) => r.warrantyExpires },
];

export const DepreciationReportView: React.FC = () => {
  const [data, setData] = useState<DepreciationReport[]>(mockDepreciationReports);

  useEffect(() => {
    assetApiService.getDepreciationReport().then(setData).catch(() => setData(mockDepreciationReports));
  }, []);

  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Depreciation Report</span>
      </div>

      <AssetDataTable
        data={data}
        columns={columns}
        onAdd={() => {}}
      />
    </div>
  );
};
