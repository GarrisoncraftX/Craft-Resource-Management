import { apiClient } from '@/utils/apiClient';
import type {
  User,
  UpdateEmployeeRequest,
  BiometricData,
  PayrollRun,
  Payslip,
  BenefitPlan,
  EmployeeBenefit,
  TrainingCourse,
  EmployeeTraining,
  PerformanceReview,
  ProvisionedEmployee
} from '@/types/javabackendapi/hrTypes';

class HrApiService {
  // Employee endpoints
  async registerEmployee(user: User): Promise<User> {
    return apiClient.post('/hr/employees/register', user);
  }

  async listEmployees(): Promise<User[]> {
    return apiClient.get('/hr/employees/list');
  }

  async getEmployeeById(id: number): Promise<User> {
    return apiClient.get(`/hr/employees/id/${id}`);
  }

  async updateEmployee(id: number, request: UpdateEmployeeRequest): Promise<User> {
    return apiClient.put(`/hr/employees/id/${id}`, request);
  }

  async updateProfilePicture(id: number, file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    await apiClient.put(`/hr/employees/id/${id}/profile-picture`, formData);
    return this.getEmployeeById(id);
  }

  // Attendance endpoints
  async clockIn(employeeId: string): Promise<{ message: string }> {
    return apiClient.post('/attendance/clock-in', { employeeId });
  }

  async clockOut(employeeId: string): Promise<{ message: string }> {
    return apiClient.post('/attendance/clock-out', { employeeId });
  }

  async biometricClockIn(employeeId: string, biometricData: BiometricData): Promise<{ message: string }> {
    return apiClient.post('/attendance/biometric-clock-in', { employeeId, biometricData });
  }

  async biometricClockOut(employeeId: string, biometricData: BiometricData): Promise<{ message: string }> {
    return apiClient.post('/attendance/biometric-clock-out', { employeeId, biometricData });
  }

  async getAttendanceByUser(userId: number): Promise<{ id: number; employeeId: string; clockInTime: string; clockOutTime?: string; date: string }[]> {
    return apiClient.get(`/attendance/user/${userId}`);
  }

  // Dashboard endpoints
  async getDashboardKpis(employeeId: number): Promise<{ totalHours: number; attendanceRate: number; leaveBalance: number }> {
    return apiClient.get(`/hr/dashboard-kpis/${employeeId}`);
  }

  // Payroll endpoints
  async createPayrollRun(payrollRun: PayrollRun): Promise<PayrollRun> {
    return apiClient.post('/hr/payroll/runs', payrollRun);
  }

