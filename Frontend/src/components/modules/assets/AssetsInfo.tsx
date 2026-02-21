'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assetApiService } from '@/services/api/assetApiService';
import type { Asset } from '@/types/asset';
import { Loader2 } from 'lucide-react';

export const AssetsInfo: React.FC = () => {
  const { assetTag } = useParams<{ assetTag: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAsset = async () => {
      if (!assetTag) {
        setLoading(false);
        return;
      }

      try {
        const data = await assetApiService.getAssetByTag(assetTag);
        setAsset(data);
      } catch (error) {
        console.error('[v0] Failed to load asset:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [assetTag]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6 text-center text-gray-500">
        No asset found
      </div>
    );
  }

  const infoFields = [
    { label: 'Asset Tag', value: asset.assetTag },
    { label: 'Status', value: asset.status },
    { label: 'Serial', value: asset.serialNumber },
    { label: 'Category', value: asset.category },
    { label: 'Model', value: asset.name },
    { label: 'Model No', value: asset.modelNumber },
    { label: 'BYOD', value: asset.byod ? 'Yes' : 'No' },
    { label: 'Requestable', value: asset.requestable ? 'Yes' : 'No' },
    { label: 'Purchase Date', value: asset.purchaseDate },
    { label: 'Purchase Cost', value: asset.purchasePrice ? `$${asset.purchasePrice}` : '-' },
    { label: 'Current Value', value: asset.currentValue ? `$${asset.currentValue}` : '-' },
    { label: 'Order Number', value: asset.orderNumber },
    { label: 'Supplier', value: asset.company },
    { label: 'Depreciation', value: 'Computer Depreciation (36 months)' },
    { label: 'Fully Depreciated', value: '2028-09-06' },
    { label: 'EOL Rate', value: '36 months' },
    { label: 'EOL Date', value: asset.eolDate },
    { label: 'Notes', value: asset.notes },
    { label: 'Location', value: asset.location },
    { label: 'Default Location', value: asset.defaultLocation },
    { label: 'Created At', value: asset.createdAt },
    { label: 'Updated At', value: asset.updatedAt },
    { label: 'Checkouts', value: '1' },
    { label: 'Checkins', value: '0' },
    { label: 'Requests', value: '0' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Asset Info</h2>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          {infoFields.map((field, idx) => (
            <div key={idx}>
              <p className="text-sm text-gray-500">{field.label}</p>
              <p className="text-sm font-medium text-gray-900">{field.value || '-'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
