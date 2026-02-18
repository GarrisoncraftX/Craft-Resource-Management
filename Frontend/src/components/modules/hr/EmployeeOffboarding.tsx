import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { initiateOffboarding, getAllOffboarding, updateOffboarding, completeOffboarding } from '@/services/javabackendapi/hrApi';
import { fetchEmployees } from '@/services/api';
import { integrationService } from '@/services/integration/CrossModuleIntegration';
import type { EmployeeOffboarding as OffboardingType } from '@/types/javabackendapi/hrTypes';
import type { Employee } from '@/types/hr';
import { useAuth } from '@/contexts/AuthContext';

export const EmployeeOffboarding: React.FC = () => {
  const { user } = useAuth();
  const [offboardings, setOffboardings] = useState<OffboardingType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffboarding, setSelectedOffboarding] = useState<OffboardingType | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<Map<number, string>>(new Map());
  const [formData, setFormData] = useState<Partial<OffboardingType>>({
    userId: 0,
    offboardingType: 'RESIGNATION',
    status: 'NOTICE_PERIOD',
    exitInterviewScheduled: false,
    assetsReturned: false,
    clearanceCompleted: false,
    finalSettlementPaid: false,
    accessRevoked: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [offboardingData, employeeData] = await Promise.all([
        getAllOffboarding(),
        fetchEmployees()
      ]);
      setOffboardings(offboardingData);
      setEmployees(employeeData);
    } catch {
      toast.error('Failed to load offboarding data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedOffboarding) {
        await updateOffboarding(selectedOffboarding.id!, formData);
        toast.success('Offboarding updated successfully');
      } else {
        await initiateOffboarding(formData);
        toast.success('Offboarding initiated successfully');
      }
      setDialogOpen(false);
      setSelectedOffboarding(null);
      setFormData({
        userId: 0,
        offboardingType: 'RESIGNATION',
        status: 'NOTICE_PERIOD',
        exitInterviewScheduled: false,
        assetsReturned: false,
        clearanceCompleted: false,
        finalSettlementPaid: false,
        accessRevoked: false
      });
      loadData();
    } catch {
      toast.error('Failed to save offboarding');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const offboarding = offboardings.find(o => o.id === id);
      const employee = employees.find(e => Number(e.id) === offboarding?.userId);

      if (offboarding && employee && user) {
        // Emit offboarding completed event to trigger asset returns and access revocation
        const correlationId = integrationService.initiateEmployeeOffboarding(
          {
            employeeId: offboarding.userId,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            offboardingType: offboarding.offboardingType as any,
            exitDate: offboarding.lastWorkingDate || new Date().toISOString(),
            assetsToReturn: [], // Would be populated from assets module
            accessToRevoke: [], // Would be populated from security module
          },
          user.id
        );

        setIntegrationStatus(new Map(integrationStatus).set(id, `Offboarding initiated: ${correlationId}`));
      }

      await completeOffboarding(id);
      toast.success('Offboarding completed and cross-module events triggered');
      loadData();
    } catch (error) {
      toast.error('Failed to complete offboarding');
      console.error('[v0] Offboarding completion error:', error);
    }
  };

  const handleEdit = (offboarding: OffboardingType) => {
    setSelectedOffboarding(offboarding);
    setFormData(offboarding);
    setDialogOpen(true);
  };

  const getEmployeeName = (userId: number) => {
    const emp = employees.find(e => Number(e.id) === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOTICE_PERIOD': return 'secondary';
      case 'IN_PROGRESS': return 'default';
      case 'COMPLETED': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Offboarding</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedOffboarding(null); setFormData({ userId: 0, offboardingType: 'RESIGNATION', status: 'NOTICE_PERIOD' }); }}>
              <Plus className="h-4 w-4 mr-2" />
              Initiate Offboarding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedOffboarding ? 'Update Offboarding' : 'Initiate Offboarding'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Employee</Label>
                <Select value={String(formData.userId)} onValueChange={(v) => setFormData({ ...formData, userId: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto z-50">
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium text-sm">{emp.firstName} {emp.lastName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Offboarding Type</Label>
                <Select value={formData.offboardingType} onValueChange={(v: 'RESIGNATION' | 'TERMINATION' | 'RETIREMENT' | 'CONTRACT_END') => setFormData({ ...formData, offboardingType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIGNATION">Resignation</SelectItem>
                    <SelectItem value="TERMINATION">Termination</SelectItem>
                    <SelectItem value="RETIREMENT">Retirement</SelectItem>
                    <SelectItem value="CONTRACT_END">Contract End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Resignation Date</Label>
                <Input type="date" value={formData.resignationDate || ''} onChange={(e) => setFormData({ ...formData, resignationDate: e.target.value })} />
              </div>
              <div>
                <Label>Last Working Date</Label>
                <Input type="date" value={formData.lastWorkingDate || ''} onChange={(e) => setFormData({ ...formData, lastWorkingDate: e.target.value })} />
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea value={formData.reason || ''} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v: 'NOTICE_PERIOD' | 'IN_PROGRESS' | 'COMPLETED') => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTICE_PERIOD">Notice Period</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={formData.exitInterviewScheduled} onCheckedChange={(c) => setFormData({ ...formData, exitInterviewScheduled: Boolean(c) })} />
                  <Label>Exit Interview Scheduled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={formData.assetsReturned} onCheckedChange={(c) => setFormData({ ...formData, assetsReturned: Boolean(c) })} />
                  <Label>Assets Returned</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={formData.clearanceCompleted} onCheckedChange={(c) => setFormData({ ...formData, clearanceCompleted: Boolean(c) })} />
                  <Label>Clearance Completed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={formData.finalSettlementPaid} onCheckedChange={(c) => setFormData({ ...formData, finalSettlementPaid: Boolean(c) })} />
                  <Label>Final Settlement Paid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={formData.accessRevoked} onCheckedChange={(c) => setFormData({ ...formData, accessRevoked: Boolean(c) })} />
                  <Label>Access Revoked</Label>
                </div>
              </div>
              <div>
                <Label>Final Settlement Amount</Label>
                <Input type="number" value={formData.finalSettlementAmount || ''} onChange={(e) => setFormData({ ...formData, finalSettlementAmount: Number(e.target.value) })} />
              </div>
              <Button type="submit" className="w-full">{selectedOffboarding ? 'Update' : 'Initiate'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5" />
            Offboarding Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Working Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offboardings.map((offboarding) => (
                  <TableRow key={offboarding.id}>
                    <TableCell className="font-medium">{getEmployeeName(offboarding.userId)}</TableCell>
                    <TableCell>{offboarding.offboardingType}</TableCell>
                    <TableCell>{offboarding.lastWorkingDate || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(offboarding.status)}>{offboarding.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {offboarding.exitInterviewScheduled && '✓ Interview '}
                        {offboarding.assetsReturned && '✓ Assets '}
                        {offboarding.clearanceCompleted && '✓ Clearance '}
                        {offboarding.accessRevoked && '✓ Access'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(offboarding)}>Edit</Button>
                        {offboarding.status !== 'COMPLETED' && (
                          <Button size="sm" onClick={() => handleComplete(offboarding.id!)}>Complete</Button>
                        )}
                      </div>
                    </TableCell>
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
