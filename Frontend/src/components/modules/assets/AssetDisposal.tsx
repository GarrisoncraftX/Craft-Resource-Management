import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchDisposalRecords } from '@/services/api';
import type { DisposalRecord } from '@/types/asset';

const disposalDummies: DisposalRecord[] = [
  { id: 1, asset: 'Old Printer', method: 'Auction', disposalDate: '2024-01-28', status: 'Pending Approval', proceeds: 0 },
  { id: 2, asset: 'Damaged Chair', method: 'Scrap', disposalDate: '2024-01-18', status: 'Completed', proceeds: 10 },
];

export const AssetDisposal: React.FC = () => {
  const [disposals, setDisposals] = useState<DisposalRecord[]>(disposalDummies);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchDisposalRecords();
        console.log('Fetched disposal records:', resp);
        if (!cancelled && Array.isArray(resp) && resp.length > 0) {
          const mapped: DisposalRecord[] = resp.map((r: any) => ({
            id: r.id ?? Math.floor(Math.random() * 100000),
            asset: r.asset?.assetName ?? r.asset?.assetTag ?? r.asset ?? r.assetName ?? 'Unknown Asset',
            method: r.method ?? r.disposalMethod ?? '',
            disposalDate: r.disposalDate ?? r.date ?? r.disposedAt ?? '',
            status: r.status ?? r.state ?? '',
            proceeds: Number(r.proceeds ?? r.amount ?? 0),
          }));
          setDisposals(mapped);
        }
      } catch (err: any) {
        console.warn('AssetDisposal: failed to load disposal records — using fallback dummies.', err?.message ?? err);
        setError(err?.message ?? 'Failed to fetch disposal records');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
              <Label htmlFor="asset">Asset</Label>
              <Input id="asset" placeholder="e.g., Old Printer" />
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Input id="method" placeholder="e.g., Auction / Scrap" />
            </div>
            <div>
              <Label htmlFor="date">Proposed Date</Label>
              <Input id="date" type="date" />
            </div>
          </div>
          <Button className="mt-4">Submit Disposal</Button>
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

export default AssetDisposal;
