/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '../utils/apiClient';
import { lookupApiService } from '@/services/nodejsbackendapi/lookupApi';
import type { Department, Role, BudgetItem, Payslip, AuditLog } from '../types/api';
import type { Employee, UpdateEmployeeRequest } from '../types/hr';
import type { Asset, AssetStatistics } from '@/types/asset';

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

export async function fetchPayslips(userId?: string): Promise<Payslip[]> {
  if (userId) {
    return apiClient.get(`/hr/payroll/payslips/user/${userId}`);
  }
  return apiClient.get('/hr/payroll/payslips');
}

export async function fetchAttendance(userId: string): Promise<any[]> {
  return apiClient.get(`/attendance/user/${userId}`);
}

// Helper functions to map backend data to UI format
export const mapAttendanceToUI = (attendanceData: any[]) => {
  return attendanceData.map((record: any) => ({
    date: record.clockInTime ? new Date(record.clockInTime).toLocaleDateString() : 'N/A',
    checkIn: record.clockInTime ? new Date(record.clockInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
    checkOut: record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
    totalHours: record.clockInTime && record.clockOutTime
      ? ((new Date(record.clockOutTime).getTime() - new Date(record.clockInTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
      : '0.00',
    status: record.clockOutTime ? 'Present' : 'Incomplete'
  }));
};

export const mapPayrollToUI = (payrollData: Payslip[]) => {
  return payrollData.map((payslip: Payslip) => ({
    period: `${new Date(payslip.payPeriodStart).toLocaleDateString()} - ${new Date(payslip.payPeriodEnd).toLocaleDateString()}`,
    basicSalary: `$${(payslip.grossPay * 0.8).toFixed(2)}`, // Assuming 80% is basic salary
    allowances: '$500.00', // Placeholder - can be calculated from actual allowances if available
    overtime: '$156.25', // Placeholder - can be calculated from actual overtime if available
    deductions: `$${(payslip.taxDeductions + payslip.otherDeductions).toFixed(2)}`,
    netPay: `$${payslip.netPay.toFixed(2)}`,
    status: payslip.payrollRun?.status === 'COMPLETED' ? 'Processed' : 'Pending'
  }));
};

// Integrate Asset endpoints implemented in Java AssetController (@RequestMapping("/assets")).
// We call '/assets' so the API Gateway forwards to Java backend. Keep these functions alongside other services.

// Fetch all assets from backend (GET /assets).
// If gateway rewrites or expects /api prefix adjust accordingly (this project proxies non-/api by default to java backend).
export async function fetchAssets(): Promise<Asset[]> {
  return apiClient.get('/assets');
}

// Fetch single asset by id (GET /assets/{id})
export async function fetchAssetById(id: number | string): Promise<Asset> {
  return apiClient.get(`/assets/${id}`);
}

// Create / Update / Delete wrappers
export async function createAsset(asset: Partial<Asset>): Promise<Asset> {
  return apiClient.post('/assets', asset);
}
export async function updateAsset(id: number | string, asset: Partial<Asset>): Promise<Asset> {
  return apiClient.put(`/assets/${id}`, asset);
}
export async function deleteAsset(id: number | string): Promise<void> {
  await apiClient.delete(`/assets/${id}`);
}

// MaintenanceRecord endpoints (Java controller: /assets/maintenance-records)
export async function fetchMaintenanceRecords() {
  return apiClient.get('/assets/maintenance-records');
}
export async function createMaintenanceRecord(record: unknown) {
  return apiClient.post('/assets/maintenance-records', record);
}
export async function updateMaintenanceRecord(id: number | string, record: unknown) {
  return apiClient.put(`/assets/maintenance-records/${id}`, record);
}
export async function deleteMaintenanceRecord(id: number | string) {
  return apiClient.delete(`/assets/maintenance-records/${id}`);
}

// DisposalRecord endpoints (Java controller: /assets/disposal-records)
export async function fetchDisposalRecords() {
  return apiClient.get('/assets/disposal-records');
}
export async function createDisposalRecord(record: unknown) {
  return apiClient.post('/assets/disposal-records', record);
}
export async function updateDisposalRecord(id: number | string, record: unknown) {
  return apiClient.put(`/assets/disposal-records/${id}`, record);
}
export async function deleteDisposalRecord(id: number | string) {
  return apiClient.delete(`/assets/disposal-records/${id}`);
}

// Acquisition endpoints (placeholder - add actual backend when ready)
export async function fetchAcquisitionRequests() {
  return apiClient.get('/assets/acquisition-requests');
}

export async function submitAcquisitionRequest(request: unknown) {
  return apiClient.post('/assets/acquisition-requests', request);
}


//LegalCase endpoints (Java controller: /legal/cases)
export async function createLegalCase(record: any){
  return apiClient.post('/legal/cases', record);
}

export async function fetchLegalCases() {
  return apiClient.get('/legal/cases');
}
export async function updateLegalCase(id: number | string, record: any) {
  return apiClient.put(`/legal/cases/${id}`, record);
}
export async function deleteLegalCase(id: number | string) {
  return apiClient.delete(`/legal/cases/${id}`);
}

export async function fetchLegalCaseById(id: number | string) {
  return apiClient.get(`/legal/cases/${id}`);
}

// ComplianceRecord endpoints (Java controller: /legal/compliance-records)
export async function createComplianceRecord(record: any) {
  return apiClient.post('/legal/compliance-records', record);
}

export async function fetchComplianceRecords() {
  return apiClient.get('/legal/compliance-records');
}
export async function fetchComplianceRecordById(id: number | string) {
  return apiClient.get(`/legal/compliance-records/${id}`);
}

export async function updateComplianceRecord(id: number | string, record: any) {
  return apiClient.put(`/legal/compliance-records/${id}`, record);
}

export async function deleteComplianceRecord(id: number | string) {
  return apiClient.delete(`/legal/compliance-records/${id}`);
}

//TaxAssessment endpoints (Java controller: /tax/assessments)
export async function createTaxAssessment(record: any) {
  return apiClient.post('/revenue/tax-assessments', record);
}

export async function fetchTaxAssessments() {
  return apiClient.get('/revenue/tax-assessments');
}

export async function fetchTaxAssessmentById(id: number | string) {
  return apiClient.get(`/revenue/tax-assessments/${id}`);
}

export async function updateTaxAssessment(id: number | string, record: any) {
  return apiClient.put(`/revenue/tax-assessments/${id}`, record);
}

export async function deleteTaxAssessment(id: number | string) {
  return apiClient.delete(`/revenue/tax-assessments/${id}`);
}

//RevenueCollection endpoints (Java controller: /revenue/revenue-collections)
export async function createRevenueCollection(record: any) {
  return apiClient.post('/revenue/revenue-collections', record);
}

export async function fetchRevenueCollections() {
  return apiClient.get('/revenue/revenue-collections');
}


export async function fetchRevenueCollectionById(id: number | string) {
  return apiClient.get(`/revenue/revenue-collections/${id}`);
}
export async function updateRevenueCollection(id: number | string, record: any) {
  return apiClient.put(`/revenue/revenue-collections/${id}`, record);
}
export async function deleteRevenueCollection(id: number | string) {
  return apiClient.delete(`/revenue/revenue-collections/${id}`);
}

// SystemConfig endpoints
export async function createSystem(record: any) {
  return apiClient.post('/configs', record);
}
export async function fetchSystemByID(id: number | string) {
  return apiClient.get(`/configs/${id}`);
}

export async function fetchSystem(){
  return apiClient.get('/configs'); 
}
export async function updateSystem(id: number | string, record: any) {
  return apiClient.put(`/configs/${id}`, record);
}

export async function deleteSystem(id: number | string) {
  return apiClient.delete(`/configs/${id}`);
}


export async function fetchDepartments(): Promise<Department[]> {
  return lookupApiService.getDepartments();
}

export async function fetchRoles(): Promise<Role[]> {
  return lookupApiService.getRoles();
}

export async function fetchRecentActivities(userId: string): Promise<AuditLog[]> {
  return apiClient.get(`/system/audit-logs/user/${userId}/recent`);
}

export { Department, Role, BudgetItem, Employee, UpdateEmployeeRequest, Payslip, AuditLog };
