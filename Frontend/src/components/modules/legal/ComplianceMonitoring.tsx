import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchComplianceRecords, createComplianceRecord, updateComplianceRecord, deleteComplianceRecord } from '@/services/api';
import { mockComplianceRecords } from '@/services/mockData/legal';
import type { ComplianceRecord } from '@/services/mockData/legal';
import { ComplianceForm } from './ComplianceForm';
import { toast } from 'sonner';

export const ComplianceMonitoring: React.FC = () => {
	const [audits, setAudits] = useState<ComplianceRecord[]>(mockComplianceRecords);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [formOpen, setFormOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<ComplianceRecord | undefined>();

	useEffect(() => {
		loadRecords();
	}, []);

	const loadRecords = async () => {
		setLoading(true);
		setError(null);
		try {
			const resp = await fetchComplianceRecords();
			if (Array.isArray(resp) && resp.length > 0) {
				const mapped = resp.map((r: any) => ({
					id: r.id ?? r.recordId ?? `CMP-${Math.random().toString(36).slice(2, 8)}`,
					entity: r.entity ?? '',
					regulation: r.regulation ?? '',
					complianceDate: r.complianceDate ?? '',
					status: r.status ?? r.result ?? r.outcome ?? 'Unknown',
					notes: r.notes,
					area: r.area ?? r.subject ?? r.complianceArea ?? r.name ?? 'Unknown Area',
					lastAudit: r.lastAudit ?? r.auditDate ?? r.last_audit_date ?? r.updatedAt ?? '',
					nextReview: r.nextReview ?? ''
				}));
				setAudits(mapped);
			} else {
				setAudits(mockComplianceRecords);
			}
		} catch (err: any) {
			console.warn('ComplianceMonitoring: failed to fetch records — using fallback data.', err?.message ?? err);
			setError(err?.message ?? 'Failed to fetch compliance records');
			setAudits(mockComplianceRecords);
		} finally {
			setLoading(false);
		}
	};

	const handleCreate = async (data: Partial<ComplianceRecord>) => {
		try {
			await createComplianceRecord(data);
			toast.success('Compliance record created successfully');
			loadRecords();
		} catch (error) {
			toast.error('Failed to create compliance record');
			console.error(error);
		}
	};

	const handleUpdate = async (data: Partial<ComplianceRecord>) => {
		if (!editingRecord?.id) return;
		try {
			await updateComplianceRecord(editingRecord.id, data);
			toast.success('Compliance record updated successfully');
			loadRecords();
			setEditingRecord(undefined);
		} catch (error) {
			toast.error('Failed to update compliance record');
			console.error(error);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Are you sure you want to delete this record?')) return;
		try {
			await deleteComplianceRecord(id);
			toast.success('Compliance record deleted successfully');
			loadRecords();
		} catch (error) {
			toast.error('Failed to delete compliance record');
			console.error(error);
		}
	};

	const complianceByStatus = [
		{ name: 'Compliant', value: audits.filter(a => a.status === 'Compliant').length, fill: '#10b981' },
		{ name: 'Review Required', value: audits.filter(a => a.status === 'Review Required').length, fill: '#f59e0b' },
		{ name: 'Non-Compliant', value: audits.filter(a => a.status === 'Non-Compliant').length, fill: '#ef4444' },
		{ name: 'In Progress', value: audits.filter(a => a.status === 'In Progress').length, fill: '#3b82f6' }
	].filter(item => item.value > 0);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Compliance Status Distribution</CardTitle>
						<CardDescription>Overview of compliance records</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={complianceByStatus}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{complianceByStatus.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.fill} />
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
						<CardTitle>Compliance Summary</CardTitle>
						<CardDescription>Key metrics</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center p-4 border rounded-lg">
								<div>
									<p className="text-sm text-muted-foreground">Total Records</p>
									<p className="text-2xl font-bold">{audits.length}</p>
								</div>
							</div>
							<div className="flex justify-between items-center p-4 border rounded-lg">
								<div>
									<p className="text-sm text-muted-foreground">Compliant</p>
									<p className="text-2xl font-bold text-green-600">{audits.filter(a => a.status === 'Compliant').length}</p>
								</div>
							</div>
							<div className="flex justify-between items-center p-4 border rounded-lg">
								<div>
									<p className="text-sm text-muted-foreground">Needs Attention</p>
									<p className="text-2xl font-bold text-orange-600">{audits.filter(a => a.status !== 'Compliant').length}</p>
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
							<CardTitle>Compliance Monitoring</CardTitle>
							<CardDescription>Internal audits and regulatory checks</CardDescription>
						</div>
						<Button onClick={() => { setEditingRecord(undefined); setFormOpen(true); }}>
							<Plus className="h-4 w-4 mr-2" />
							New Record
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{error && <div className="mb-2 text-sm text-yellow-600">Warning: {error} — showing fallback/local data.</div>}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Area</TableHead>
								<TableHead>Entity</TableHead>
								<TableHead>Regulation</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Last Audit</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{audits.map((a) => (
								<TableRow key={a.id}>
									<TableCell className="font-medium">{a.id}</TableCell>
									<TableCell>{a.area}</TableCell>
									<TableCell>{a.entity}</TableCell>
									<TableCell>{a.regulation}</TableCell>
									<TableCell>
										<Badge variant={a.status === 'Compliant' ? 'default' : a.status === 'Non-Compliant' ? 'destructive' : 'secondary'}>
											{a.status}
										</Badge>
									</TableCell>
									<TableCell>{a.lastAudit ? new Date(a.lastAudit).toLocaleDateString() : '—'}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button size="sm" variant="outline" onClick={() => { setEditingRecord(a); setFormOpen(true); }}>
												<Edit className="h-3 w-3" />
											</Button>
											<Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<ComplianceForm
				open={formOpen}
				onOpenChange={setFormOpen}
				onSubmit={editingRecord ? handleUpdate : handleCreate}
				initialData={editingRecord}
			/>
		</div>
	);
};

export default ComplianceMonitoring;
