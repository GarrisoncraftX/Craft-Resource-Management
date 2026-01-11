import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/hr';
import { Department, Role } from '@/types/api';
import { toast } from 'sonner';
import { fetchDepartments, fetchRoles, updateEmployeeById } from '@/services/api';
import { mockDepartments, mockRoles } from '@/services/mockData/mockData';

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSave: (employee: Employee) => void;
}

export const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  open,
  onOpenChange,
  employee,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [isRolesLoading, setIsRolesLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  // Fetch departments and roles from API
  useEffect(() => {
    const loadDepartments = async () => {
      setIsDepartmentsLoading(true);
      try {
        const response = await fetchDepartments();
        if (response?.length > 0) {
          setDepartments(response);
        } else {
          setDepartments(mockDepartments);
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setDepartments(mockDepartments);
      } finally {
        setIsDepartmentsLoading(false);
      }
    };

    const loadRoles = async () => {
      setIsRolesLoading(true);
      try {
        const response = await fetchRoles();
        if (response?.length > 0) {
          setRoles(response);
        } else {
          setRoles(mockRoles);
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setRoles(mockRoles);
      } finally {
        setIsRolesLoading(false);
      }
    };

    if (open) {
      loadDepartments();
      loadRoles();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedEmployee = await updateEmployeeById(employee?.id ?? '', formData);
      onSave(updatedEmployee);
      toast.success('Employee updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleChange = (field: keyof Employee, value: string | number) => {
    if (field === 'departmentId' || field === 'roleId' || field === 'isActive') {
      const parsedValue = Number(value);
      setFormData(prev => ({ ...prev, [field]: isNaN(parsedValue) ? 0 : parsedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update employee information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName || ''}
                onChange={(e) => handleChange('middleName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate || ''}
                onChange={(e) => handleChange('hireDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentId?.toString()}
                onValueChange={(value) => handleChange('departmentId', Number(value))}
                disabled={isDepartmentsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isDepartmentsLoading ? "Loading..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.roleId?.toString()}
                onValueChange={(value) => handleChange('roleId', Number(value))}
                disabled={isRolesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRolesLoading ? "Loading..." : "Select role"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary || ''}
                onChange={(e) => handleChange('salary', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.isActive?.toString()}
                onValueChange={(value) => handleChange('isActive', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
