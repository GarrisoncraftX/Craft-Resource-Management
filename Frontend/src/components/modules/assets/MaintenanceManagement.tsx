import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Plus } from 'lucide-react';

export const MaintenanceManagement: React.FC = () => {
  const schedules = [
    { id: 'MT-001', asset: 'Generator', type: 'Inspection', date: '2024-02-05', technician: 'Power Systems', status: 'Scheduled' },
    { id: 'MT-002', asset: 'AC Unit', type: 'Repair', date: '2024-01-25', technician: 'HVAC Services', status: 'In Progress' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Maintenance</CardTitle>
          <CardDescription>Create preventive or corrective maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="asset">Asset</Label>
              <Input id="asset" placeholder="e.g., Generator" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" placeholder="e.g., Inspection" />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
            <div>
              <Label htmlFor="technician">Technician</Label>
              <Input id="technician" placeholder="e.g., Vendor Name" />
            </div>
          </div>
          <Button className="mt-4">
            <Wrench className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
          <CardDescription>Upcoming and ongoing maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.id}</TableCell>
                  <TableCell>{m.asset}</TableCell>
                  <TableCell>{m.type}</TableCell>
                  <TableCell>{m.date}</TableCell>
                  <TableCell>{m.technician}</TableCell>
                  <TableCell>{m.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceManagement;
