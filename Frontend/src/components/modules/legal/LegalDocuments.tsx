import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const LegalDocuments: React.FC = () => {
  const docs = [
    { id: 'DOC-001', name: 'Vendor NDA Template', type: 'Template', updated: '2024-01-05' },
    { id: 'DOC-002', name: 'Employee Handbook', type: 'Policy', updated: '2023-12-12' },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Documents Repository</CardTitle>
          <CardDescription>Templates, policies, and filings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>{d.updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalDocuments;
