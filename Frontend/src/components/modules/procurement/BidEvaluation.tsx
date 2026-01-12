import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';
import { mockBids } from '@/services/mockData/procurement';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

export const BidEvaluation: React.FC = () => {
  const [bids, setBids] = useState<typeof mockBids>(mockBids);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      const data = await procurementApiService.getBids() as typeof mockBids;
      setBids(data);
    } catch (error) {
      console.error('Error loading bids:', error);
      setBids(mockBids);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bid Evaluation Chart</CardTitle>
          <CardDescription>Comparative analysis of vendor bids</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bids}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendor" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar yAxisId="left" dataKey="score" fill="#8884d8" name="Score" />
              <Bar yAxisId="right" dataKey="price" fill="#82ca9d" name="Price" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
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
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.tenderId}</TableCell>
                  <TableCell>{b.vendor}</TableCell>
                  <TableCell>{b.score}</TableCell>
                  <TableCell>${b.price.toLocaleString()}</TableCell>
                  <TableCell><Badge>{b.status}</Badge></TableCell>
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
