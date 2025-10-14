import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchComplianceRecords } from '@/services/api';

const dummyAudits = [
	{ id: 'CMP-001', area: 'Data Privacy', status: 'Compliant', lastAudit: '2023-12-20' },
	{ id: 'CMP-002', area: 'Procurement Policy', status: 'Needs Review', lastAudit: '2023-11-15' },
];

export const ComplianceMonitoring: React.FC = () => {
	const [audits, setAudits] = useState<any[]>(dummyAudits);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const resp = await fetchComplianceRecords();
        console.log('Fetched compliance records:', resp);
				if (!cancelled && Array.isArray(resp) && resp.length > 0) {
					const mapped = resp.map((r: any) => ({
						id: r.id ?? r.recordId ?? `CMP-${Math.random().toString(36).slice(2, 8)}`,
						area: r.area ?? r.subject ?? r.complianceArea ?? r.name ?? 'Unknown Area',
						status: r.status ?? r.result ?? r.outcome ?? 'Unknown',
						lastAudit: r.lastAudit ?? r.auditDate ?? r.last_audit_date ?? r.updatedAt ?? '',
					}));
					setAudits(mapped);
				}
			} catch (err: any) {
				console.warn('ComplianceMonitoring: failed to fetch records — using fallback dummies.', err?.message ?? err);
				setError(err?.message ?? 'Failed to fetch compliance records');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, []);

	if (loading) return <div className="p-6">Loading compliance records…</div>;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Compliance Monitoring</CardTitle>
					<CardDescription>Internal audits and regulatory checks</CardDescription>
				</CardHeader>
				<CardContent>
					{error && <div className="mb-2 text-sm text-yellow-600">Warning: {error} — showing fallback/local data.</div>}
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
									<TableCell>{a.lastAudit ? new Date(a.lastAudit).toLocaleDateString() : '—'}</TableCell>
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
