import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee } from '@/types/hr';
import { Department, Role } from '@/types/api';
import { Separator } from '@/components/ui/separator';

interface ViewEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  departments: Department[];
  roles: Role[];
}

export const ViewEmployeeDialog: React.FC<ViewEmployeeDialogProps> = ({
  open,
  onOpenChange,
  employee,
  departments,
  roles,
}) => {
  if (!employee) return null;

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find(d => Number(d.id) === departmentId);
    return department ? department.name : 'N/A';
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => Number(r.id) === roleId);
    return role ? role.name : 'N/A';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>Complete employee information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {employee.profilePictureUrl && <AvatarImage src={employee.profilePictureUrl} alt={`${employee.firstName} ${employee.lastName}`} />}
              <AvatarFallback className="text-xl">
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {employee.firstName} {employee.middleName} {employee.lastName}
              </h3>
              <p className="text-muted-foreground">{employee.employeeId}</p>
              <Badge className={employee.isActive === 1 ? 'bg-green-500 mt-2' : 'bg-red-500 mt-2'}>
                {employee.isActive === 1 ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-3">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{employee.phone || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{employee.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Employment Details */}
          <div>
            <h4 className="font-semibold mb-3">Employment Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{getDepartmentName(employee.departmentId)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Position</p>
                <p className="font-medium">{getRoleName(employee.roleId)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hire Date</p>
                <p className="font-medium">
                  {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {employee.salary && (
                <div>
                  <p className="text-muted-foreground">Salary</p>
                  <p className="font-medium">$ {employee.salary.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div>
            <h4 className="font-semibold mb-3">System Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created At</p>
                <p className="font-medium">{new Date(employee.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{new Date(employee.updatedAt).toLocaleString()}</p>
              </div>
              {employee.lastLogin && (
                <div>
                  <p className="text-muted-foreground">Last Login</p>
                  <p className="font-medium">{new Date(employee.lastLogin).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
