import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export const ContractReview: React.FC = () => {
  const contracts = [
    { id: 'CN-001', title: 'IT Support Agreement', department: 'IT', submitted: '2024-01-12', status: 'Pending Review' },
    { id: 'CN-002', title: 'Cleaning Services', department: 'Admin', submitted: '2024-01-15', status: 'In Review' },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Review</CardTitle>
          <CardDescription>Workflow of submitted contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.department}</TableCell>
                  <TableCell>{c.submitted}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Open</Button>
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

export default ContractReview;
