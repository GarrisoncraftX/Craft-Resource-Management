/* eslint-disable @typescript-eslint/no-explicit-any */
import { lookupApiService } from '@/services/nodejsbackendapi/lookupApi';
import { systemApiService } from '@/services/nodejsbackendapi/systemApi';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { financeApiService } from '@/services/javabackendapi/financeApi';
import { assetApiService } from '@/services/javabackendapi/assetApi';
import { legalApiService } from '@/services/javabackendapi/legalApi';
import { revenueApiService } from '@/services/javabackendapi/revenueApi';
import { systemApiService as javaSystemApiService } from '@/services/javabackendapi/systemApi';
import { attendanceApiService } from '@/services/pythonbackendapi/attendanceApi';
import type { Department, Role, BudgetItem, Payslip, AuditLog } from '../types/api';
import type { Employee, UpdateEmployeeRequest } from '../types/hr';
import type { Asset } from '@/types/asset';

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



// HR Employee endpoints (Java Backend)
export async function fetchEmployees(): Promise<Employee[]> {
  return hrApiService.listEmployees() as any;
}

export async function fetchEmployeeById(id: string): Promise<Employee> {
  return hrApiService.getEmployeeById(Number(id)) as any;
}

export async function updateEmployeeById(id: string, employee: UpdateEmployeeRequest): Promise<Employee> {
  return hrApiService.updateEmployee(Number(id), employee as any) as any;
}

export async function uploadProfilePicture(id: string, file: File): Promise<Employee> {
  await hrApiService.updateProfilePicture(Number(id), file);
  return hrApiService.getEmployeeById(Number(id)) as any;
}

export async function createEmployee(employee: Partial<Employee>): Promise<Employee> {
  return hrApiService.registerEmployee(employee as any) as any;
}

export async function fetchProvisionedEmployees(): Promise<any[]> {
  return hrApiService.getProvisionedEmployees();
}

// Finance Budget endpoints (Java Backend)
export async function createBudget(budget: BudgetItem): Promise<BudgetItem> {
  const backendBudget = mapToBackendBudget(budget);
  const response = await financeApiService.createBudget(backendBudget as any);
  return mapToFrontendBudget(response as any);
}

export async function updateBudget(id: string | number, budget: BudgetItem): Promise<BudgetItem> {
  const backendBudget = mapToBackendBudget(budget);
  const response = await financeApiService.updateBudget(Number(id), backendBudget as any);
  return mapToFrontendBudget(response as any);
}

export async function deleteBudget(id: string | number): Promise<void> {
  return financeApiService.deleteBudget(Number(id));
}

// Payroll endpoints (Java Backend)
export async function fetchPayslips(userId?: string): Promise<Payslip[]> {
  if (userId) {
    return hrApiService.getPayslipsByUser(Number(userId)) as any;
  }
  return hrApiService.getAllPayslips() as any;
}

// Attendance endpoints (Python Backend)
export async function fetchAttendance(userId: string): Promise<any[]> {
  return attendanceApiService.getAttendanceRecords({ user_id: userId });
}

export async function getManualFallbackAttendances(): Promise<any[]> {
  return attendanceApiService.getManualFallbackAttendances();
}

export async function getAttendancesByMethod(method: string): Promise<any[]> {
  return attendanceApiService.getAttendancesByMethod(method);
}

export async function flagAttendanceForAudit(attendanceId: number, auditNotes: string): Promise<any> {
  return attendanceApiService.flagAttendanceForAudit(attendanceId, auditNotes);
}

export async function getManualFallbacksByDateRange(startDate: string, endDate: string): Promise<any[]> {
  return attendanceApiService.getManualFallbacksByDateRange(startDate, endDate);
}

export async function getUserAttendanceByDateRange(userId: number, startDate: string, endDate: string): Promise<any[]> {
  return attendanceApiService.getUserAttendanceByDateRange(userId, startDate, endDate);
}

export async function getBuddyPunchReport(): Promise<any> {
  return attendanceApiService.getBuddyPunchReport();
}

