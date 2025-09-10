import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export const BidEvaluation: React.FC = () => {
  const bids = [
    { tenderId: 'TND-001', vendor: 'Office Plus', score: 86, price: 43000, status: 'Recommended' },
    { tenderId: 'TND-001', vendor: 'FurnishCo', score: 82, price: 42000, status: 'Qualified' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bid Evaluation</CardTitle>
          <CardDescription>Compare vendor proposals</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((b, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{b.tenderId}</TableCell>
                  <TableCell>{b.vendor}</TableCell>
                  <TableCell>{b.score}</TableCell>
                  <TableCell>${b.price.toLocaleString()}</TableCell>
                  <TableCell>{b.status}</TableCell>
                  <TableCell>
                    <Button size="sm">Evaluate</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BidEvaluation;
