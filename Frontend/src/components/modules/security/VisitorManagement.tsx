import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const VisitorManagement: React.FC = () => {
  const visitors = [
    { id: 'VST-001', name: 'John Doe', purpose: 'Meeting', host: 'Jane Smith', checkIn: '09:30', checkOut: '10:15', status: 'Checked Out' },
    { id: 'VST-002', name: 'Alice Brown', purpose: 'Delivery', host: 'Logistics', checkIn: '11:05', checkOut: '-', status: 'On Site' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visitor Search</CardTitle>
          <CardDescription>Find visitor records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Visitor name" />
            </div>
            <div>
              <Label htmlFor="host">Host</Label>
              <Input id="host" placeholder="Employee" />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Logs</CardTitle>
          <CardDescription>All check-ins and check-outs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.id}</TableCell>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>{v.purpose}</TableCell>
                  <TableCell>{v.host}</TableCell>
                  <TableCell>{v.checkIn}</TableCell>
                  <TableCell>{v.checkOut}</TableCell>
                  <TableCell>{v.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorManagement;
