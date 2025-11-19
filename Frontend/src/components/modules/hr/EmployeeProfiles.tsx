import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Edit, Eye, UserPlus } from 'lucide-react';
import { fetchEmployees } from '@/services/api';
import { lookupApiService } from '@/services/nodejsbackendapi/lookupApi';
import type { Employee } from '@/types/hr';
import type { Department, Role } from '@/types/api';
import { EditEmployeeDialog } from './EditEmployeeDialog';
import { ViewEmployeeDialog } from './ViewEmployeeDialog';
import { AddEmployeeForm } from './forms/AddEmployeeForm';

const mockEmployeeData = [
  { 
    id: 'EMP001', 
    name: 'John Doe', 
    position: 'Software Engineer', 
    department: 'IT', 
    status: 'Active', 
    hireDate: '2023-01-15',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    department_id: 3, 
    role_id: 5 
  },
  {
    id: 'EMP002',
    name: 'Jane Smith',
    position: 'HR Manager',
    department: 'Human Resources',
    status: 'Active',
    hireDate: '2022-03-20',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    department_id: 1,
    role_id: 9 
  },
  {
    id: 'EMP003',
    name: 'Mike Johnson',
    position: 'Finance Analyst',
    department: 'Finance',
    status: 'On Leave',
    hireDate: '2023-06-10',
    email: 'mike.johnson@company.com',
    phone: '+1 (555) 345-6789',
    department_id: 2, 
    role_id: 5 
  },
];

export const EmployeeProfiles: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesData, departmentsData, rolesData] = await Promise.all([
          fetchEmployees(),
          lookupApiService.getDepartments(),
          lookupApiService.getRoles()
        ]);
        setEmployees(employeesData);
        setDepartments(departmentsData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);

        setEmployees(mockEmployeeData.map(e => ({ 
          id: e.id, 
          tenantId: 0, 
          employeeId: e.id, 
          firstName: e.name.split(' ')[0], 
          lastName: e.name.split(' ')[1], 
          email: e.email,
          phone: e.phone,
          hireDate: e.hireDate, 
          departmentId: e.department_id.toString(),
          roleId: e.role_id.toString(),
          isActive: e.status === 'Active' ? 1: 0, 
          biometricEnrollmentStatus: 'NONE', 
          failedLoginAttempts: 0, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        })));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  console.log(employees);
  console.log(departments);
  console.log(roles);

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'N/A';
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'N/A';
  };

  const filteredEmployees = employees.filter(employee => {
    const departmentName = getDepartmentName(employee.departmentId);
    const roleName = getRoleName(employee.roleId);
    const search = searchTerm.toLowerCase();
    const firstName = employee.firstName || '';
    const lastName = employee.lastName || '';

    return `${firstName} ${lastName}`.toLowerCase().includes(search) ||
           employee.email.toLowerCase().includes(search) ||
           departmentName.toLowerCase().includes(search) ||
           roleName.toLowerCase().includes(search);
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.isActive === 1).length;
  const onLeave = totalEmployees - activeEmployees;
  const newHires = employees.filter(e => {
    if (!e.hireDate) return false;
    try {
      return new Date(e.hireDate) > new Date(new Date().setMonth(new Date().getMonth() - 1));
    } catch {
      return false;
    }
  }).length;

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleSaveEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    );
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Profiles</h1>
            <p className="text-muted-foreground">Manage employee information and profiles</p>
          </div>
          <Button 
            className="flex items-center gap-2 bg-green-500"
            onClick={() => setShowAddForm(true)}
          >
            <UserPlus className="h-4 w-4 font-bold" />
            Add Employee
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search Employees</CardTitle>
            <CardDescription>Find employees by name, role, or department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employee Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className='bg-blue-500 text-white'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
            </CardContent>
          </Card>

          <Card className='bg-green-500 text-white'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
            </CardContent>
          </Card>

          <Card className='bg-yellow-500 text-white'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires (This Month)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newHires}</div>
            </CardContent>
          </Card>

          <Card className='bg-red-500 text-white'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onLeave}</div>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Complete list of all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className='bg-blue-300 text-black font-bold'>
                <TableRow >
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`/avatars/${employee.employeeId}.jpg`} />
                          <AvatarFallback>{`${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{`${employee.firstName} ${employee.lastName}`.trim()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{getDepartmentName(employee.departmentId)}</TableCell>
                    <TableCell>{getRoleName(employee.roleId)}</TableCell>
                    <TableCell>
                      {(() => {
                        if (!employee.hireDate) return 'N/A';
                        try {
                          return new Date(employee.hireDate).toLocaleDateString();
                        } catch {
                          return 'Invalid Date';
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge className={employee.isActive === 1 ? 'bg-green-500' : 'bg-red-500'}>
                        {employee.isActive === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          className='hover:bg-blue-300 hover:text-white' 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewEmployee(employee)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          className='hover:bg-purple-300 hover:text-white' 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddEmployeeForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm}
      />
      
      <ViewEmployeeDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        employee={selectedEmployee}
        departments={departments}
        roles={roles}
      />

      <EditEmployeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />
    </div>
  );
};
