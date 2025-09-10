import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ContractManagement: React.FC = () => {
  const contracts = [
    { id: 'CTR-001', vendor: 'TechCorp Solutions', title: 'IT Equipment Supply', start: '2024-01-01', end: '2024-12-31', value: 125000, status: 'Active' },
    { id: 'CTR-002', vendor: 'Clean Masters', title: 'Cleaning Services', start: '2023-06-01', end: '2024-05-31', value: 32000, status: 'Expiring Soon' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>Manage supplier agreements</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="mb-4">
            <Plus className="h-4 w-4 mr-2" /> New Contract
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell>{c.vendor}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.start}</TableCell>
                  <TableCell>{c.end}</TableCell>
                  <TableCell>${c.value.toLocaleString()}</TableCell>
                  <TableCell>{c.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractManagement;
