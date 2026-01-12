import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, CheckCircle, XCircle } from 'lucide-react';
import { planningApiService } from '@/services/nodejsbackendapi/planningApi';
import { PolicyFormDialog } from './PolicyFormDialog';
import { toast } from '@/hooks/use-toast';

export function PolicyManagement() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await planningApiService.getPolicies();
      setPolicies(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load policies', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (policy: any) => {
    try {
      await planningApiService.createPolicy(policy);
      toast({ title: 'Success', description: 'Policy created successfully' });
      loadPolicies();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create policy', variant: 'destructive' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await planningApiService.approvePolicy(id);
      toast({ title: 'Success', description: 'Policy approved' });
      loadPolicies();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve policy', variant: 'destructive' });
    }
  };

  const handleRepeal = async (id: string) => {
    try {
      await planningApiService.repealPolicy(id);
      toast({ title: 'Success', description: 'Policy repealed' });
      loadPolicies();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to repeal policy', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Policy Management</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                  <TableCell>{policy.title}</TableCell>
                  <TableCell>{policy.category}</TableCell>
                  <TableCell>
                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                      {policy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{policy.effectiveDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {policy.status === 'draft' && (
                        <Button size="sm" onClick={() => handleApprove(policy.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {policy.status === 'active' && (
                        <Button size="sm" variant="destructive" onClick={() => handleRepeal(policy.id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Repeal
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <PolicyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleCreate} />
    </Card>
  );
}
