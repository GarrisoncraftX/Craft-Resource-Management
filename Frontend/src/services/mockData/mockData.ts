import { Account, Invoice } from '@/types/api';

export const mockFinanceDashboardKPIs = {
  totalRevenue: 245320,
  totalExpenses: 89450,
  netProfit: 155870,
  pendingInvoices: 23,
  pendingInvoicesValue: 45230
};



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
      amount: 1250,
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
      amount: 5000,
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
      amount: 850,
      dueDate: '2024-02-05',
      status: 'Overdue',
      description: 'Monthly electricity bill',
      issueDate: '2024-01-05',
      category: 'Utilities',
      paymentTerms: 'Net 15',
    },
  ];


export const mockDashboardBudgets = [
  { department: 'HR', allocated: 50000, spent: 35000, remaining: 15000 },
  { department: 'IT', allocated: 75000, spent: 68000, remaining: 7000 },
  { department: 'Marketing', allocated: 30000, spent: 22000, remaining: 8000 },
];

export const mockDashboardTransactions = [
  { id: '001', date: '2024-01-15', description: 'Office Supplies', amount: -1250, type: 'Expense' as const },
  { id: '002', date: '2024-01-14', description: 'Client Payment', amount: 5000, type: 'Revenue' as const },
  { id: '003', date: '2024-01-13', description: 'Utilities', amount: -800, type: 'Expense' as const },
];



export const mockCustomerInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customer: 'ABC Corporation',
    amount: 15000,
    dueDate: '2024-02-15',
    status: 'Sent' as const,
    description: 'Professional services - Q1 2024',
    issueDate: '2024-01-15',
    amountPaid: 0,
    balance: 15000,
    paymentTerms: 'Net 30',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customer: 'XYZ Industries',
    amount: 25000,
    dueDate: '2024-02-20',
    status: 'Partial' as const,
    description: 'Equipment rental - January 2024',
    issueDate: '2024-01-20',
    amountPaid: 10000,
    balance: 15000,
    paymentTerms: 'Net 30',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    customer: 'Tech Solutions Ltd',
    amount: 8500,
    dueDate: '2024-02-05',
    status: 'Overdue' as const,
    description: 'Software development services',
    issueDate: '2024-01-05',
    amountPaid: 0,
    balance: 8500,
    paymentTerms: 'Net 15',
  },
];

