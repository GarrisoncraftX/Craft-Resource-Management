import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Scale, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { fetchLegalCases, fetchComplianceRecords } from '@/services/api';
import { mockLegalCases, mockComplianceRecords, mockLegalDocuments } from '@/services/mockData/legal';

export const LegalManagement: React.FC = () => {
  const [openCasesCount, setOpenCasesCount] = useState<number>(0);
  const [contractsUnderReviewCount, setContractsUnderReviewCount] = useState<number>(0);
  const [complianceAlertsCount, setComplianceAlertsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [legalCases, setLegalCases] = useState<any[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<any[]>([]);
  const policies = mockLegalDocuments;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesResp, complianceResp] = await Promise.all([
        fetchLegalCases().catch(() => mockLegalCases),
        fetchComplianceRecords().catch(() => mockComplianceRecords)
      ]);

      const cases = Array.isArray(casesResp) && casesResp.length > 0 ? casesResp : mockLegalCases;
      const compliance = Array.isArray(complianceResp) && complianceResp.length > 0 ? complianceResp : mockComplianceRecords;

      setLegalCases(cases);
      setComplianceRecords(compliance);

      const open = cases.filter((c: any) => {
        const stage = (c.stage ?? c.caseStage ?? c.status ?? '').toString().toLowerCase();
        return !(stage.includes('closed') || stage.includes('resolved') || stage.includes('dismissed'));
      }).length;

      const contracts = cases.filter((c: any) => {
        const stage = (c.stage ?? c.caseStage ?? '').toString().toLowerCase();
        const title = (c.title ?? c.caseTitle ?? '').toString().toLowerCase();
        return stage.includes('review') || title.includes('contract');
      }).length;

      const alerts = compliance.filter((r: any) => {
        const status = (r.status ?? r.result ?? r.outcome ?? '').toString().toLowerCase();
        return !(status === 'compliant' || status === 'ok' || status === 'passed');
      }).length;

      setOpenCasesCount(open);
      setContractsUnderReviewCount(contracts);
      setComplianceAlertsCount(alerts);
    } catch (err) {
      console.warn('LegalManagement: failed to fetch legal data', (err as any)?.message ?? err);
    } finally {
      setLoading(false);
    }
  };

  const casesTrend = [
    { month: 'Jan', cases: 8, resolved: 5 },
    { month: 'Feb', cases: 12, resolved: 7 },
    { month: 'Mar', cases: 10, resolved: 9 },
    { month: 'Apr', cases: 15, resolved: 11 },
    { month: 'May', cases: 11, resolved: 8 },
    { month: 'Jun', cases: 9, resolved: 10 }
  ];

  const complianceTrend = [
    { month: 'Jan', compliant: 85 },
    { month: 'Feb', compliant: 88 },
    { month: 'Mar', compliant: 90 },
    { month: 'Apr', compliant: 92 },
    { month: 'May', compliant: 94 },
    { month: 'Jun', compliant: 95 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Cases</CardTitle>
            <CardDescription>Currently in litigation</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{openCasesCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contracts Under Review</CardTitle>
            <CardDescription>Awaiting legal approval</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{contractsUnderReviewCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Alerts</CardTitle>
            <CardDescription>Requires attention</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{complianceAlertsCount}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Legal Cases Trend</CardTitle>
            <CardDescription>Cases filed vs resolved over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={casesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cases" stroke="#3b82f6" name="Filed" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Rate Trend</CardTitle>
            <CardDescription>Compliance percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="compliant" fill="#10b981" name="Compliance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
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
                <TableHead>Type</TableHead>
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
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{p.owner}</TableCell>
                  <TableCell>{p.updatedDate}</TableCell>
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
