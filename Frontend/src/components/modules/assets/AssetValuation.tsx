import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const AssetValuation: React.FC = () => {
  const valuations = [
    { id: 'AST-001', name: 'Dell Laptop', category: 'IT Equipment', acquired: '2022-03-10', cost: 1200, currentValue: 800, method: 'Straight-line' },
    { id: 'AST-002', name: 'Office Chair', category: 'Furniture', acquired: '2021-06-02', cost: 300, currentValue: 180, method: 'Straight-line' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Valuation</CardTitle>
          <CardDescription>Book value vs. current value</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Acquired</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {valuations.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.id}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell>{a.acquired}</TableCell>
                  <TableCell>${a.cost.toLocaleString()}</TableCell>
                  <TableCell>${a.currentValue.toLocaleString()}</TableCell>
                  <TableCell>{a.method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetValuation;
