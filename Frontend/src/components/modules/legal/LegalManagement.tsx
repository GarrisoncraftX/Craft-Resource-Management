import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Scale, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchLegalCases, fetchComplianceRecords } from '@/services/api';

export const LegalManagement: React.FC = () => {
  // policies remain local (backend currently exposes cases & compliance records)
  const policies = [
    { id: 'LG-001', title: 'Data Protection Policy', status: 'Active', owner: 'Legal Dept', updated: '2024-01-10' },
    { id: 'LG-002', title: 'Vendor NDA Template', status: 'Active', owner: 'Legal Dept', updated: '2024-01-05' },
  ];

  const [openCasesCount, setOpenCasesCount] = useState<number>(0);
  const [contractsUnderReviewCount, setContractsUnderReviewCount] = useState<number>(0);
  const [complianceAlertsCount, setComplianceAlertsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [casesResp, complianceResp] = await Promise.all([fetchLegalCases(), fetchComplianceRecords()]);
        console.log('Fetched legal cases and compliance records:', casesResp, complianceResp);
        if (cancelled) return;

        const cases = Array.isArray(casesResp) ? casesResp : [];
        const compliance = Array.isArray(complianceResp) ? complianceResp : [];

        // Open cases: heuristic -> stage/status not 'Closed'/'Resolved'
        const open = cases.filter((c: any) => {
          const stage = (c.stage ?? c.caseStage ?? c.status ?? '').toString().toLowerCase();
          return !(stage.includes('closed') || stage.includes('resolved') || stage.includes('dismissed'));
        }).length;

        // Contracts under review: heuristic -> stage contains 'review' or title mentions 'contract'
        const contracts = cases.filter((c: any) => {
          const stage = (c.stage ?? c.caseStage ?? '').toString().toLowerCase();
          const title = (c.title ?? c.caseTitle ?? '').toString().toLowerCase();
          return stage.includes('review') || title.includes('contract');
        }).length;

        // Compliance alerts: records not marked 'Compliant' or with result/outcome indicating issue
        const alerts = compliance.filter((r: any) => {
          const status = (r.status ?? r.result ?? r.outcome ?? '').toString().toLowerCase();
          return !(status === 'compliant' || status === 'ok' || status === 'passed');
        }).length;

        setOpenCasesCount(open);
        setContractsUnderReviewCount(contracts);
        setComplianceAlertsCount(alerts);
      } catch (err) {
        // keep default counts if fetch fails; log for debugging
        console.warn('LegalManagement: failed to fetch legal data', (err as any)?.message ?? err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="p-6">Loading legal dashboard…</div>;

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
