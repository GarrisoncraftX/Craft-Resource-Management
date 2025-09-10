import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const LegalCases: React.FC = () => {
  const cases = [
    { id: 'CASE-001', title: 'Vendor Dispute', stage: 'Discovery', counsel: 'A&B Law', next: '2024-02-12' },
    { id: 'CASE-002', title: 'Employment Claim', stage: 'Hearing', counsel: 'CDE Legal', next: '2024-03-05' },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Cases</CardTitle>
          <CardDescription>Active and historical cases</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Counsel</TableHead>
                <TableHead>Next Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.stage}</TableCell>
                  <TableCell>{c.counsel}</TableCell>
                  <TableCell>{c.next}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalCases;
