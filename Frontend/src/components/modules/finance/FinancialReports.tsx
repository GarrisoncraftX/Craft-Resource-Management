import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  chartOfAccountsData,
  budgetManagementData,
  journalEntriesData,
  accountsPayableData,
  accountsReceivableData,
  financialReportsData,
} from '@/services/mockData';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer,} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#E74C3C', '#3498DB'];

export const FinancialReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = financialReportsData.filter(report =>
    report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">View and manage your financial reports</p>
        </div>
        <div className="w-64">
          <Label htmlFor="search">Search Reports</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by report name, period, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Overview</CardTitle>
          <CardDescription>
            {filteredReports.length} of {financialReportsData.length} reports displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Generated On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.reportName}</TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{report.generatedOn}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'Completed' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" disabled={report.status !== 'Completed'}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="ml-2">
                      Generate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
        </CardHeader>
        <CardContent style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartOfAccountsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
              {chartOfAccountsData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[chartOfAccountsData.findIndex(e => e.name === entry.name) % COLORS.length]} />
              ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
        </CardHeader>
        <CardContent style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={budgetManagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" />
              <Bar dataKey="spent" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
        </CardHeader>
        <CardContent style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={journalEntriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="debit" fill="#8884d8" />
              <Bar dataKey="credit" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accounts Payable</CardTitle>
        </CardHeader>
        <CardContent style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={accountsPayableData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {accountsPayableData.map((entry) => (
                <Bar key={entry.name} dataKey="amount" fill={COLORS[accountsPayableData.findIndex(e => e.name === entry.name) % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accounts Receivable</CardTitle>
        </CardHeader>
        <CardContent style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={accountsReceivableData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {accountsReceivableData.map((entry) => (
                <Bar key={entry.name} dataKey="amount" fill={COLORS[accountsReceivableData.findIndex(e => e.name === entry.name) % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
