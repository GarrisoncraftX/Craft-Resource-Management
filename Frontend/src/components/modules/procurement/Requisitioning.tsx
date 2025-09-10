import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export const Requisitioning: React.FC = () => {
  const requisitions = [
    { id: 'REQ-001', department: 'IT', item: 'Laptops (10)', amount: 15000, status: 'Approved', date: '2024-01-20' },
    { id: 'REQ-002', department: 'HR', item: 'Training Materials', amount: 2500, status: 'Pending', date: '2024-01-22' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Requisition</CardTitle>
          <CardDescription>Create a purchase requisition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g., IT" />
            </div>
            <div>
              <Label htmlFor="item">Item</Label>
              <Input id="item" placeholder="e.g., Laptops (10)" />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="0.00" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requisitions</CardTitle>
          <CardDescription>Track approval status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell>{r.item}</TableCell>
                  <TableCell>${r.amount.toLocaleString()}</TableCell>
                  <TableCell>{r.status}</TableCell>
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

export default Requisitioning;
