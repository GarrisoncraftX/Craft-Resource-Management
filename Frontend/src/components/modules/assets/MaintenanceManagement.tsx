import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench } from 'lucide-react';

import { fetchMaintenanceRecords, createMaintenanceRecord } from '@/services/api';
import type { MaintenanceRecord } from '@/types/asset';
import { mockMaintenanceRecords } from '@/services/mockData/assets';

export const MaintenanceManagement: React.FC = () => {
	const [schedules, setSchedules] = useState<MaintenanceRecord[]>(mockMaintenanceRecords);
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
				if (!cancelled && Array.isArray(resp) && resp.length > 0) {
					const mapped: MaintenanceRecord[] = resp.map((r: unknown) => {
						const record = r as Record<string, unknown>;
						const asset = record.asset as Record<string, unknown> | undefined;
						return {
							id: record.id as number,
							asset: asset?.assetName as string ?? asset?.assetTag as string ?? 'Unknown Asset',
							type: record.type as string ?? record.taskType as string ?? '',
							maintenanceDate: record.maintenanceDate as string ?? record.maintenance_date as string ?? record.date as string ?? '',
							performedBy: record.performedBy as string ?? record.performed_by as string ?? '',
							description: record.description as string ?? '',
							status: record.status as string ?? 'Scheduled',
						};
					});
					setSchedules(mapped);
				}
			} catch (err) {
				console.warn('MaintenanceManagement: failed to fetch maintenance records — using fallback dummies.', err instanceof Error ? err.message : err);
				setError(err instanceof Error ? err.message : 'Failed to fetch maintenance records');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, []);

	const handleAddTask = async () => {
		// Build payload expected by backend. MaintenanceRecord entity expects:
		// { asset: { id: <number> }, maintenanceDate: "YYYY-MM-DD", description, performedBy }
		const payload = {
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
			const created = await createMaintenanceRecord(payload) as unknown as Record<string, unknown>;
			const createdAsset = created?.asset as Record<string, unknown> | undefined;
			const item: MaintenanceRecord = {
				id: created?.id as number ?? Math.floor(Math.random() * 100000),
				asset: createdAsset?.assetName as string ?? createdAsset?.assetTag as string ?? `Asset ${payload.asset.id}`,
				type: created?.type as string ?? type,
				maintenanceDate: created?.maintenanceDate as string ?? payload.maintenanceDate,
				performedBy: created?.performedBy as string ?? payload.performedBy ?? technician,
				description: created?.description as string ?? description,
				status: created?.status as string ?? 'Scheduled',
			};
			setSchedules(prev => [item, ...prev]);
			setError(null);
		} catch (err) {
			console.warn('MaintenanceManagement: create failed; adding locally as fallback.', err instanceof Error ? err.message : err);
			const local: MaintenanceRecord = {
				id: Math.floor(Math.random() * 100000),
				asset: `Asset ${assetId}`,
				type,
				maintenanceDate: date,
				performedBy: technician,
				description,
				status: 'Scheduled',
			};
			setSchedules(prev => [local, ...prev]);
			setError(err instanceof Error ? err.message : 'Failed to create maintenance record (saved locally)');
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
						<TableCell>{m.asset}</TableCell>
						<TableCell>{m.type}</TableCell>
						<TableCell>{m.maintenanceDate ? new Date(m.maintenanceDate).toLocaleDateString() : '—'}</TableCell>
						<TableCell>{m.performedBy}</TableCell>
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
