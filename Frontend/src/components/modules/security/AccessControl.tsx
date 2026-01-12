import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { securityApiService, type AccessRule } from '@/services/javabackendapi/securityApi';
import { mockAccessRules } from '@/services/mockData/security';
import { useToast } from '@/hooks/use-toast';

export const AccessControl: React.FC = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ role: '', door: '', schedule: '', status: 'Enabled' });

  useEffect(() => {
    loadAccessRules();
  }, []);

  const loadAccessRules = async () => {
    try {
      setIsLoading(true);
      const data = await securityApiService.getAccessRules();
      setRules(data);
    } catch (error) {
      console.warn('Failed to load access rules from API, using mock data:', error);
      setRules(mockAccessRules);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await securityApiService.createAccessRule(formData);
      toast({ title: 'Success', description: 'Access rule created successfully' });
      setIsDialogOpen(false);
      setFormData({ role: '', door: '', schedule: '', status: 'Enabled' });
      loadAccessRules();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create access rule', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Access Control</h2>
          <p className="text-muted-foreground">Configure access rules and schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Access Rule</DialogTitle>
                <DialogDescription>Define a new access control rule</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="door">Door/Area</Label>
                  <Input id="door" value={formData.door} onChange={(e) => setFormData({ ...formData, door: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input id="schedule" placeholder="e.g., 09:00-18:00" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enabled">Enabled</SelectItem>
                      <SelectItem value="Disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Rule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Rules</CardTitle>
          <CardDescription>Role-based door access ({rules.length})</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Door</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.id}</TableCell>
                    <TableCell>{r.role}</TableCell>
                    <TableCell>{r.door}</TableCell>
                    <TableCell>{r.schedule}</TableCell>
                    <TableCell>{r.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControl;
