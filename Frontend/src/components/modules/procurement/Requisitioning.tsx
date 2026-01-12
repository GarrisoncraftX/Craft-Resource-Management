import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';
import { mockRequisitions } from '@/services/mockData/procurement';
import { RequisitionFormDialog } from './RequisitionFormDialog';

export const Requisitioning: React.FC = () => {
  const [requisitions, setRequisitions] = useState<typeof mockRequisitions>(mockRequisitions);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      const data = await procurementApiService.getProcurementRequests() as typeof mockRequisitions;
      setRequisitions(data);
    } catch (error) {
      console.error('Error loading requisitions:', error);
      setRequisitions(mockRequisitions);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Requisitions</CardTitle>
              <CardDescription>Track procurement requests and approval status</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Requisition
            </Button>
          </div>
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
                  <TableCell><Badge>{r.status}</Badge></TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <RequisitionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={loadRequisitions} />
    </div>
  );
};

export default Requisitioning;
