import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchLegalCases } from '@/services/api';

const dummyCases = [
	{ id: 'CASE-001', title: 'Vendor Dispute', stage: 'Discovery', counsel: 'A&B Law', next: '2024-02-12' },
	{ id: 'CASE-002', title: 'Employment Claim', stage: 'Hearing', counsel: 'CDE Legal', next: '2024-03-05' },
];

export const LegalCases: React.FC = () => {
	const [cases, setCases] = useState<any[]>(dummyCases);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const resp = await fetchLegalCases();
        console.log('Fetched legal cases:', resp);
				if (!cancelled && Array.isArray(resp) && resp.length > 0) {
					const mapped = resp.map((c: any) => ({
						id: c.id ?? c.caseNumber ?? `CASE-${Math.random().toString(36).slice(2, 8)}`,
						title: c.title ?? c.caseTitle ?? c.subject ?? c.summary ?? 'Untitled Case',
						stage: c.stage ?? c.caseStage ?? c.status ?? 'Unknown',
						counsel: c.counsel ?? c.assignedCounsel ?? c.lawFirm ?? '',
						next: c.nextDate ?? c.nextHearingDate ?? c.next ?? '',
					}));
					setCases(mapped);
				}
			} catch (err: any) {
				console.warn('LegalCases: failed to fetch legal cases — using fallback dummies.', err?.message ?? err);
				setError(err?.message ?? 'Failed to fetch legal cases');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, []);

	if (loading) return <div className="p-6">Loading legal cases…</div>;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Legal Cases</CardTitle>
					<CardDescription>Active and historical cases</CardDescription>
				</CardHeader>
				<CardContent>
					{error && <div className="mb-2 text-sm text-yellow-600">Warning: {error} — showing fallback/local data.</div>}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Stage</TableHead>
								<TableHead>Counsel</TableHead>
								<TableHead>Next Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{cases.map((c) => (
								<TableRow key={c.id}>
									<TableCell className="font-medium">{c.id}</TableCell>
									<TableCell>{c.title}</TableCell>
									<TableCell>{c.stage}</TableCell>
									<TableCell>{c.counsel}</TableCell>
									<TableCell>{c.next ? new Date(c.next).toLocaleDateString() : '—'}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default LegalCases;