export async function flagBuddyPunchRisk(attendanceId: number, reason: string): Promise<any> {
  return attendanceApiService.flagBuddyPunchRisk(attendanceId, reason);
}

export async function getAttendanceMethodStatistics(): Promise<any> {
  return attendanceApiService.getAttendanceMethodStatistics();
}

export async function reviewAttendance(attendanceId: number, hrUserId: number, notes: string): Promise<any> {
  return attendanceApiService.reviewAttendance(attendanceId, hrUserId, notes);
}

export const mapAttendanceToUI = (attendanceData: any[]) => {
  console.log('Raw attendance data:', attendanceData); // Debug log
  return attendanceData.map((record: any) => {
    console.log('Processing record:', record); // Debug log
    // Create date objects and format them to avoid timezone issues
    const clockInDate = record.clock_in_time ? new Date(record.clock_in_time) : null;
    const clockOutDate = record.clock_out_time ? new Date(record.clock_out_time) : null;
    
    // Format time without timezone conversion
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC' 
      });
    };
    
    const mappedRecord = {
      date: clockInDate ? clockInDate.toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'N/A',
      checkIn: clockInDate ? formatTime(clockInDate) : '-',
      checkOut: clockOutDate ? formatTime(clockOutDate) : '-',
      totalHours: record.total_hours ? Number(record.total_hours).toFixed(2) : '0.00',
      status: clockOutDate ? 'Present' : 'Incomplete',
      clock_in_method: record.clock_in_method || 'N/A',
      clock_out_method: record.clock_out_method || 'N/A'
    };
    
    console.log('Mapped record:', mappedRecord); 
    return mappedRecord;
  });
};

export const mapPayrollToUI = (payrollData: Payslip[]) => {
  return payrollData.map((payslip: Payslip) => ({
    period: `${new Date(payslip.payPeriodStart).toLocaleDateString()} - ${new Date(payslip.payPeriodEnd).toLocaleDateString()}`,
    basicSalary: `$${(payslip.grossPay * 0.8).toFixed(2)}`, 
    allowances: '$500.00', // Placeholder - can be calculated from actual allowances if available
    overtime: '$156.25', // Placeholder - can be calculated from actual overtime if available
    deductions: `$${(payslip.taxDeductions + payslip.otherDeductions).toFixed(2)}`,
    netPay: `$${payslip.netPay.toFixed(2)}`,
    status: payslip.payrollRun?.status === 'COMPLETED' ? 'Processed' : 'Pending'
  }));
};

// Asset endpoints (Java Backend)
export async function fetchAssets(): Promise<Asset[]> {
  return assetApiService.getAllAssets() as any;
}

export async function fetchAssetById(id: number | string): Promise<Asset> {
  return assetApiService.getAssetById(Number(id)) as any;
}

export async function createAsset(asset: Partial<Asset>): Promise<Asset> {
  return assetApiService.createAsset(asset as any) as any;
}

export async function updateAsset(id: number | string, asset: Partial<Asset>): Promise<Asset> {
  return assetApiService.updateAsset(Number(id), asset as any) as any;
}

export async function deleteAsset(id: number | string): Promise<void> {
  return assetApiService.deleteAsset(Number(id));
}

export async function fetchMaintenanceRecords() {
  return assetApiService.getAllMaintenanceRecords();
}

export async function createMaintenanceRecord(record: unknown) {
  return assetApiService.createMaintenanceRecord(record as any);
}

export async function updateMaintenanceRecord(id: number | string, record: unknown) {
  return assetApiService.updateMaintenanceRecord(Number(id), record as any);
}

export async function deleteMaintenanceRecord(id: number | string) {
  return assetApiService.deleteMaintenanceRecord(Number(id));
}

export async function fetchDisposalRecords() {
  return assetApiService.getAllDisposalRecords();
}

export async function createDisposalRecord(record: unknown) {
  return assetApiService.createDisposalRecord(record as any);
}

