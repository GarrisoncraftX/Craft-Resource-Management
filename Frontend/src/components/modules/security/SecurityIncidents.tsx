import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus } from 'lucide-react';

export const SecurityIncidents: React.FC = () => {
  const incidents = [
    { id: 'INC-001', type: 'Unauthorized Access', location: 'Server Room', date: '2024-01-18', status: 'Investigating' },
    { id: 'INC-002', type: 'Lost ID Card', location: 'Lobby', date: '2024-01-20', status: 'Closed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Incidents</h2>
          <p className="text-muted-foreground">Report and track security issues</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Report Incident
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Log</CardTitle>
          <CardDescription>Recent security reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.id}</TableCell>
                  <TableCell>{i.type}</TableCell>
                  <TableCell>{i.location}</TableCell>
                  <TableCell>{i.date}</TableCell>
                  <TableCell>{i.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityIncidents;
