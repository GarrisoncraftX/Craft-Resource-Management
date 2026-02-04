import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Edit, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { fetchAssets } from '@/services/api';
import type { Asset } from '@/types/asset';
import { mockAssets } from '@/services/mockData/assets';
import { AssetFormDialog } from './AssetFormDialog';

export const AssetRegister: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('Fetched assets:', list);
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

  const filteredAssets = assets.filter((asset) =>
    asset.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading assets…</div>;
  if (error) console.info('AssetRegister warning:', error);

  const stats = {
    total: filteredAssets.length,
    totalValue: filteredAssets.reduce((sum, a) => sum + (a.currentValue || a.acquisitionCost || 0), 0),
    maintenance: filteredAssets.filter(a => a.status === 'Maintenance').length,
    depreciation: filteredAssets.reduce((sum, a) => sum + ((a.currentValue || a.acquisitionCost || 0) * 0.075), 0),
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asset Register</h1>
            <p className="text-muted-foreground">Comprehensive database of all organizational assets</p>
          </div>
          <AssetFormDialog onAssetCreated={handleAssetCreated} />
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Assets</CardTitle>
            <CardDescription>Find assets by name, category, or location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Asset Statistics (use computed stats) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">+23 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Asset portfolio value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maintenance}</div>
              <p className="text-xs text-muted-foreground">1.4% of total assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Depreciation (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.depreciation.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">7.5% depreciation rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Asset List */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Inventory</CardTitle>
            <CardDescription>Complete list of all registered assets</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.assetTag || asset.id}>
                    <TableCell className="font-mono">{asset.assetTag || asset.id}</TableCell>
                    <TableCell className="font-medium">{asset.assetName}</TableCell>
                    <TableCell>{asset.description}</TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell>${(asset.currentValue || asset.acquisitionCost || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        (asset.status ?? '').toLowerCase() === 'active' ? 'default' :
                        (asset.status ?? '').toLowerCase() === 'maintenance' ? 'secondary' : 'outline'
                      }>
                        {asset.status ?? 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Asset</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};