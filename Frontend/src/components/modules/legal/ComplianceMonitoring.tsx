import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const ComplianceMonitoring: React.FC = () => {
  const audits = [
    { id: 'CMP-001', area: 'Data Privacy', status: 'Compliant', lastAudit: '2023-12-20' },
    { id: 'CMP-002', area: 'Procurement Policy', status: 'Needs Review', lastAudit: '2023-11-15' },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Monitoring</CardTitle>
          <CardDescription>Internal audits and regulatory checks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.id}</TableCell>
                  <TableCell>{a.area}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>{a.lastAudit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceMonitoring;
