import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench } from 'lucide-react';

// use existing service API functions (already in api.ts)
import { fetchMaintenanceRecords, createMaintenanceRecord } from '@/services/api';

/* Fallback dummy schedule data (preserved as UI fallback) */
const dummySchedules = [
	{
		id: 'MT-001',
		assetName: 'Generator',
		assetId: null,
		type: 'Inspection',
		date: '2024-02-05',
		technician: 'Power Systems',
		status: 'Scheduled',
		description: '',
	},
	{
		id: 'MT-002',
		assetName: 'AC Unit',
		assetId: null,
		type: 'Repair',
		date: '2024-01-25',
		technician: 'HVAC Services',
		status: 'In Progress',
		description: '',
	},
];

export const MaintenanceManagement: React.FC = () => {
	const [schedules, setSchedules] = useState<typeof dummySchedules>(dummySchedules);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Form state
	const [assetId, setAssetId] = useState<string>(''); // accepts asset id (backend Asset.id)
	const [type, setType] = useState<string>('');
	const [date, setDate] = useState<string>('');
	const [technician, setTechnician] = useState<string>('');
	const [description, setDescription] = useState<string>('');

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const resp = await fetchMaintenanceRecords();
				console.log('Fetched maintenance records:', resp);
				// Expecting array of MaintenanceRecord { id, asset: {id, assetName, assetTag, ...}, maintenanceDate, description, performedBy }
				if (!cancelled && Array.isArray(resp) && resp.length > 0) {
					const mapped = resp.map((r: unknown) => ({
						id: r.id,
						assetName: r.asset?.assetName ?? r.asset?.assetTag ?? 'Unknown Asset',
						assetId: r.asset?.id ?? null,
						type: r.type ?? r.taskType ?? '', // any extra fields
						date: r.maintenanceDate ?? r.maintenance_date ?? r.date ?? '',
						technician: r.performedBy ?? r.performed_by ?? '',
						description: r.description ?? '',
						status: r.status ?? 'Scheduled',
					}));
					setSchedules(mapped);
				}
			} catch (err) {
				console.warn('MaintenanceManagement: failed to fetch maintenance records — using fallback dummies.', err?.message ?? err);
				setError(err?.message ?? 'Failed to fetch maintenance records');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, []);

	const handleAddTask = async () => {
		// Build payload expected by backend. MaintenanceRecord entity expects:
		// { asset: { id: <number> }, maintenanceDate: "YYYY-MM-DD", description, performedBy }
		const payload: unknown = {
			asset: { id: assetId ? Number(assetId) : undefined },
			maintenanceDate: date || undefined,
			description: description || undefined,
			performedBy: technician || undefined,
		};

		// Minimal validation
		if (!payload.asset?.id || !payload.maintenanceDate) {
			setError('Asset ID and Date are required');
			return;
		}

		try {
			const created = await createMaintenanceRecord(payload);
			// Map created response to UI shape (backend may return full MaintenanceRecord)
			const item = {
				id: created?.id ?? `MT-${Date.now()}`,
				assetName: created?.asset?.assetName ?? created?.asset?.assetTag ?? `Asset ${payload.asset.id}`,
				assetId: created?.asset?.id ?? payload.asset.id,
				type: created?.type ?? type,
				date: created?.maintenanceDate ?? payload.maintenanceDate,
				technician: created?.performedBy ?? payload.performedBy ?? technician,
				description: created?.description ?? description,
				status: created?.status ?? 'Scheduled',
			};
			setSchedules(prev => [item, ...prev]);
			setError(null);
		} catch (err) {
			console.warn('MaintenanceManagement: create failed; adding locally as fallback.', err?.message ?? err);
			// Optimistic local add on failure
			const local = {
				id: `MT-${Date.now()}`,
				assetName: `Asset ${assetId}`,
				assetId: assetId ? Number(assetId) : null,
				type,
				date,
				technician,
				description,
				status: 'Scheduled',
			};
			setSchedules(prev => [local, ...prev]);
			setError(err?.message ?? 'Failed to create maintenance record (saved locally)');
		} finally {
			// reset form
			setAssetId('');
			setType('');
			setDate('');
			setTechnician('');
			setDescription('');
		}
	};

	if (loading) return <div className="p-6">Loading maintenance schedule…</div>;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Schedule Maintenance</CardTitle>
					<CardDescription>Create preventive or corrective maintenance tasks</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="asset">Asset ID</Label>
							<Input id="asset" value={assetId} onChange={(e) => setAssetId(e.target.value)} placeholder="numeric asset id (e.g. 12)" />
						</div>
						<div>
							<Label htmlFor="type">Type</Label>
							<Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Inspection" />
						</div>
						<div>
							<Label htmlFor="date">Date</Label>
							<Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
						</div>
						<div>
							<Label htmlFor="technician">Technician</Label>
							<Input id="technician" value={technician} onChange={(e) => setTechnician(e.target.value)} placeholder="e.g., Vendor Name" />
						</div>
						<div className="md:col-span-4">
							<Label htmlFor="description">Description</Label>
							<Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes about the maintenance" />
						</div>
					</div>
					<div className="flex items-center gap-3 mt-4">
						<Button onClick={handleAddTask}>
							<Wrench className="h-4 w-4 mr-2" />
							Add Task
						</Button>
						{error && <div className="text-sm text-yellow-600">{error}</div>}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Maintenance Schedule</CardTitle>
					<CardDescription>Upcoming and ongoing maintenance tasks</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Asset</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Technician</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{schedules.map((m) => (
								<TableRow key={m.id}>
									<TableCell className="font-medium">{m.id}</TableCell>
									<TableCell>{m.assetName}</TableCell>
									<TableCell>{m.type}</TableCell>
									<TableCell>{m.date ? new Date(m.date).toLocaleDateString() : '—'}</TableCell>
									<TableCell>{m.technician}</TableCell>
									<TableCell>{m.status}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default MaintenanceManagement;
