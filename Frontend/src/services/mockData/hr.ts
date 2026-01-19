export const mockEmployeeData = [
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

export const mockAttendanceHistory: Array<{
  clock_in_time: string;
  clock_out_time: string;
  total_hours: number;
  clock_in_method: string;
  clock_out_method: string;
}> = [
  {
    clock_in_time: '2024-01-15T08:00:00Z',
    clock_out_time: '2024-01-15T17:00:00Z',
    total_hours: 9,
    clock_in_method: 'QR Code',
    clock_out_method: 'Face Recognition'
  },
  {
    clock_in_time: '2024-01-14T08:15:00Z',
    clock_out_time: '2024-01-14T17:30:00Z',
    total_hours: 9.25,
    clock_in_method: 'Face Recognition',
    clock_out_method: 'QR Code'
  }
];

export const mockDashboardKPIs: { leaveBalance: number; attendance: number; overtime: number; lastPay: number; nextPayrollDate: string; pendingTasks: number } = {
  leaveBalance: 15,
  attendance: 95,
  overtime: 12.5,
  lastPay: 5722.92,
  nextPayrollDate: '2024-02-15',
  pendingTasks: 3
};

export const mockPayrollHistory = [
  {
    period: 'January 2024',
    basicSalary: '$5,000.00',
    allowances: '$500.00',
    overtime: '$222.92',
    deductions: '$0.00',
    netPay: '$5,722.92',
    status: 'Paid'
  },
  {
    period: 'December 2023',
    basicSalary: '$5,000.00',
    allowances: '$500.00',
    overtime: '$150.00',
    deductions: '$0.00',
    netPay: '$5,650.00',
    status: 'Paid'
  }
];

export const mockDepartments = [
  { id: '1', name: 'Human Resources' },
  { id: '2', name: 'Finance' },
  { id: '3', name: 'IT' },
  { id: '4', name: 'Operations' },
  { id: '5', name: 'Sales' }
];

export const mockRoles = [
  { id: '1', name: 'Manager' },
  { id: '2', name: 'Team Lead' },
  { id: '3', name: 'Senior' },
  { id: '4', name: 'Junior' },
  { id: '5', name: 'Analyst' }
];

export const mockMonthlyTraining = [
  { month: 'Jan', enrollments: 45, completions: 38 },
  { month: 'Feb', enrollments: 52, completions: 45 },
  { month: 'Mar', enrollments: 48, completions: 42 },
  { month: 'Apr', enrollments: 61, completions: 55 },
  { month: 'May', enrollments: 55, completions: 48 },
  { month: 'Jun', enrollments: 67, completions: 60 }
];

export const mockMonthlyPerformance = [
  { month: 'Jan', avgRating: 4.2 },
  { month: 'Feb', avgRating: 4.1 },
  { month: 'Mar', avgRating: 4.3 },
  { month: 'Apr', avgRating: 4.0 },
  { month: 'May', avgRating: 4.4 },
  { month: 'Jun', avgRating: 4.2 }
];

export const mockKpiData = [
  { subject: 'Productivity', A: 85 },
  { subject: 'Quality', A: 78 },
  { subject: 'Efficiency', A: 92 },
  { subject: 'Innovation', A: 67 },
  { subject: 'Teamwork', A: 89 },
  { subject: 'Communication', A: 74 }
];
