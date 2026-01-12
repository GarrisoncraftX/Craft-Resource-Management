import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';
import { mockVendors } from '@/services/mockData/procurement';
import { VendorFormDialog } from './VendorFormDialog';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

export const VendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<typeof mockVendors>(mockVendors);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await procurementApiService.getVendors() as typeof mockVendors;
      setVendors(data);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendors(mockVendors);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance</CardTitle>
          <CardDescription>Top vendors by contract value</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendors.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="totalValue" fill="#8884d8" name="Total Value" />
              <Bar dataKey="contracts" fill="#82ca9d" name="Contracts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vendors</CardTitle>
              <CardDescription>Supplier directory and performance</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" /> Add Vendor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
              {vendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.category}</TableCell>
                  <TableCell>{v.rating}</TableCell>
                  <TableCell>{v.contracts}</TableCell>
                  <TableCell>${v.totalValue.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={v.status === 'active' ? 'default' : 'secondary'}>{v.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <VendorFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={loadVendors} />
    </div>
  );
};

export default VendorManagement;
