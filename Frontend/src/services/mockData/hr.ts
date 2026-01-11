// Mock data for HR module

export const mockMonthlyPerformance = [
  { month: 'Jan', avgRating: 4.2 },
  { month: 'Feb', avgRating: 4.3 },
  { month: 'Mar', avgRating: 4.1 },
  { month: 'Apr', avgRating: 4.4 },
  { month: 'May', avgRating: 4.5 },
  { month: 'Jun', avgRating: 4.6 },
];

export const mockKpiData = [
  { subject: 'Quality', A: 85, fullMark: 100 },
  { subject: 'Productivity', A: 90, fullMark: 100 },
  { subject: 'Communication', A: 78, fullMark: 100 },
  { subject: 'Teamwork', A: 88, fullMark: 100 },
  { subject: 'Innovation', A: 82, fullMark: 100 },
];

export const mockMonthlyTraining = [
  { month: 'Jan', enrollments: 12, completions: 8 },
  { month: 'Feb', enrollments: 15, completions: 10 },
  { month: 'Mar', enrollments: 18, completions: 14 },
  { month: 'Apr', enrollments: 20, completions: 16 },
  { month: 'May', enrollments: 22, completions: 18 },
  { month: 'Jun', enrollments: 25, completions: 20 },
];

export const mockDepartments = [
  { id: 'FINANCE', name: 'Finance' },
  { id: 'HR', name: 'Human Resources' },
  { id: 'PROCUREMENT', name: 'Procurement' },
  { id: 'LEGAL', name: 'Legal Affairs' },
  { id: 'PLANNING', name: 'Planning & Development' },
  { id: 'TRANSPORTATION', name: 'Transportation' },
  { id: 'HEALTH_SAFETY', name: 'Health & Safety' },
  { id: 'PUBLIC_RELATIONS', name: 'Public Relations' },
  { id: 'REVENUE_TAX', name: 'Revenue & Tax' },
];

export const mockRoles = [
  { id: 'EMPLOYEE', name: 'Employee' },
  { id: 'SUPERVISOR', name: 'Supervisor' },
  { id: 'MANAGER', name: 'Manager' },
  { id: 'ADMIN', name: 'System Admin' },
  { id: 'FINANCE_OFFICER', name: 'Finance Officer' },
  { id: 'HR_OFFICER', name: 'HR Officer' },
  { id: 'PROCUREMENT_OFFICER', name: 'Procurement Officer' },
];

export const mockEmployees = [
  'John Doe - Finance',
  'Jane Smith - HR',
  'Bob Johnson - Procurement',
  'Alice Brown - Legal',
  'Charlie Wilson - Planning',
];

export const mockIdCards = [
  {
    cardId: 'CARD12345',
    firstName: 'John',
    lastName: 'Doe',
    employeeId: 'EMP001',
    email: 'john.doe@example.com',
    department: 'FINANCE',
    nationalId: 'NID123456789',
    phoneNumber: '555-1234',
  },
  {
    cardId: 'CARD67890',
    firstName: 'Jane',
    lastName: 'Smith',
    employeeId: 'EMP002',
    email: 'jane.smith@example.com',
    department: 'HR',
    nationalId: 'NID987654321',
    phoneNumber: '555-5678',
  },
];

export const mockAttendanceHistory = [
  { date: '2024-06-01', checkIn: '08:30', checkOut: '17:15', totalHours: '8.75', status: 'Present', clock_in_method: 'QR Code', clock_out_method: 'QR Code' },
  { date: '2024-05-31', checkIn: '08:45', checkOut: '17:30', totalHours: '8.75', status: 'Present', clock_in_method: 'QR Code', clock_out_method: 'QR Code' },
  { date: '2024-05-30', checkIn: '-', checkOut: '-', totalHours: '0', status: 'Sick Leave', clock_in_method: undefined, clock_out_method: undefined },
];

export const mockLeaveApplications = [
  { leaveId: 'LV001', leaveType: 'Sick Leave', startDate: '2024-05-30', endDate: '2024-05-30', days: 1, status: 'Approved', reason: 'Medical appointment' },
  { leaveId: 'LV002', leaveType: 'Annual Leave', startDate: '2024-05-15', endDate: '2024-05-17', days: 3, status: 'Approved', reason: 'Personal vacation' },
];

export const mockPayrollHistory = [
  { period: 'May 2024', basicSalary: '$5,416.67', allowances: '$500.00', overtime: '$156.25', deductions: '$350.00', netPay: '$5,722.92', status: 'Processed' },
  { period: 'April 2024', basicSalary: '$5,416.67', allowances: '$500.00', overtime: '$125.00', deductions: '$350.00', netPay: '$5,691.67', status: 'Processed' },
];

export const mockDashboardKPIs = {
  totalRevenue: 245320,
  totalExpenses: 89450,
  netProfit: 155870,
  pendingInvoices: 23,
  pendingInvoicesValue: 45230,
  leaveBalance: 15
};
