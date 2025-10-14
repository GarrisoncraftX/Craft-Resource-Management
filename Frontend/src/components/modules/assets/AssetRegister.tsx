import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Eye, Package } from 'lucide-react';

// Use the service that calls the Java controller (/assets)
import { fetchAssets } from '@/services/api';

/* 
  IMPORTANT: Java Asset entity fields:
    - id (Long)
    - assetTag (String)         -> unique tag / ID
    - assetName (String)        -> name/title
    - description (String)      -> description (no 'category' field in entity)
    - acquisitionDate (LocalDate)
    - acquisitionCost (BigDecimal)
    - currentValue (BigDecimal)
    - location (String)
    - status (String)
*/

// Dummy data (kept as fallback)
const assetData = [
  {
    id: 'AST001',
    assetTag: 'AST001',
    assetName: 'Dell Laptop OptiPlex 7090',
    description: 'IT Equipment',
    location: 'IT Department',
    status: 'Active',
    acquisitionDate: '2023-06-15',
    acquisitionCost: 1200,
    currentValue: 1100
  },
  {
    id: 'AST002',
    assetTag: 'AST002',
    assetName: 'Conference Room Table',
    description: 'Furniture',
    location: 'Meeting Room A',
    status: 'Active',
    acquisitionDate: '2022-03-20',
    acquisitionCost: 800,
    currentValue: 650
  },
  {
    id: 'AST003',
    assetTag: 'AST003',
    assetName: 'Industrial Printer HP LaserJet',
    description: 'Office Equipment',
    location: 'Admin Office',
    status: 'Maintenance',
    acquisitionDate: '2023-01-10',
    acquisitionCost: 1500,
    currentValue: 1200
  },
];

export const AssetRegister: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // start with dummies so UI works offline
  const [assets, setAssets] = useState<typeof assetData>(assetData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch from backend (/assets) and replace assets only if valid array returned
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
        console.warn('Failed to fetch assets — using fallback dummies.', err?.message ?? err);
        setError(err?.message ?? 'Failed to fetch assets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Accessor helpers that use the Java entity field names (with small fallbacks)
  const getId = (a: unknown) => (a.assetTag ?? a.tag ?? a.id ?? '');
  const getName = (a: unknown) => (a.assetName ?? a.name ?? a.asset_name ?? '');
  // Entity has no 'category' field -> use description as closest mapping
  const getCategory = (a: unknown) => (a.description ?? a.category ?? 'Uncategorized');
  const getLocation = (a: unknown) => (a.location ?? a.site ?? '');
  // Prefer currentValue if present, otherwise acquisitionCost (both BigDecimal on backend)
  const getValue = (a: unknown) => Number(a.currentValue ?? a.acquisitionCost ?? a.value ?? 0);
  const getAcquisitionDate = (a: unknown) => (a.acquisitionDate ?? a.acquisition_date ?? a.purchaseDate ?? '');

  const filteredAssets = assets.filter((asset) =>
    getName(asset).toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategory(asset).toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocation(asset).toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading assets…</div>;
  // show minimal notice but keep UI usable with fallback data
  if (error) console.info('AssetRegister warning:', error);

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asset Register</h1>
            <p className="text-muted-foreground">Comprehensive database of all organizational assets</p>
          </div>
          <Button className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Add Asset
          </Button>
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
              <div className="text-2xl font-bold">{filteredAssets.length}</div>
              <p className="text-xs text-muted-foreground">+23 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${filteredAssets.reduce((sum, asset) => sum + getValue(asset), 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Asset portfolio value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAssets.filter(asset => asset.status === 'Maintenance').length}</div>
              <p className="text-xs text-muted-foreground">1.4% of total assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Depreciation (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(filteredAssets.reduce((sum, asset) => sum + (getValue(asset) * 0.075), 0)).toLocaleString()}</div>
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
                  <TableRow key={getId(asset) || Math.random()}>
                    <TableCell className="font-mono">{getId(asset)}</TableCell>
                    <TableCell className="font-medium">{getName(asset)}</TableCell>
                    <TableCell>{getCategory(asset)}</TableCell>
                    <TableCell>{getLocation(asset)}</TableCell>
                    <TableCell>${getValue(asset).toLocaleString()}</TableCell>
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
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