import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchLegalCases, createLegalCase, updateLegalCase, deleteLegalCase } from '@/services/api';
import { mockLegalCases } from '@/services/mockData/legal';
import type { LegalCase } from '@/services/mockData/legal';
import { LegalCaseForm } from './LegalCaseForm';
import { toast } from 'sonner';

export const LegalCases: React.FC = () => {
	const [cases, setCases] = useState<LegalCase[]>(mockLegalCases);
	const [error, setError] = useState<string | null>(null);
	const [formOpen, setFormOpen] = useState(false);
	const [editingCase, setEditingCase] = useState<LegalCase | undefined>();

	useEffect(() => {
		loadCases();
	}, []);

	const loadCases = async () => {
		setError(null);
		try {
			const resp = await fetchLegalCases();
			if (Array.isArray(resp) && resp.length > 0) {
				setCases(resp);
			} else {
				setCases(mockLegalCases);
			}
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to fetch legal cases';
			console.warn('LegalCases: failed to fetch legal cases — using fallback data.', errorMessage);
			setError(errorMessage);
			setCases(mockLegalCases);
		} finally {
			// Cases loaded
		}
	};

	const handleCreate = async (data: Omit<LegalCase, 'id'>) => {
		try {
			await createLegalCase(data);
			toast.success('Legal case created successfully');
			loadCases();
		} catch (error) {
			toast.error('Failed to create legal case');
			console.error(error);
		}
	};

	const handleUpdate = async (data: Omit<LegalCase, 'id'>) => {
		if (!editingCase?.id) return;
		try {
			await updateLegalCase(editingCase.id, data);
			toast.success('Legal case updated successfully');
			loadCases();
			setEditingCase(undefined);
		} catch (error) {
			toast.error('Failed to update legal case');
			console.error(error);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Are you sure you want to delete this case?')) return;
		try {
			await deleteLegalCase(id);
			toast.success('Legal case deleted successfully');
			loadCases();
		} catch (error) {
			toast.error('Failed to delete legal case');
			console.error(error);
		}
	};

	const getPriorityVariant = (priority: string) => {
		if (priority === 'High' || priority === 'Critical') return 'destructive';
		if (priority === 'Medium') return 'default';
		return 'secondary';
	};

	const getStatusVariant = (status: string) => {
		if (status === 'Active') return 'default';
		if (status === 'Completed') return 'secondary';
		return 'outline';
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Legal Cases</CardTitle>
							<CardDescription>Active and historical cases</CardDescription>
						</div>
						<Button onClick={() => { setEditingCase(undefined); setFormOpen(true); }}>
							<Plus className="h-4 w-4 mr-2" />
							New Case
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{error && <div className="mb-2 text-sm text-yellow-600">Warning: {error} — showing fallback/local data.</div>}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Stage</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Counsel</TableHead>
								<TableHead>Next Date</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{cases.map((c) => (
								<TableRow key={c.id}>
									<TableCell className="font-medium">{c.id}</TableCell>
									<TableCell>{c.title}</TableCell>
									<TableCell>{c.stage}</TableCell>
									<TableCell>
										<Badge variant={getPriorityVariant(c.priority)}>
											{c.priority}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={getStatusVariant(c.status)}>
											{c.status}
										</Badge>
									</TableCell>
									<TableCell>{c.counsel}</TableCell>
									<TableCell>{c.nextDate ? new Date(c.nextDate).toLocaleDateString() : '—'}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<TooltipProvider delayDuration={200}>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button size="sm" variant="outline" onClick={() => { setEditingCase(c); setFormOpen(true); }}>
															<Edit className="h-3 w-3" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Edit Case</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
											<TooltipProvider delayDuration={200}>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
															<Trash2 className="h-3 w-3" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Delete Case</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<LegalCaseForm
				open={formOpen}
				onOpenChange={setFormOpen}
				onSubmit={editingCase ? handleUpdate : handleCreate}
				initialData={editingCase}
			/>
		</div>
	);
};

export default LegalCases;
