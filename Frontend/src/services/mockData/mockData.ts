import { Account, Invoice } from '@/types/api';

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

export const mockDashboardKPIs = {
  leaveBalance: 15,
  nextPayrollDate: '2024-07-15',
  pendingTasks: 7,
};

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

export const financialReportsData = [
  {
    id: '1',
    reportName: 'Profit and Loss Statement',
    period: 'Q1 2024',
    generatedOn: '2024-04-01',
    status: 'Completed',
  },
  {
    id: '2',
    reportName: 'Balance Sheet',
    period: 'Q1 2024',
    generatedOn: '2024-04-01',
    status: 'Completed',
  },
  {
    id: '3',
    reportName: 'Cash Flow Statement',
    period: 'Q1 2024',
    generatedOn: '2024-04-01',
    status: 'In Progress',
  },
];

export const mockAccountData: Account[] = [
  { id: '1', accountCode: '1000', accountName: 'Cash', accountType: 'Asset', description: 'Physical and bank cash balances', category: 'Current Assets', status: 'Active' },
  { id: '2', accountCode: '1200', accountName: 'Accounts Receivable', accountType: 'Asset', description: 'Amounts due from customers', category: 'Current Assets', status: 'Active' },
  { id: '3', accountCode: '2000', accountName: 'Accounts Payable', accountType: 'Liability', description: 'Amounts due to vendors', category: 'Current Liabilities', status: 'Active' },
  { id: '4', accountCode: '3000', accountName: 'Capital', accountType: 'Equity', description: 'Owner equity', category: "Owner's Equity", status: 'Active' },
  { id: '5', accountCode: '4000', accountName: 'Sales Revenue', accountType: 'Revenue', description: 'Revenue from sales', category: 'Operating Revenue', status: 'Active' },
  { id: '6', accountCode: '5000', accountName: 'Office Expenses', accountType: 'Expense', description: 'Administrative expenses', category: 'Operating Expenses', status: 'Active' },
];

export const chartOfAccountsData = [
  { name: 'Assets', value: 5 },
  { name: 'Liabilities', value: 3 },
  { name: 'Equity', value: 2 },
  { name: 'Revenue', value: 6 },
  { name: 'Expense', value: 8 },
];

export const budgetManagementData = [
  { name: 'Marketing', budget: 4000, spent: 2400 },
  { name: 'R&D', budget: 3000, spent: 1398 },
  { name: 'Operations', budget: 2000, spent: 980 },
  { name: 'Sales', budget: 2780, spent: 3908 },
  { name: 'HR', budget: 1890, spent: 4800 },
];

export const mockBudgetItems = [
    {
      id: '1',
      department: 'IT',
      category: 'Software & Licenses',
      budgetAmount: 50000,
      spentAmount: 35000,
      remaining: 15000,
      percentage: 70,
      period: 'Q1 2024',
      status: 'Warning',
      lastUpdated: '2024-01-15',
    },
    {
      id: '2',
      department: 'HR',
      category: 'Training & Development',
      budgetAmount: 25000,
      spentAmount: 18000,
      remaining: 7000,
      percentage: 72,
      status: 'Warning',
      period: 'Q1 2024',
      lastUpdated: '2024-01-12',
    },
    {
      id: '3',
      department: 'Marketing',
      category: 'Advertising',
      budgetAmount: 30000,
      spentAmount: 22000,
      remaining: 8000,
      percentage: 73,
      status: 'On Track',
      period: 'Q1 2024',
      lastUpdated: '2024-01-10',
    },
  ]

  export const mockBudgetRequest = [
    {
      id: '1',
      department: 'IT',
      category: 'Hardware Upgrade',
      requestedAmount: 15000,
      justification: 'Need to upgrade server infrastructure for better performance',
      status: 'Pending',
      requestedBy: 'John Doe',
      requestDate: '2024-01-20',
    },
    {
      id: '2',
      department: 'Marketing',
      category: 'Digital Marketing',
      requestedAmount: 8000,
      justification: 'Additional budget for Q2 marketing campaign',
      status: 'Approved',
      requestedBy: 'Jane Smith',
      requestDate: '2024-01-18',
    },
  ]

export const journalEntriesData = [
  { date: '2024-06-01', debit: 4000, credit: 2400 },
  { date: '2024-06-02', debit: 3000, credit: 1398 },
  { date: '2024-06-03', debit: 2000, credit: 980 },
  { date: '2024-06-04', debit: 2780, credit: 3908 },
  { date: '2024-06-05', debit: 1890, credit: 4800 },
];

export const accountsPayableData = [
  { name: 'Vendor A', amount: 4000 },
  { name: 'Vendor B', amount: 3000 },
  { name: 'Vendor C', amount: 2000 },
  { name: 'Vendor D', amount: 2780 },
  { name: 'Vendor E', amount: 1890 },
];

export const accountsReceivableData = [
  { name: 'Customer A', amount: 2400 },
  { name: 'Customer B', amount: 1398 },
  { name: 'Customer C', amount: 980 },
  { name: 'Customer D', amount: 3908 },
  { name: 'Customer E', amount: 4800 },
];

export const mockInvoice: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      vendor: 'Office Supplies Co.',
      amount: 1250.00,
      dueDate: '2024-02-15',
      status: 'Pending',
      description: 'Office supplies and stationery',
      issueDate: '2024-01-15',
      category: 'Office Expenses',
      paymentTerms: 'Net 30',
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      vendor: 'Tech Solutions Inc.',
      amount: 5000.00,
      dueDate: '2024-02-20',
      status: 'Approved',
      description: 'Software licensing and support',
      issueDate: '2024-01-20',
      category: 'IT Services',
      paymentTerms: 'Net 30',
      approvedBy: 'Jane Manager',
    },
    {
      id: '3',
      invoiceNumber: 'INV-003',
      vendor: 'Utilities Corp.',
      amount: 850.00,
      dueDate: '2024-02-05',
      status: 'Overdue',
      description: 'Monthly electricity bill',
      issueDate: '2024-01-05',
      category: 'Utilities',
      paymentTerms: 'Net 15',
    },
  ];
