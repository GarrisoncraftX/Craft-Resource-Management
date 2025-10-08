import { apiClient } from '../utils/apiClient';
import type { Department, Role, BudgetItem, Payslip } from '../types/api';
import type { Employee, UpdateEmployeeRequest } from '../types/hr';

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

function mapToFrontendBudget(budget: BudgetItem): BudgetItem {
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
    status: budget.status || 'On Track',
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

export async function fetchDepartments(): Promise<Department[]> {
  return apiClient.get('/api/lookup/departments');
}

export async function fetchRoles(): Promise<Role[]> {
  return apiClient.get('/api/lookup/roles');
}

export async function fetchEmployees(): Promise<Employee[]> {
  return apiClient.get('/hr/employees/list');
}

export async function fetchEmployeeById(id: string): Promise<Employee> {
  return apiClient.get(`/hr/employees/id/${id}`);
}

export async function updateEmployeeById(id: string, employee: UpdateEmployeeRequest): Promise<Employee> {
  return apiClient.put(`/hr/employees/id/${id}`, employee);
}

export async function uploadProfilePicture(id: string, file: File): Promise<Employee> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.put(`/hr/employees/id/${id}/profile-picture`, formData);
}

export async function createEmployee(employee: Partial<Employee>): Promise<Employee> {
  return apiClient.post('/hr/employees/register', employee);
}

export async function createBudget(budget: BudgetItem): Promise<BudgetItem> {
  const backendBudget = mapToBackendBudget(budget);
  const response = await apiClient.post('/finance/budgets', backendBudget);
  return mapToFrontendBudget(response);
}

export async function updateBudget(id: string | number, budget: BudgetItem): Promise<BudgetItem> {
  const backendBudget = mapToBackendBudget(budget);
  const response = await apiClient.put(`/finance/budgets/${id}`, backendBudget);
  return mapToFrontendBudget(response);
}

export async function deleteBudget(id: string | number): Promise<void> {
  return apiClient.delete(`/finance/budgets/${id}`);
}

export async function fetchPayslips(): Promise<Payslip[]> {
  return apiClient.get('/hr/payroll/payslips');
}

export type { Department, Role, BudgetItem, Employee, UpdateEmployeeRequest, Payslip };
