import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { fetchAcquisitionRequests, submitAcquisitionRequest } from '@/services/api';
import { mockAcquisitionRequests } from '@/services/mockData/assets';


export const AssetAcquisition: React.FC = () => {
  const [requests, setRequests] = useState<any[]>(mockAcquisitionRequests);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [item, setItem] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchAcquisitionRequests();
        console.log('Fetched acquisition requests:', resp);
        if (!cancelled && Array.isArray(resp) && resp.length > 0) {
          const mapped = resp.map((r: unknown) => {
            const record = r as Record<string, unknown>;
            return {
              id: record.id as string ?? `AQ-${Math.floor(Math.random() * 1000)}`,
              item: record.item as string ?? '',
              department: record.department as string ?? '',
              amount: record.amount as number ?? 0,
              status: record.status as string ?? 'Pending',
              requestedBy: record.requestedBy as string ?? '',
              date: record.date as string ?? '',
            };
          });
          setRequests(mapped);
        }
      } catch (err) {
        console.warn('AssetAcquisition: failed to fetch requests — using fallback mockdata.', err instanceof Error ? err.message : err);
        setError(err instanceof Error ? err.message : 'Failed to fetch acquisition requests');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmitRequest = async () => {
    const payload = {
      item: item || undefined,
      department: department || undefined,
      amount: amount ? Number(amount) : undefined,
    };

    if (!payload.item || !payload.department || !payload.amount) {
      setError('Item, Department, and Amount are required');
      return;
    }

    try {
      const created = await submitAcquisitionRequest(payload) as unknown as Record<string, unknown>;
      const newRequest = {
        id: created?.id as string ?? `AQ-${Math.floor(Math.random() * 1000)}`,
        item: created?.item as string ?? payload.item,
        department: created?.department as string ?? payload.department,
        amount: created?.amount as number ?? payload.amount,
        status: created?.status as string ?? 'Pending',
        requestedBy: created?.requestedBy as string ?? 'Current User',
        date: created?.date as string ?? new Date().toISOString().split('T')[0],
      };
      setRequests(prev => [newRequest, ...prev]);
      setError(null);
    } catch (err) {
      console.warn('AssetAcquisition: submit failed; adding locally as fallback.', err instanceof Error ? err.message : err);
      const local = {
        id: `AQ-${Math.floor(Math.random() * 1000)}`,
        item: payload.item,
        department: payload.department,
        amount: payload.amount,
        status: 'Pending',
        requestedBy: 'Current User',
        date: new Date().toISOString().split('T')[0],
      };
      setRequests(prev => [local, ...prev]);
      setError(err instanceof Error ? err.message : 'Failed to submit request (saved locally)');
    } finally {
      setItem('');
      setDepartment('');
      setAmount('');
    }
  };

  if (loading) return <div className="p-6">Loading acquisition requests…</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Asset Acquisition</CardTitle>
          <CardDescription>Submit a request to purchase new assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="item">Item</Label>
              <Input id="item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g., Laptops (10)" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., IT" />
            </div>
            <div>
              <Label htmlFor="amount">Estimated Amount</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleSubmitRequest}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
            {error && <div className="text-sm text-yellow-600">{error}</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acquisition Requests</CardTitle>
          <CardDescription>Track acquisition requests and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.item}</TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell>${r.amount.toLocaleString()}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.requestedBy}</TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetAcquisition;
