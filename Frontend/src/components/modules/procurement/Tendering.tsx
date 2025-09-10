import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus } from 'lucide-react';

export const Tendering: React.FC = () => {
  const tenders = [
    { id: 'TND-001', title: 'Office Furniture Supply', bidders: 8, deadline: '2024-02-15', status: 'Open', value: 45000 },
    { id: 'TND-002', title: 'IT Equipment Procurement', bidders: 12, deadline: '2024-02-20', status: 'Evaluation', value: 125000 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Tender</CardTitle>
          <CardDescription>Publish a new solicitation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g., Office Furniture Supply" />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Tenders</CardTitle>
          <CardDescription>Monitor ongoing solicitations</CardDescription>
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
                  <TableCell>{t.status}</TableCell>
                  <TableCell>${t.value.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tendering;
