import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { fetchDepartments, fetchRoles } from '@/services/api';
import { apiClient } from '@/utils/apiClient';
import { mockDepartments, mockRoles } from '@/services/mockData/hr';
import type { Department, Role } from '@/types/api';


interface AddEmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    jobGradeId: '3',
    roleId: '',
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [jobGrades] = useState([
    { id: 1, name: 'G1 - Entry Level' },
    { id: 2, name: 'G2 - Junior' },
    { id: 3, name: 'G3 - Mid Level' },
    { id: 4, name: 'G4 - Senior' },
    { id: 5, name: 'G5 - Manager' }
  ]);

  useEffect(() => {
    if (open) {
      fetchDepartments().then(setDepartments).catch(() => setDepartments(mockDepartments));
      fetchRoles().then(setRoles).catch(() => setRoles(mockRoles));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/api/auth/hr/create-employee', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        departmentId: Number(formData.departmentId),
        jobGradeId: Number(formData.jobGradeId),
        roleId: Number(formData.roleId),
      });

      toast({
        title: "Success",
        description: `Employee ${response.employeeId} created! Credentials sent to ${formData.email}`
      });

      onSuccess?.();
      onOpenChange(false);
      setFormData({ firstName: '', lastName: '', email: '', departmentId: '', jobGradeId: '3', roleId: '' });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: "Error",
        description: err.message || "Failed to create employee",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register New Employee</DialogTitle>
          <DialogDescription>
            Employee ID will be auto-generated. Default password (CRMSemp123!) will be emailed.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} required />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} required />
            </div>
          </div>

          <div>
            <Label>Email *</Label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Department *</Label>
              <Select value={formData.departmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role *</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((role) => <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Job Grade *</Label>
            <Select value={formData.jobGradeId} onValueChange={(value) => setFormData(prev => ({ ...prev, jobGradeId: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {jobGrades.map((grade) => <SelectItem key={grade.id} value={grade.id.toString()}>{grade.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};