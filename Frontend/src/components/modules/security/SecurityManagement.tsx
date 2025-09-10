import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Shield, Plus, KeyRound, Users } from 'lucide-react';

export const SecurityManagement: React.FC = () => {
  const posts = [
    { post: 'Gate A', guards: 3, shift: 'Day', status: 'Active' },
    { post: 'Gate B', guards: 2, shift: 'Night', status: 'Active' },
    { post: 'Server Room', guards: 1, shift: '24/7', status: 'Restricted' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Management</h2>
          <p className="text-muted-foreground">Administer guard posts, schedules, and SOPs</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" /> New SOP
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guard Posts</CardTitle>
          <CardDescription>Staffing and shift allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Guards</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{p.post}</TableCell>
                  <TableCell>{p.guards}</TableCell>
                  <TableCell>{p.shift}</TableCell>
                  <TableCell>{p.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityManagement;
