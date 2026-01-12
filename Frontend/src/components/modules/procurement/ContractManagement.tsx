import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';
import { mockContracts } from '@/services/mockData/procurement';
import { ContractFormDialog } from './ContractFormDialog';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

export const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<typeof mockContracts>(mockContracts);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const data = await procurementApiService.getContracts() as typeof mockContracts;
      setContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setContracts(mockContracts);
    }
  };

  const contractTrend = [
    { month: 'Jan', value: 125000 },
    { month: 'Feb', value: 145000 },
    { month: 'Mar', value: 132000 },
    { month: 'Apr', value: 158000 },
    { month: 'May', value: 175000 },
    { month: 'Jun', value: 162000 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Value Trend</CardTitle>
          <CardDescription>Monthly contract values over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={contractTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" name="Contract Value" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>Manage supplier agreements</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Contract
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                  <TableCell><Badge variant={c.status === 'active' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ContractFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={loadContracts} />
    </div>
  );
};

export default ContractManagement;
