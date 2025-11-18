import { apiClient } from '@/utils/apiClient';

// Types for Finance API
export interface ChartOfAccount {
  id?: number;
  accountCode: string;
  accountName: string;
  accountType: string;
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
  spentAmount?: number;
}

export interface BudgetRequest {
  id?: number;
  departmentId: number;
  requestedAmount: number;
  justification: string;
  status: string;
  requestedDate: string;
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
  vendorId: number;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  description?: string;
}

export interface AccountReceivable {
  id?: number;
  customerId: number;
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
}

class FinanceApiService {
  // Chart of Account endpoints
  async createChartOfAccount(coa: ChartOfAccount): Promise<ChartOfAccount> {
    return apiClient.post('/finance/accounts', coa);
  }

  async getAllChartOfAccounts(): Promise<ChartOfAccount[]> {
    return apiClient.get('/finance/accounts');
  }

  async getChartOfAccountById(id: number): Promise<ChartOfAccount> {
    return apiClient.get(`/finance/accounts/${id}`);
  }

  async updateChartOfAccount(id: number, coa: ChartOfAccount): Promise<ChartOfAccount> {
    return apiClient.put(`/finance/accounts/${id}`, coa);
  }

  async deleteChartOfAccount(id: number): Promise<void> {
    return apiClient.delete(`/finance/accounts/${id}`);
  }

  // Budget endpoints (from FinanceController)
  async createBudget(budget: Budget): Promise<Budget> {
    return apiClient.post('/finance/budgets', budget);
  }

  async getAllBudgets(): Promise<BudgetResponse[]> {
    return apiClient.get('/finance/budgets');
  }

  async getBudgetById(id: number): Promise<Budget> {
    return apiClient.get(`/finance/budgets/${id}`);
  }

  async updateBudget(id: number, budget: Budget): Promise<Budget> {
    return apiClient.put(`/finance/budgets/${id}`, budget);
  }

  async deleteBudget(id: number): Promise<void> {
    return apiClient.delete(`/finance/budgets/${id}`);
  }

  // Budget endpoints (from BudgetController)
  async createBudgetAlt(budget: Budget): Promise<Budget> {
    return apiClient.post('/api/budgets', budget);
  }

  async getAllBudgetsAlt(): Promise<BudgetResponse[]> {
    return apiClient.get('/api/budgets');
  }

  async getBudgetByIdAlt(id: number): Promise<BudgetResponse> {
    return apiClient.get(`/api/budgets/${id}`);
  }

  async updateBudgetAlt(id: number, budget: Budget): Promise<Budget> {
    return apiClient.put(`/api/budgets/${id}`, budget);
  }

  async deleteBudgetAlt(id: number): Promise<void> {
    return apiClient.delete(`/api/budgets/${id}`);
  }

  // Budget Request endpoints
  async createBudgetRequest(request: BudgetRequest): Promise<BudgetRequest> {
    return apiClient.post('/finance/budget-requests', request);
  }

  async getAllBudgetRequests(): Promise<BudgetRequest[]> {
    return apiClient.get('/finance/budget-requests');
  }

  async getBudgetRequestById(id: number): Promise<BudgetRequest> {
    return apiClient.get(`/finance/budget-requests/${id}`);
  }

  async updateBudgetRequest(id: number, request: BudgetRequest): Promise<BudgetRequest> {
    return apiClient.put(`/finance/budget-requests/${id}`, request);
  }

  async deleteBudgetRequest(id: number): Promise<void> {
    return apiClient.delete(`/finance/budget-requests/${id}`);
  }

  // Journal Entry endpoints
  async createJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
    return apiClient.post('/finance/journal-entries', entry);
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return apiClient.get('/finance/journal-entries');
  }

  async getJournalEntryById(id: number): Promise<JournalEntry> {
    return apiClient.get(`/finance/journal-entries/${id}`);
  }

  async updateJournalEntry(id: number, entry: JournalEntry): Promise<JournalEntry> {
    return apiClient.put(`/finance/journal-entries/${id}`, entry);
  }

  async deleteJournalEntry(id: number): Promise<void> {
    return apiClient.delete(`/finance/journal-entries/${id}`);
  }

  // Journal Entry endpoints (from JournalEntryController)
  async createJournalEntryAlt(entry: JournalEntry): Promise<JournalEntry> {
    return apiClient.post('/api/journal-entries', entry);
  }

  async getAllJournalEntriesAlt(): Promise<JournalEntry[]> {
    return apiClient.get('/api/journal-entries');
  }

  async getJournalEntryByIdAlt(id: number): Promise<JournalEntry> {
    return apiClient.get(`/api/journal-entries/${id}`);
  }

  async updateJournalEntryAlt(id: number, entry: JournalEntry): Promise<JournalEntry> {
    return apiClient.put(`/api/journal-entries/${id}`, entry);
  }

  async deleteJournalEntryAlt(id: number): Promise<void> {
    return apiClient.delete(`/api/journal-entries/${id}`);
  }

  // Account Payable endpoints
  async createAccountPayable(ap: AccountPayable): Promise<AccountPayable> {
    return apiClient.post('/finance/account-payables', ap);
  }

  async getAllAccountPayables(): Promise<AccountPayable[]> {
    return apiClient.get('/finance/account-payables');
  }

  async getAccountPayableById(id: number): Promise<AccountPayable> {
    return apiClient.get(`/finance/account-payables/${id}`);
  }

  async updateAccountPayable(id: number, ap: AccountPayable): Promise<AccountPayable> {
    return apiClient.put(`/finance/account-payables/${id}`, ap);
  }

  async deleteAccountPayable(id: number): Promise<void> {
    return apiClient.delete(`/finance/account-payables/${id}`);
  }

  // Account Receivable endpoints
  async createAccountReceivable(ar: AccountReceivable): Promise<AccountReceivable> {
    return apiClient.post('/finance/account-receivables', ar);
  }

  async getAllAccountReceivables(): Promise<AccountReceivable[]> {
    return apiClient.get('/finance/account-receivables');
  }

  async getAccountReceivableById(id: number): Promise<AccountReceivable> {
    return apiClient.get(`/finance/account-receivables/${id}`);
  }

  async updateAccountReceivable(id: number, ar: AccountReceivable): Promise<AccountReceivable> {
    return apiClient.put(`/finance/account-receivables/${id}`, ar);
  }

  async deleteAccountReceivable(id: number): Promise<void> {
    return apiClient.delete(`/finance/account-receivables/${id}`);
  }
}

export const financeApiService = new FinanceApiService();
