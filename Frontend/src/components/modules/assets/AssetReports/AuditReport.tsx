import React, { useEffect, useState } from 'react';
import { assetApiService } from '@/services/javabackendapi/assetApi';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { AssetDataTable, ColumnDef } from '../AssetDataTable';
import type { AssetAudit, Asset } from '@/types/javabackendapi/assetTypes';
import type { User } from '@/types/javabackendapi/hrTypes';
import { mockAssetAudits } from '@/services/mockData/assets';

export const AuditReport: React.FC = () => {
  const [audits, setAudits] = useState<AssetAudit[]>(mockAssetAudits);
  const [loading, setLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState<Record<number, Asset>>({});
  const [userDetails, setUserDetails] = useState<Record<number, User>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await assetApiService.getAllAssetAudits();
        if (Array.isArray(data) && data.length > 0) {
          setAudits(data as unknown as AssetAudit[]);
          
          // Fetch asset details for images
          const assetIds = [...new Set(data.map((a: AssetAudit) => a.assetId).filter(Boolean))];
          const assetDetailsMap: Record<number, Asset> = {};
          
          await Promise.all(
            assetIds.map(async (assetId: number) => {
              try {
                const asset = await assetApiService.getAssetById(assetId);
                if (asset) assetDetailsMap[assetId] = asset;
              } catch {
                // Asset fetch failed, continue without image
              }
            })
          );
          setAssetDetails(assetDetailsMap);
          
          // Fetch user details
          const userIds = [...new Set(data.map((a: AssetAudit) => a.auditedBy).filter(Boolean))] as number[];
          const userDetailsMap: Record<number, User> = {};
          
          await Promise.all(
            userIds.map(async (userId: number) => {
              try {
                const user = await hrApiService.getEmployeeById(userId);
                if (user) userDetailsMap[userId] = user;
              } catch {
                // User fetch failed, continue without name
              }
            })
          );
          setUserDetails(userDetailsMap);
        }
      } catch (error) {
        console.warn('Failed to load audit logs, using fallback data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calculateDaysToNextAudit = (nextAuditDate: string | null) => {
    if (!nextAuditDate) return '-';
    const days = Math.ceil((new Date(nextAuditDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const columns: ColumnDef<AssetAudit>[] = [
    { 
      key: 'deviceImage', 
      header: 'Device Image', 
      accessor: (row) => {
        const asset = assetDetails[row.assetId];
        const imageUrl = asset?.imageUrl || asset?.image || row.images;
        
        if (imageUrl) {
          return (
            <img 
              src={imageUrl} 
              alt="Asset" 
              className="w-8 h-8 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          );
        }
        
        return (
          <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-xs text-purple-600">
            {row.assetName?.charAt(0) || 'A'}
          </div>
        );
      }, 
      defaultVisible: true 
    },
    { 
      key: 'createdBy', 
      header: 'Created By', 
      accessor: (row) => {
        if (row.auditedBy && userDetails[row.auditedBy]) {
          const user = userDetails[row.auditedBy];
          return `${user.firstName} ${user.lastName}`.trim() || user.username || 'System';
        }
        return row.auditedBy ? `User ${row.auditedBy}` : 'System';
      }, 
      defaultVisible: true 
    },
    { key: 'item', header: 'Item', accessor: (row) => row.assetName || row.assetTag || `Asset #${row.assetId}`, defaultVisible: true },
    { key: 'location', header: 'Location', accessor: (row) => row.locationName || '-', defaultVisible: true },
    { key: 'lastAudit', header: 'Last Audit', accessor: (row) => row.auditDate ? new Date(row.auditDate).toLocaleDateString() : '-', defaultVisible: true },
    { key: 'nextAuditDate', header: 'Next Audit Date', accessor: (row) => row.nextAuditDate ? new Date(row.nextAuditDate).toLocaleDateString() : '-', defaultVisible: true },
    { key: 'daysToNextAudit', header: 'Days to Next Audit', accessor: (row) => calculateDaysToNextAudit(row.nextAuditDate), defaultVisible: true },
    { key: 'notes', header: 'Notes', accessor: (row) => row.notes || '-', defaultVisible: true },
  ];

  if (loading) return <div className="p-6">Loading audit logs…</div>;

  return (
    <div className="min-h-screen flex-1 flex flex-col p-2 sm:p-4 md:p-6 bg-background">
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">Audit Report</h1>
        <AssetDataTable
          data={audits}
          columns={columns}
        />
      </div>
    </div>
  );
};
