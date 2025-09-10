import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Eye, Package } from 'lucide-react';

const assetData = [
  {
    id: 'AST001',
    name: 'Dell Laptop OptiPlex 7090',
    category: 'IT Equipment',
    location: 'IT Department',
    status: 'Active',
    purchaseDate: '2023-06-15',
    value: 1200,
    condition: 'Good'
  },
  {
    id: 'AST002', 
    name: 'Conference Room Table',
    category: 'Furniture',
    location: 'Meeting Room A',
    status: 'Active',
    purchaseDate: '2022-03-20',
    value: 800,
    condition: 'Excellent'
  },
  {
    id: 'AST003',
    name: 'Industrial Printer HP LaserJet',
    category: 'Office Equipment',
    location: 'Admin Office',
    status: 'Maintenance',
    purchaseDate: '2023-01-10',
    value: 1500,
    condition: 'Fair'
  },
];

export const AssetRegister: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = assetData.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Asset Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+23 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.4M</div>
              <p className="text-xs text-muted-foreground">Asset portfolio value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">1.4% of total assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Depreciation (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$180K</div>
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
                  <TableHead>Asset ID</TableHead>
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
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono">{asset.id}</TableCell>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell>${asset.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        asset.status === 'Active' ? 'default' : 
                        asset.status === 'Maintenance' ? 'secondary' : 'outline'
                      }>
                        {asset.status}
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