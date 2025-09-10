import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Scale, CheckCircle, AlertCircle } from 'lucide-react';

export const LegalManagement: React.FC = () => {
  const policies = [
    { id: 'LG-001', title: 'Data Protection Policy', status: 'Active', owner: 'Legal Dept', updated: '2024-01-10' },
    { id: 'LG-002', title: 'Vendor NDA Template', status: 'Active', owner: 'Legal Dept', updated: '2024-01-05' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Cases</CardTitle>
            <CardDescription>Currently in litigation</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">12</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contracts Under Review</CardTitle>
            <CardDescription>Awaiting legal approval</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">8</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Alerts</CardTitle>
            <CardDescription>Requires attention</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">3</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policies & Templates</CardTitle>
          <CardDescription>Organization-wide legal documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{p.owner}</TableCell>
                  <TableCell>{p.updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalManagement;
