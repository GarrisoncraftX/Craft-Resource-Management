// ============================================================================
// UNIFIED API EXPORTS
// This file re-exports all backend API services and their wrapper functions
// for backward compatibility. Import directly from specific backend API files
// for better tree-shaking and clearer dependencies.
// ============================================================================

// ============================================================================
// JAVA BACKEND API SERVICES
// ============================================================================
export { hrApiService } from '@/services/javabackendapi/hrApi';
export { financeApiService } from '@/services/javabackendapi/financeApi';
export { assetApiService } from '@/services/javabackendapi/assetApi';
export { legalApiService } from '@/services/javabackendapi/legalApi';
export { revenueApiService } from '@/services/javabackendapi/revenueApi';
export { systemApiService as javaSystemApiService } from '@/services/javabackendapi/systemApi';

// ============================================================================
// NODE.JS BACKEND API SERVICES
// ============================================================================
export { lookupApiService } from '@/services/nodejsbackendapi/lookupApi';

// ============================================================================
// PYTHON BACKEND API SERVICES
// ============================================================================
export { attendanceApiService } from '@/services/pythonbackendapi/attendanceApi';

// ============================================================================
// JAVA BACKEND - HR & PAYROLL WRAPPER FUNCTIONS
// ============================================================================
export {
  fetchEmployees,
  fetchEmployeeById,
  updateEmployeeById,
  uploadProfilePicture,
  createEmployee,
  fetchProvisionedEmployees,
  fetchPayslips,
  mapPayrollToUI
} from '@/services/javabackendapi/hrApi';

// ============================================================================
// JAVA BACKEND - FINANCE WRAPPER FUNCTIONS
// ============================================================================
export {
  createBudgetItem as createBudget,
  updateBudgetItem as updateBudget,
  deleteBudgetItem as deleteBudget
} from '@/services/javabackendapi/financeApi';

// ============================================================================
// JAVA BACKEND - ASSET WRAPPER FUNCTIONS
// ============================================================================
export {
  fetchAssets,
  fetchAssetById,
  createAssetRecord as createAsset,
  updateAssetRecord as updateAsset,
  deleteAssetRecord as deleteAsset,
  fetchMaintenanceRecords,
  createMaintenanceRecordItem as createMaintenanceRecord,
  updateMaintenanceRecordItem as updateMaintenanceRecord,
  deleteMaintenanceRecordItem as deleteMaintenanceRecord,
  fetchDisposalRecords,
  createDisposalRecordItem as createDisposalRecord,
  updateDisposalRecordItem as updateDisposalRecord,
  deleteDisposalRecordItem as deleteDisposalRecord,
  fetchAcquisitionRequests,
  submitAcquisitionRequestItem as submitAcquisitionRequest
} from '@/services/javabackendapi/assetApi';

// ============================================================================
// JAVA BACKEND - LEGAL WRAPPER FUNCTIONS
// ============================================================================
export {
  createLegalCaseRecord as createLegalCase,
  fetchLegalCases,
  updateLegalCaseRecord as updateLegalCase,
  deleteLegalCaseRecord as deleteLegalCase,
  fetchLegalCaseById,
  createComplianceRecordItem as createComplianceRecord,
  fetchComplianceRecords,
  fetchComplianceRecordById,
  updateComplianceRecordItem as updateComplianceRecord,
  deleteComplianceRecordItem as deleteComplianceRecord
} from '@/services/javabackendapi/legalApi';

// ============================================================================
// JAVA BACKEND - REVENUE WRAPPER FUNCTIONS
// ============================================================================
export {
  createTaxAssessmentRecord as createTaxAssessment,
  fetchTaxAssessments,
  fetchTaxAssessmentById,
  updateTaxAssessmentRecord as updateTaxAssessment,
  deleteTaxAssessmentRecord as deleteTaxAssessment,
  createRevenueCollectionRecord as createRevenueCollection,
  fetchRevenueCollections,
  fetchRevenueCollectionById,
  updateRevenueCollectionRecord as updateRevenueCollection,
  deleteRevenueCollectionRecord as deleteRevenueCollection
} from '@/services/javabackendapi/revenueApi';

// ============================================================================
// JAVA BACKEND - SYSTEM CONFIG WRAPPER FUNCTIONS
// ============================================================================
export {
  createSystem,
  fetchSystemByID,
  fetchSystem,
  updateSystem,
  deleteSystem,
  fetchRecentActivities
} from '@/services/javabackendapi/systemApi';

// ============================================================================
// NODE.JS BACKEND - LOOKUP WRAPPER FUNCTIONS
// ============================================================================
export {
  fetchDepartments,
  fetchRoles
} from '@/services/nodejsbackendapi/lookupApi';

// ============================================================================
// PYTHON BACKEND - ATTENDANCE WRAPPER FUNCTIONS
// ============================================================================
export {
  fetchAttendance,
  getManualFallbackAttendances,
  getAttendancesByMethod,
  flagAttendanceForAudit,
  getManualFallbacksByDateRange,
  getUserAttendanceByDateRange,
  getBuddyPunchReport,
  flagBuddyPunchRisk,
  getAttendanceMethodStatistics,
  reviewAttendance,
  mapAttendanceToUI
} from '@/services/pythonbackendapi/attendanceApi';

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type { Department, Role, BudgetItem, Payslip, AuditLog } from '@/types/api';
export type { Employee, UpdateEmployeeRequest } from '@/types/hr';
export type { Asset } from '@/types/asset';

