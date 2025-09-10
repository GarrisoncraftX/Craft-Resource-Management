import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

export const VendorManagement: React.FC = () => {
  const vendors = [
    { name: 'TechCorp Solutions', category: 'IT Equipment', rating: 4.8, contracts: 12, totalValue: 245000, status: 'Active' },
    { name: 'Office Plus', category: 'Office Supplies', rating: 4.5, contracts: 8, totalValue: 89000, status: 'Active' },
    { name: 'Clean Masters', category: 'Services', rating: 4.2, contracts: 3, totalValue: 45000, status: 'Under Review' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>Supplier directory and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="mb-4">
            <Users className="h-4 w-4 mr-2" /> Add Vendor
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Contracts</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((v, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.category}</TableCell>
                  <TableCell>{v.rating}</TableCell>
                  <TableCell>{v.contracts}</TableCell>
                  <TableCell>${v.totalValue.toLocaleString()}</TableCell>
                  <TableCell>{v.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorManagement;
