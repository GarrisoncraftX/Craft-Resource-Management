import { apiClient } from '@/utils/apiClient';
import type { BudgetItem, BudgetResponse, Budget, JournalEntry, AccountPayable, AccountReceivable, ChartOfAccount } from '@/types/javabackendapi/financeTypes';
import type { BudgetRequest as ApiBudgetRequest, Department } from '@/types/api';
import { fetchDepartments } from '@/services/nodejsbackendapi/lookupApi';

interface BudgetRequestPayload {
  id?: number;
  department?: string;
  departmentId?: number;
  department_id?: number;
  requestedAmount?: number;
  requested_amount?: number;
  justification?: string;
  status?: string;
  requestedDate?: string;
  request_date?: string;
  category?: string;
  requestedBy?: string;
  requested_by?: string;
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
  async createBudget(budget: Budget): Promise<BudgetResponse> {
    return apiClient.post('/finance/budgets', budget);
  }

  async getAllBudgets(): Promise<BudgetResponse[]> {
    return apiClient.get('/finance/budgets');
  }

  async getBudgetById(id: number): Promise<BudgetResponse> {
    return apiClient.get(`/finance/budgets/${id}`);
  }

  async updateBudget(id: number, budget: Budget): Promise<BudgetResponse> {
    return apiClient.put(`/finance/budgets/${id}`, budget);
  }

  async deleteBudget(id: number): Promise<void> {
    return apiClient.delete(`/finance/budgets/${id}`);
  }

  // Budget Request endpoints
  async createBudgetRequest(request: BudgetRequestPayload): Promise<BudgetRequestPayload> {
    return apiClient.post('/finance/budget-requests', request);
  }

  async getAllBudgetRequests(): Promise<BudgetRequestPayload[]> {
    return apiClient.get('/finance/budget-requests');
  }

  async getBudgetRequestById(id: number): Promise<BudgetRequestPayload> {
    return apiClient.get(`/finance/budget-requests/${id}`);
  }

  async updateBudgetRequest(id: number, request: BudgetRequestPayload): Promise<BudgetRequestPayload> {
    return apiClient.put(`/finance/budget-requests/${id}`, request);
  }

  async deleteBudgetRequest(id: number): Promise<void> {
    return apiClient.delete(`/finance/budget-requests/${id}`);
  }

  async approveBudgetRequest(id: number): Promise<BudgetRequestPayload> {
    return apiClient.patch(`/finance/budget-requests/${id}/approve`, {});
  }

  async rejectBudgetRequest(id: number): Promise<BudgetRequestPayload> {
    return apiClient.patch(`/finance/budget-requests/${id}/reject`, {});
  }

