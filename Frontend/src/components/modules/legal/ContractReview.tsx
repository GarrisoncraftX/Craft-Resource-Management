import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { mockContracts } from '@/services/mockData/legal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const ContractReview: React.FC = () => {
  const [contracts] = useState(mockContracts);

  const contractsByStatus = [
    { name: 'Active', value: contracts.filter(c => c.status === 'Active').length, fill: '#10b981' },
    { name: 'Under Review', value: contracts.filter(c => c.status === 'Under Review').length, fill: '#f59e0b' },
    { name: 'Expired', value: contracts.filter(c => c.status === 'Expired').length, fill: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Status Distribution</CardTitle>
            <CardDescription>Contracts by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contractsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Value Summary</CardTitle>
            <CardDescription>Total contract values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Active Contracts</p>
                  <p className="text-2xl font-bold">
                    ${contracts.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.value, 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">
                    ${contracts.filter(c => c.status === 'Under Review').reduce((sum, c) => sum + c.value, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Contract Review</CardTitle>
              <CardDescription>All contracts and agreements</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.party}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>${c.value.toLocaleString()}</TableCell>
                  <TableCell>{new Date(c.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(c.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'Active' ? 'default' : c.status === 'Under Review' ? 'secondary' : 'destructive'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
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
