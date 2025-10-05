import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/utils/apiClient';
import { mockDepartments, mockRoles } from '@/services/mockData';
import type { Department, Role } from '@/types/api';
import { Eye, EyeOff } from 'lucide-react';

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
    employeeId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    roleId: '',
    nationalId: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    hireDate: '',
    salary: '',
    bankAccountNumber: '',
    momoNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [isRolesLoading, setIsRolesLoading] = useState(false);

  // Fetch departments and roles from API
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsDepartmentsLoading(true);
      try {
        const response = await apiClient.get('/api/lookup/departments');
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

    const fetchRoles = async () => {
      setIsRolesLoading(true);
      try {
        const response = await apiClient.get('/api/lookup/roles');
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
      fetchDepartments();
      fetchRoles();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        employeeId: formData.employeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        password: formData.password,
        departmentId: Number(formData.departmentId),
        roleId: Number(formData.roleId),
        nationalId: formData.nationalId,
        phoneNumber: formData.phoneNumber,
        phone: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        hireDate: formData.hireDate,
        salary: formData.salary ? Number(formData.salary) : undefined,
        bankAccountNumber: formData.bankAccountNumber,
        momoNumber: formData.momoNumber,
      };

      await apiClient.post('/api/auth/register', payload);
      
      toast({
        title: "Success",
        description: "Employee added successfully!"
      });
      
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        employeeId: '',
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: '',
        confirmPassword: '',
        departmentId: '',
        roleId: '',
        nationalId: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        hireDate: '',
        salary: '',
        bankAccountNumber: '',
        momoNumber: '',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter complete details for the new employee
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Employee ID and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                placeholder="Enter Employee ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* National ID and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                placeholder="National ID number"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Residential address"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            />
          </div>

          {/* Department and Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={formData.departmentId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
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
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.roleId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
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
          </div>

          {/* Hire Date and Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                placeholder="Annual salary"
              />
            </div>
          </div>

          {/* Bank Account and Momo Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
              <Input
                id="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                placeholder="Bank account number"
              />
            </div>
            <div>
              <Label htmlFor="momoNumber">Mobile Money Number</Label>
              <Input
                id="momoNumber"
                value={formData.momoNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, momoNumber: e.target.value }))}
                placeholder="Mobile money number"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding Employee...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};