  async getAllPayrollRuns(): Promise<PayrollRun[]> {
    try {
      return await apiClient.get('/hr/payroll/runs');
    } catch (error) {
      console.warn('Failed to fetch payroll runs from database, using empty array as fallback:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getPayrollRunById(id: number): Promise<PayrollRun> {
    return apiClient.get(`/hr/payroll/runs/${id}`);
  }

  async updatePayrollRun(id: number, payrollRun: PayrollRun): Promise<PayrollRun> {
    return apiClient.put(`/hr/payroll/runs/${id}`, payrollRun);
  }

  async deletePayrollRun(id: number): Promise<void> {
    return apiClient.delete(`/hr/payroll/runs/${id}`);
  }

  // Payslip endpoints
  async createPayslip(payslip: Payslip): Promise<Payslip> {
    return apiClient.post('/hr/payroll/payslips', payslip);
  }

  async getAllPayslips(): Promise<Payslip[]> {
    try {
      return await apiClient.get('/hr/payroll/payslips');
    } catch (error) {
      console.warn('Failed to fetch payslips from database, using empty array as fallback:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getPayslipById(id: number): Promise<Payslip> {
    return apiClient.get(`/hr/payroll/payslips/${id}`);
  }

  async updatePayslip(id: number, payslip: Payslip): Promise<Payslip> {
    return apiClient.put(`/hr/payroll/payslips/${id}`, payslip);
  }

  async deletePayslip(id: number): Promise<void> {
    return apiClient.delete(`/hr/payroll/payslips/${id}`);
  }

  // BenefitPlan endpoints
  async createBenefitPlan(benefitPlan: BenefitPlan): Promise<BenefitPlan> {
    return apiClient.post('/hr/payroll/benefit-plans', benefitPlan);
  }

  async getAllBenefitPlans(): Promise<BenefitPlan[]> {
    try {
      return await apiClient.get('/hr/payroll/benefit-plans');
    } catch (error) {
      console.warn('Failed to fetch benefit plans from database, using empty array as fallback:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getBenefitPlanById(id: number): Promise<BenefitPlan> {
    return apiClient.get(`/hr/payroll/benefit-plans/${id}`);
  }

  async updateBenefitPlan(id: number, benefitPlan: BenefitPlan): Promise<BenefitPlan> {
    return apiClient.put(`/hr/payroll/benefit-plans/${id}`, benefitPlan);
  }

  async deleteBenefitPlan(id: number): Promise<void> {
    return apiClient.delete(`/hr/payroll/benefit-plans/${id}`);
  }

  // EmployeeBenefit endpoints
  async createEmployeeBenefit(employeeBenefit: EmployeeBenefit): Promise<EmployeeBenefit> {
    return apiClient.post('/hr/payroll/employee-benefits', employeeBenefit);
  }

  async getAllEmployeeBenefits(): Promise<EmployeeBenefit[]> {
    try {
      return await apiClient.get('/hr/payroll/employee-benefits');
    } catch (error) {
      console.warn('Failed to fetch employee benefits from database, using empty array as fallback:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getEmployeeBenefitById(id: number): Promise<EmployeeBenefit> {
    return apiClient.get(`/hr/payroll/employee-benefits/${id}`);
  }

  async updateEmployeeBenefit(id: number, employeeBenefit: EmployeeBenefit): Promise<EmployeeBenefit> {
    return apiClient.put(`/hr/payroll/employee-benefits/${id}`, employeeBenefit);
  }

  async deleteEmployeeBenefit(id: number): Promise<void> {
    return apiClient.delete(`/hr/payroll/employee-benefits/${id}`);
  }

  // TrainingCourse endpoints
  async createTrainingCourse(trainingCourse: TrainingCourse): Promise<TrainingCourse> {
    return apiClient.post('/hr/payroll/training-courses', trainingCourse);
  }

  async getAllTrainingCourses(): Promise<TrainingCourse[]> {
    try {
      return await apiClient.get('/hr/payroll/training-courses');
    } catch (error) {
      console.warn('Failed to fetch training courses from database, using empty array as fallback:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getTrainingCourseById(id: number): Promise<TrainingCourse> {
    return apiClient.get(`/hr/payroll/training-courses/${id}`);
  }

  async updateTrainingCourse(id: number, trainingCourse: TrainingCourse): Promise<TrainingCourse> {
    return apiClient.put(`/hr/payroll/training-courses/${id}`, trainingCourse);
  }

  async deleteTrainingCourse(id: number): Promise<void> {
    return apiClient.delete(`/hr/payroll/training-courses/${id}`);
  }

  // EmployeeTraining endpoints
  async createEmployeeTraining(employeeTraining: EmployeeTraining): Promise<EmployeeTraining> {
    return apiClient.post('/hr/payroll/employee-trainings', employeeTraining);
  }

  async getAllEmployeeTrainings(): Promise<EmployeeTraining[]> {
    try {
      return await apiClient.get('/hr/payroll/employee-trainings');
    } catch (error) {
      console.warn('Failed to fetch employee trainings from database, using empty array as fallback:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getEmployeeTrainingById(id: number): Promise<EmployeeTraining> {
    return apiClient.get(`/hr/payroll/employee-trainings/${id}`);
  }

  async updateEmployeeTraining(id: number, employeeTraining: EmployeeTraining): Promise<EmployeeTraining> {
    return apiClient.put(`/hr/payroll/employee-trainings/${id}`, employeeTraining);
  }

  async deleteEmployeeTraining(id: number): Promise<void> {
    return apiClient.delete(`/hr/payroll/employee-trainings/${id}`);
  }

  // PerformanceReview endpoints
  async createPerformanceReview(performanceReview: PerformanceReview): Promise<PerformanceReview> {
    return apiClient.post('/hr/payroll/performance-reviews', performanceReview);
  }

  async getAllPerformanceReviews(): Promise<PerformanceReview[]> {
    try {
      return await apiClient.get('/hr/payroll/performance-reviews');
    } catch (error) {
      console.warn('Failed to fetch performance reviews from database, using empty array as fallback:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getPerformanceReviewById(id: number): Promise<PerformanceReview> {
    return apiClient.get(`/hr/payroll/performance-reviews/${id}`);
  }

  async updatePerformanceReview(id: number, performanceReview: PerformanceReview): Promise<PerformanceReview> {
    return apiClient.put(`/hr/payroll/performance-reviews/${id}`, performanceReview);
  }

  async deletePerformanceReview(id: number): Promise<void> {
    return apiClient.delete(`/hr/payroll/performance-reviews/${id}`);
  }

  async getPayslipsByUser(userId: number): Promise<Payslip[]> {
    return apiClient.get(`/hr/payroll/payslips/user/${userId}`);
  }

  async processPayroll(request: {
    startDate: string;
    endDate: string;
    payDate: string;
    departmentId: number | null;
    includeOvertime: boolean;
    includeBonuses: boolean;
    includeDeductions: boolean;
    createdBy: number;
  }): Promise<{ payrollRunId: number; employeesProcessed: number; status: string; message: string }> {
    return apiClient.post('/hr/payroll/process', request);
  }

  async downloadPayrollReport(payrollRunId: number, format: string = 'csv'): Promise<Blob> {
    return apiClient.get(`/hr/payroll/runs/${payrollRunId}/report?format=${format}`, { responseType: 'blob' });
  }

  async downloadBankFile(payrollRunId: number): Promise<Blob> {
    return apiClient.get(`/hr/payroll/runs/${payrollRunId}/bank-file`, { responseType: 'blob' });
  }

  async downloadPayslipPDF(payslipId: number): Promise<Blob> {
    return apiClient.get(`/hr/payroll/payslips/${payslipId}/pdf`, { responseType: 'blob' });
  }

  async getProvisionedEmployees(): Promise<ProvisionedEmployee[]> {
    const response = await apiClient.get('/hr/employees/provisioned');
    return response.employees || [];
  }
}

export const hrApiService = new HrApiService();

export type { User, PerformanceReview } from '@/types/javabackendapi/hrTypes';

// ============================================================================
// WRAPPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================
export async function fetchEmployees(): Promise<User[]> {
  return hrApiService.listEmployees();
}

export async function fetchEmployeeById(id: string): Promise<User> {
  return hrApiService.getEmployeeById(Number(id));
}

export async function updateEmployeeById(id: string, employee: UpdateEmployeeRequest): Promise<User> {
  return hrApiService.updateEmployee(Number(id), employee);
}

export async function uploadProfilePicture(id: string, file: File): Promise<User> {
  await hrApiService.updateProfilePicture(Number(id), file);
  return hrApiService.getEmployeeById(Number(id));
}

export async function createEmployee(employee: Partial<User>): Promise<User> {
  return hrApiService.registerEmployee(employee as User);
}

export async function fetchProvisionedEmployees() {
  return hrApiService.getProvisionedEmployees();
}

// Recruitment & Onboarding endpoints
export async function getAllJobPostings() {
  return apiClient.get('/hr/recruitment/job-postings');
}

export async function getOpenJobPostings() {
  return apiClient.get('/hr/recruitment/job-postings/open');
}

export async function createJobPosting(data: Partial<import('@/types/javabackendapi/hrTypes').JobPosting>) {
  return apiClient.post('/hr/recruitment/job-postings', data);
}

export async function updateJobPosting(id: number, data: Partial<import('@/types/javabackendapi/hrTypes').JobPosting>) {
  return apiClient.put(`/hr/recruitment/job-postings/${id}`, data);
}

export async function getOnboardingChecklist(userId: number): Promise<import('@/types/javabackendapi/hrTypes').OnboardingChecklist[]> {
  return apiClient.get(`/hr/recruitment/onboarding/${userId}`);
}

export async function createOnboardingTask(data: Partial<import('@/types/javabackendapi/hrTypes').OnboardingChecklist>) {
  return apiClient.post('/hr/recruitment/onboarding', data);
}

export async function completeOnboardingTask(id: number) {
  return apiClient.put(`/hr/recruitment/onboarding/${id}/complete`, {});
}

export async function deleteJobPosting(id: number) {
  return apiClient.delete(`/hr/recruitment/job-postings/${id}`);
}

export async function deleteOnboardingTask(id: number) {
  return apiClient.delete(`/hr/recruitment/onboarding/${id}`);
}

export async function getAttendanceReview(userId: number, startDate: string, endDate: string) {
  return apiClient.get(`/hr/payroll/attendance-review/${userId}?startDate=${startDate}&endDate=${endDate}`);
}

// Offboarding endpoints
export async function initiateOffboarding(data: Partial<import('@/types/javabackendapi/hrTypes').EmployeeOffboarding>) {
  return apiClient.post('/hr/offboarding', data);
}

export async function getAllOffboarding() {
  return apiClient.get('/hr/offboarding');
}

export async function getOffboardingById(id: number) {
  return apiClient.get(`/hr/offboarding/${id}`);
}

export async function getOffboardingByUserId(userId: number) {
  return apiClient.get(`/hr/offboarding/user/${userId}`);
}

export async function updateOffboarding(id: number, data: Partial<import('@/types/javabackendapi/hrTypes').EmployeeOffboarding>) {
  return apiClient.put(`/hr/offboarding/${id}`, data);
}

export async function completeOffboarding(id: number) {
  return apiClient.post(`/hr/offboarding/${id}/complete`, {});
}

export async function fetchPayslips(userId?: string): Promise<Payslip[]> {
  if (userId) {
    return hrApiService.getPayslipsByUser(Number(userId));
  }
  return hrApiService.getAllPayslips();
}

export const mapPayrollToUI = (payrollData: Payslip[]) => {
  return payrollData.map((payslip: Payslip) => ({
    period: `${payslip.generatedDate}`,
    basicSalary: `$${(payslip.basicSalary ?? 0).toFixed(2)}`,
    allowances: `$${(payslip.allowances ?? 0).toFixed(2)}`,
    overtime: '$0.00',
    deductions: `$${(payslip.deductions ?? 0).toFixed(2)}`,
    netPay: `$${(payslip.netPay ?? 0).toFixed(2)}`,
    status: 'Processed'
  }));
};
