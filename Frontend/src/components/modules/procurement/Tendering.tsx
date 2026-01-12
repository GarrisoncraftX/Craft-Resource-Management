import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';
import { mockTenders } from '@/services/mockData/procurement';
import { TenderFormDialog } from './TenderFormDialog';

export const Tendering: React.FC = () => {
  const [tenders, setTenders] = useState<typeof mockTenders>(mockTenders);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      const data = await procurementApiService.getTenders() as typeof mockTenders;
      setTenders(data);
    } catch (error) {
      console.error('Error loading tenders:', error);
      setTenders(mockTenders);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Active Tenders</CardTitle>
              <CardDescription>Monitor ongoing solicitations</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tender
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Bidders</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenders.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.id}</TableCell>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>{t.bidders}</TableCell>
                  <TableCell>{t.deadline}</TableCell>
                  <TableCell><Badge>{t.status}</Badge></TableCell>
                  <TableCell>${t.value.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <TenderFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={loadTenders} />
    </div>
  );
};

export default Tendering;