  async migrateApprovedRequests(): Promise<{message: string; count: number}> {
    return apiClient.post('/finance/budget-requests/migrate-approved', {});
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
// MAPPED BUDGET API FUNCTIONS
// ============================================================================
function calculateBudgetStatus(amount: number, spentAmount: number): 'On Track' | 'Warning' | 'Over Budget' {
  if (amount === 0) return 'On Track';
  if (spentAmount > amount) return 'Over Budget';
  return 'On Track';
}


// ============================================================================
// BUDGET MAPPING UTILITIES
// ============================================================================


function mapBudgetResponse(budget: BudgetResponse): BudgetItem {
  const amount = Number(budget.amount) || 0;
  const spentAmount = Number(budget.spentAmount) || 0;
  const remainingAmount = budget.remaining_amount !== undefined ? Number(budget.remaining_amount) : amount - spentAmount;
  
  return {
    id: budget.id?.toString() || '',
    amount,
    budgetName: budget.budgetName || budget.budget_name || '',
    departmentId: Number(budget.departmentId || budget.department_id) || 0,
    departmentName: '',
    description: budget.description || '',
    startDate: budget.startDate || budget.start_date || '',
    endDate: budget.endDate || budget.end_date || '',
    spentAmount,
    remainingAmount,
    budgetAmount: amount,
    remaining: remainingAmount,
    percentage: amount > 0 ? (spentAmount / amount) * 100 : 0,
    period: (budget.startDate || budget.start_date) && (budget.endDate || budget.end_date) ? `${budget.startDate || budget.start_date} to ${budget.endDate || budget.end_date}` : '',
    status: calculateBudgetStatus(amount, spentAmount),
    lastUpdated: new Date().toISOString().split('T')[0],
    category: budget.budgetName || budget.budget_name || 'General',
    department: (budget.departmentId || budget.department_id)?.toString() || '',
  };
}

export async function fetchBudgets(): Promise<BudgetItem[]> {
  const data = await financeApiService.getAllBudgets();
  const departments = await fetchDepartments();
  const deptMap = new Map(departments.map((d: Department) => [d.id?.toString(), d.name]));
  
  return data.map(budget => {
    const mapped = mapBudgetResponse(budget);
    mapped.departmentName = deptMap.get(mapped.departmentId?.toString()) || '';
    return mapped;
  });
}

export async function createBudgetItem(budget: Budget): Promise<BudgetItem> {
  const user = JSON.parse(localStorage.getItem('craft_user') || '{}');
  const currentYear = new Date().getFullYear();
  
  // Ensure amount is a valid number
  const amount = Number(budget.amount);
  if (!amount || amount <= 0) {
    throw new Error('Budget amount must be greater than zero');
  }
  
  const budgetWithCreator = {
    budgetName: budget.budgetName,
    description: budget.description,
    departmentId: budget.departmentId,
    fiscalYear: currentYear,
    startDate: budget.startDate,
    endDate: budget.endDate,
    totalAmount: amount,
    spentAmount: Number(budget.spentAmount) || 0,
    createdBy: user.id || 1
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await financeApiService.createBudget(budgetWithCreator as any);
  const mapped = mapBudgetResponse(response);
  const departments = await fetchDepartments();
  const deptMap = new Map(departments.map((d: Department) => [d.id?.toString(), d.name]));
  mapped.departmentName = deptMap.get(mapped.departmentId?.toString()) || '';
  return mapped;
}

export async function updateBudgetItem(id: string | number, budget: Budget): Promise<BudgetItem> {
  const response = await financeApiService.updateBudget(Number(id), budget);
  const mapped = mapBudgetResponse(response);
  const departments = await fetchDepartments();
  const deptMap = new Map(departments.map((d: Department) => [d.id?.toString(), d.name]));
  mapped.departmentName = deptMap.get(mapped.departmentId?.toString()) || '';
  return mapped;
}

export async function deleteBudgetItem(id: string | number): Promise<void> {
  return financeApiService.deleteBudget(Number(id));
}

export async function fetchBudgetRequests(): Promise<ApiBudgetRequest[]> {
  const data = await financeApiService.getAllBudgetRequests();
  const departments = await fetchDepartments();
  const deptMap = new Map(departments.map((d: Department) => [Number(d.id), d.name]));
  
  const result: ApiBudgetRequest[] = data.map((request: BudgetRequestPayload) => {
    const deptId = request.departmentId || request.department_id;
    const deptName = deptId ? deptMap.get(Number(deptId)) : request.department;
    
    return {
      id: request.id?.toString() || '',
      department: deptName || '',
      category: request.category || 'General',
      requestedAmount: Number(request.requestedAmount || request.requested_amount) || 0,
      justification: request.justification || '',
      status: (request.status || 'Pending') as 'Pending' | 'Approved' | 'Rejected',
      requestedBy: request.requestedBy || request.requested_by || 'Unknown',
      requestDate: request.requestedDate || request.request_date || new Date().toISOString().split('T')[0],
    };
  });
  
  return result;
}

export async function approveBudgetRequest(id: string | number): Promise<void> {
  await financeApiService.approveBudgetRequest(Number(id));
}

export async function rejectBudgetRequest(id: string | number): Promise<void> {
  await financeApiService.rejectBudgetRequest(Number(id));
}

export async function migrateApprovedBudgetRequests(): Promise<{message: string; count: number}> {
  return financeApiService.migrateApprovedRequests();
}
