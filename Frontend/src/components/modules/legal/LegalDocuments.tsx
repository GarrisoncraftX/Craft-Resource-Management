import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Eye } from 'lucide-react';
import { mockLegalDocuments } from '@/services/mockData/legal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const LegalDocuments: React.FC = () => {
  const [docs] = useState(mockLegalDocuments);

  const docsByType = [
    { type: 'Policy', count: docs.filter(d => d.type === 'Policy').length, fill: '#3b82f6' },
    { type: 'Template', count: docs.filter(d => d.type === 'Template').length, fill: '#10b981' },
    { type: 'Contract', count: docs.filter(d => d.type === 'Contract').length, fill: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Type Distribution</CardTitle>
          <CardDescription>Legal documents by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={docsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Legal Documents Repository</CardTitle>
              <CardDescription>Templates, policies, and filings</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>{d.title}</TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'Active' ? 'default' : 'secondary'}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{d.owner}</TableCell>
                  <TableCell>{new Date(d.updatedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
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

export default LegalDocuments;
