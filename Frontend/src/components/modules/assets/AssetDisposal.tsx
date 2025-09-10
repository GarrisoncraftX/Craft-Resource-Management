import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const AssetDisposal: React.FC = () => {
  const disposals = [
    { id: 'DP-001', asset: 'Old Printer', method: 'Auction', date: '2024-01-28', status: 'Pending Approval', proceeds: 0 },
    { id: 'DP-002', asset: 'Damaged Chair', method: 'Scrap', date: '2024-01-18', status: 'Completed', proceeds: 10 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Initiate Disposal</CardTitle>
          <CardDescription>Request end-of-life asset disposal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="asset">Asset</Label>
              <Input id="asset" placeholder="e.g., Old Printer" />
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Input id="method" placeholder="e.g., Auction / Scrap" />
            </div>
            <div>
              <Label htmlFor="date">Proposed Date</Label>
              <Input id="date" type="date" />
            </div>
          </div>
          <Button className="mt-4">Submit Disposal</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disposal Records</CardTitle>
          <CardDescription>Track status and proceeds</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proceeds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disposals.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>{d.asset}</TableCell>
                  <TableCell>{d.method}</TableCell>
                  <TableCell>{d.date}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  <TableCell>${d.proceeds.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetDisposal;
