import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchDisposalRecords, createDisposalRecord } from '@/services/api';
import type { DisposalRecord } from '@/types/asset';
import { mockDisposalRecords } from '@/services/mockData/assets';

export const AssetRequestable: React.FC = () => {
  const [disposals, setDisposals] = useState<DisposalRecord[]>(mockDisposalRecords);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [assetId, setAssetId] = useState<string>('');
  const [method, setMethod] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchDisposalRecords();
        console.log('Fetched disposal records:', resp);
        if (!cancelled && Array.isArray(resp) && resp.length > 0) {
          const mapped: DisposalRecord[] = resp.map((r: unknown) => {
            const record = r as Record<string, unknown>;
            const asset = record.asset as Record<string, unknown> | undefined;
            return {
              id: record.id as number ?? Math.floor(Math.random() * 100000),
              asset: asset?.assetName as string ?? asset?.assetTag as string ?? record.asset as string ?? record.assetName as string ?? 'Unknown Asset',
              method: record.method as string ?? record.disposalMethod as string ?? '',
              disposalDate: record.disposalDate as string ?? record.date as string ?? record.disposedAt as string ?? '',
              status: record.status as string ?? record.state as string ?? '',
              proceeds: Number(record.proceeds ?? record.amount ?? 0),
            };
          });
          setDisposals(mapped);
        }
      } catch (err) {
        console.warn('AssetDisposal: failed to load disposal records — using fallback dummies.', err instanceof Error ? err.message : err);
        setError(err instanceof Error ? err.message : 'Failed to fetch disposal records');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmitDisposal = async () => {
    const payload = {
      asset: { id: assetId ? Number(assetId) : undefined },
      disposalDate: date || undefined,
      method: method || undefined,
    };

    if (!payload.asset?.id || !payload.disposalDate || !payload.method) {
      setError('Asset ID, Method, and Date are required');
      return;
    }

    try {
      const created = await createDisposalRecord(payload) as unknown as Record<string, unknown>;
      const createdAsset = created?.asset as Record<string, unknown> | undefined;
      const item: DisposalRecord = {
        id: created?.id as number ?? Math.floor(Math.random() * 100000),
        asset: createdAsset?.assetName as string ?? createdAsset?.assetTag as string ?? `Asset ${payload.asset.id}`,
        method: created?.method as string ?? payload.method,
        disposalDate: created?.disposalDate as string ?? payload.disposalDate,
        status: created?.status as string ?? 'Pending Approval',
        proceeds: Number(created?.proceeds ?? 0),
      };
      setDisposals(prev => [item, ...prev]);
      setError(null);
    } catch (err) {
      console.warn('AssetDisposal: create failed; adding locally as fallback.', err instanceof Error ? err.message : err);
      const local: DisposalRecord = {
        id: Math.floor(Math.random() * 100000),
        asset: `Asset ${assetId}`,
        method,
        disposalDate: date,
        status: 'Pending Approval',
        proceeds: 0,
      };
      setDisposals(prev => [local, ...prev]);
      setError(err instanceof Error ? err.message : 'Failed to create disposal record (saved locally)');
    } finally {
      setAssetId('');
      setMethod('');
      setDate('');
    }
  };

  if (loading) return <div className="p-6">Loading disposal records…</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Initiate Disposal</CardTitle>
          <CardDescription>Request end-of-life asset disposal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="asset">Asset ID</Label>
              <Input id="asset" value={assetId} onChange={(e) => setAssetId(e.target.value)} placeholder="numeric asset id (e.g. 12)" />
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Input id="method" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="e.g., Auction / Scrap" />
            </div>
            <div>
              <Label htmlFor="date">Proposed Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleSubmitDisposal}>Submit Disposal</Button>
            {error && <div className="text-sm text-yellow-600">{error}</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disposal Records</CardTitle>
          <CardDescription>Track status and proceeds</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-2 text-sm text-yellow-600">Warning: {error} — showing fallback/local data.</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proceeds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disposals.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>{d.asset}</TableCell>
                  <TableCell>{d.method}</TableCell>
                  <TableCell>{d.disposalDate ? new Date(d.disposalDate).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>{d.status}</TableCell>
                  <TableCell>${Number(d.proceeds ?? 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetRequestable;
