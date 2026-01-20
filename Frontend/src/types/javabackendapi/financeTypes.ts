export interface ChartOfAccount {
  id?: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  parentAccountId?: number;
  description?: string;
  isActive: boolean;
}

export interface Budget {
  id?: number;
  budgetName: string;
  amount: number;
  startDate: string;
  endDate: string;
  description?: string;
  departmentId: number;
  spentAmount: number;
  createdBy?: string;
}

export interface BudgetRequest {
  id?: number;
  departmentId: number;
  requestedAmount: number;
  justification: string;
  status: string;
  requestedDate: string;
}

export interface BudgetItem {
  id?: string;
  amount?: number;
  budgetName?: string;
  departmentId?: number;
  departmentName?: string;
  description?: string;
  endDate: string;
  remainingAmount: number;
  spentAmount: number;
  startDate: string;
  name?: string;
  department?: string;
  category?: string;
  budgetAmount?: number;
  remaining?: number;
  percentage?: number;
  period?: string;
  status?: 'On Track' | 'Warning' | 'Over Budget';
  lastUpdated?: string;
  budget_name?: string;
  start_date?: string;
  end_date?: string;
  department_id?: number;
  fiscal_year?: string;
  total_amount?: number;
  allocated_amount?: number;
  remaining_amount?: number;
  created_by?: number;
  approved_by?: number | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id?: number;
  entryDate: string;
  description: string;
  amount: number;
  accountCode: string;
  debit: number;
  credit: number;
  reference?: string;
  status: string;
}

export interface AccountPayable {
  id?: number;
  vendorName: string;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  category: string;
  paymentTerms: string;
  apAccountCode: string;
  expenseAccountCode: string;
  dueDate: string;
  status: string;
  description?: string;
}

export interface AccountReceivable {
  id?: number;
  customerName: string;
  issueDate: string;
  paymentTerms: string;
  amountPaid: number;
  arAccountCode: string;
  revenueAccountCode: string;
  balance: number;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  description?: string;
}

export interface BudgetResponse {
  id: number;
  budgetName: string;
  amount: number;
  startDate: string;
  endDate: string;
  description?: string;
  departmentId: number;
  spentAmount: number;
  budget_name?: string;
  start_date?: string;
  end_date?: string;
  department_id?: number;
  fiscal_year?: string;
  total_amount?: number;
  allocated_amount?: number;
  remaining_amount?: number;
  status?: string;
  created_by?: number;
  approved_by?: number | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

