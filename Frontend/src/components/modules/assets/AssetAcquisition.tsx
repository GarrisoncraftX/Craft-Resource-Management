import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { fetchAcquisitionRequests, submitAcquisitionRequest } from '@/services/api';

export const AssetAcquisition: React.FC = () => {
  const requests = [
    { id: 'AQ-001', item: 'Laptops (10)', department: 'IT', amount: 15000, status: 'Pending', requestedBy: 'John Tech', date: '2024-01-20' },
    { id: 'AQ-002', item: 'Office Chairs (25)', department: 'HR', amount: 3750, status: 'Approved', requestedBy: 'Jane HR', date: '2024-01-22' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Asset Acquisition</CardTitle>
          <CardDescription>Submit a request to purchase new assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="item">Item</Label>
              <Input id="item" placeholder="e.g., Laptops (10)" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g., IT" />
            </div>
            <div>
              <Label htmlFor="amount">Estimated Amount</Label>
              <Input id="amount" type="number" placeholder="0.00" />
            </div>
          </div>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acquisition Requests</CardTitle>
          <CardDescription>Track acquisition requests and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.item}</TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell>${r.amount.toLocaleString()}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.requestedBy}</TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetAcquisition;