export async function updateDisposalRecord(id: number | string, record: unknown) {
  return assetApiService.updateDisposalRecord(Number(id), record as any);
}

export async function deleteDisposalRecord(id: number | string) {
  return assetApiService.deleteDisposalRecord(Number(id));
}

export async function fetchAcquisitionRequests() {
  return assetApiService.getAcquisitionRequests();
}

export async function submitAcquisitionRequest(request: unknown) {
  return assetApiService.submitAcquisitionRequest(request);
}

// Legal endpoints (Java Backend)
export async function createLegalCase(record: any) {
  return legalApiService.createLegalCase(record);
}

export async function fetchLegalCases() {
  return legalApiService.getAllLegalCases();
}

export async function updateLegalCase(id: number | string, record: any) {
  return legalApiService.updateLegalCase(Number(id), record);
}

export async function deleteLegalCase(id: number | string) {
  return legalApiService.deleteLegalCase(Number(id));
}

export async function fetchLegalCaseById(id: number | string) {
  return legalApiService.getLegalCaseById(Number(id));
}

export async function createComplianceRecord(record: any) {
  return legalApiService.createComplianceRecord(record);
}

export async function fetchComplianceRecords() {
  return legalApiService.getAllComplianceRecords();
}

export async function fetchComplianceRecordById(id: number | string) {
  return legalApiService.getComplianceRecordById(Number(id));
}

export async function updateComplianceRecord(id: number | string, record: any) {
  return legalApiService.updateComplianceRecord(Number(id), record);
}

export async function deleteComplianceRecord(id: number | string) {
  return legalApiService.deleteComplianceRecord(Number(id));
}

// Revenue endpoints (Java Backend)
export async function createTaxAssessment(record: any) {
  return revenueApiService.createTaxAssessment(record);
}

export async function fetchTaxAssessments() {
  return revenueApiService.getAllTaxAssessments();
}

export async function fetchTaxAssessmentById(id: number | string) {
  return revenueApiService.getTaxAssessmentById(Number(id));
}

export async function updateTaxAssessment(id: number | string, record: any) {
  return revenueApiService.updateTaxAssessment(Number(id), record);
}

export async function deleteTaxAssessment(id: number | string) {
  return revenueApiService.deleteTaxAssessment(Number(id));
}

export async function createRevenueCollection(record: any) {
  return revenueApiService.createRevenueCollection(record);
}

export async function fetchRevenueCollections() {
  return revenueApiService.getAllRevenueCollections();
}

export async function fetchRevenueCollectionById(id: number | string) {
  return revenueApiService.getRevenueCollectionById(Number(id));
}

export async function updateRevenueCollection(id: number | string, record: any) {
  return revenueApiService.updateRevenueCollection(Number(id), record);
}

export async function deleteRevenueCollection(id: number | string) {
  return revenueApiService.deleteRevenueCollection(Number(id));
}

// System Config endpoints (Java Backend)
export async function createSystem(record: any) {
  return javaSystemApiService.createSystemConfig(record);
}

export async function fetchSystemByID(id: number | string) {
  return javaSystemApiService.getSystemConfigById(Number(id));
}

export async function fetchSystem() {
  return javaSystemApiService.getAllSystemConfigs();
}

export async function updateSystem(id: number | string, record: any) {
  return javaSystemApiService.updateSystemConfig(Number(id), record);
}

export async function deleteSystem(id: number | string) {
  return javaSystemApiService.deleteSystemConfig(Number(id));
}

// Lookup endpoints (Node.js Backend)
export async function fetchDepartments(): Promise<Department[]> {
  return lookupApiService.getDepartments();
}

export async function fetchRoles(): Promise<Role[]> {
  return lookupApiService.getRoles();
}

// Audit Log endpoints (Node.js Backend)
export async function fetchRecentActivities(userId: string): Promise<AuditLog[]> {
  return systemApiService.getRecentActivities(userId) as any;
}

export { Department, Role, BudgetItem, Employee, UpdateEmployeeRequest, Payslip, AuditLog };
