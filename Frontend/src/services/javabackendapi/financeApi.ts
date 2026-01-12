import { apiClient } from '@/utils/apiClient';
import type { BudgetItem, BudgetResponse, Budget, BudgetRequest, JournalEntry, AccountPayable, AccountReceivable, ChartOfAccount } from '@/types/javabackendapi/financeTypes';



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

// ============================================================================
// BUDGET MAPPING UTILITIES
// ============================================================================
function mapToBackendBudget(budget: BudgetItem) {
  return {
    id: budget.id,
    budgetName: budget.category,
    description: budget.description,
    departmentId: Number(budget.department),
    fiscal_year: budget.fiscal_year,
    start_date: budget.startDate,
    end_date: budget.endDate,
    total_amount: budget.total_amount,
    allocated_amount: budget.allocated_amount,
    spent_amount: budget.spentAmount,
    remaining_amount: budget.remaining_amount ?? budget.budgetAmount - budget.spentAmount,
    status: budget.status ?? 'On Track',
    amount: budget.budgetAmount,
    created_by: budget.created_by,
    approved_by: budget.approved_by,
    approved_at: budget.approved_at,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
  };
}

function mapToFrontendBudget(budget: BudgetResponse): BudgetItem {
  const budgetAmount = Number(budget.amount) || 0;
  const spentAmount = Number(budget.spentAmount) || 0;
  const remaining = budget.remaining_amount ?? budgetAmount - spentAmount;
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
  const period = budget.start_date && budget.end_date ? `${budget.start_date} to ${budget.end_date}` : '';
  const lastUpdated = budget.updated_at || '';

  return {
    id: budget.id?.toString() || '',
    department: budget.department_id ? budget.department_id.toString() : '',
    category: budget.budget_name || '',
    budgetAmount,
    spentAmount,
    remainingAmount: remaining,
    total_amount: budget.total_amount,
    allocated_amount: budget.allocated_amount,
    remaining,
    fiscal_year: budget.fiscal_year,
    description: budget.description || '',
    status: (budget.status as 'On Track' | 'Warning' | 'Over Budget') || 'On Track',
    created_by: budget.created_by,
    approved_by: budget.approved_by,
    approved_at: budget.approved_at,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
    startDate: budget.start_date || '',
    endDate: budget.end_date || '',
    percentage,
    period,
    lastUpdated,
  };
}

// ============================================================================
// WRAPPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================
export async function createBudgetItem(budget: BudgetItem): Promise<BudgetItem> {
  const backendBudget = mapToBackendBudget(budget);
  const response = await financeApiService.createBudget(backendBudget as unknown as Budget);
  return mapToFrontendBudget(response as BudgetResponse);
}

export async function updateBudgetItem(id: string | number, budget: BudgetItem): Promise<BudgetItem> {
  const backendBudget = mapToBackendBudget(budget);
  const response = await financeApiService.updateBudget(Number(id), backendBudget as unknown as Budget);
  return mapToFrontendBudget(response as BudgetResponse);
}

export async function deleteBudgetItem(id: string | number): Promise<void> {
  return financeApiService.deleteBudget(Number(id));
}
