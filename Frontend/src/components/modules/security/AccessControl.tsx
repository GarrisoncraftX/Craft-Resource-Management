import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { KeyRound, Plus } from 'lucide-react';

export const AccessControl: React.FC = () => {
  const rules = [
    { id: 'AC-001', role: 'IT Staff', door: 'Server Room', schedule: '09:00-18:00', status: 'Enabled' },
    { id: 'AC-002', role: 'Cleaners', door: 'All Offices', schedule: '18:00-22:00', status: 'Enabled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Access Control</h2>
          <p className="text-muted-foreground">Configure access rules and schedules</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> New Rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Rules</CardTitle>
          <CardDescription>Role-based door access</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Door</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell>{r.door}</TableCell>
                  <TableCell>{r.schedule}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControl;
