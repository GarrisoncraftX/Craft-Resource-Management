import { apiClient } from '@/utils/apiClient';

// Types for HR API
export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  departmentId?: number;
  roleId?: number;
  managerId?: number;
  salary?: number;
  accountNumber?: string;
  momoNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  employeeId: string;
  profilePictureUrl?: string;
  hireDate: string;
  status: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  departmentId?: number;
  roleId?: number;
  managerId?: number;
  salary?: number;
  accountNumber?: string;
  momoNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
  employeeId?: string;
  password?: string;
  confirmPassword?: string;
}

export interface BiometricData {
  faceEmbedding: number[];
  fingerprintHash: string;
}

export interface PayrollRun {
  id?: number;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  totalEmployees: number;
  totalAmount: number;
}

export interface Payslip {
  id?: number;
  employeeId: number;
  payrollRunId: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  generatedDate: string;
}

export interface BenefitPlan {
  id?: number;
  name: string;
  description: string;
  coverageAmount: number;
  premium: number;
  type: string;
}

export interface EmployeeBenefit {
  id?: number;
  employeeId: number;
  benefitPlanId: number;
  enrollmentDate: string;
  status: string;
}

export interface TrainingCourse {
  id?: number;
  name: string;
  description: string;
  duration: number;
  cost: number;
  instructor: string;
}

export interface EmployeeTraining {
  id?: number;
  employeeId: number;
  trainingCourseId: number;
  startDate: string;
  endDate: string;
  status: string;
  completionDate?: string;
}

export interface PerformanceReview {
  id?: number;
  employeeId: number;
  reviewerId: number;
  reviewDate: string;
  rating: number;
  comments: string;
  goals?: string;
}

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

  async updateProfilePicture(id: number, file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.put(`/hr/employees/id/${id}/profile-picture`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
    return apiClient.get('/hr/payroll/runs');
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
    return apiClient.get('/hr/payroll/payslips');
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
    return apiClient.get('/hr/payroll/benefit-plans');
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
    return apiClient.get('/hr/payroll/employee-benefits');
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
    return apiClient.get('/hr/payroll/training-courses');
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
    return apiClient.get('/hr/payroll/employee-trainings');
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
    return apiClient.get('/hr/payroll/performance-reviews');
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

  // Additional Payslip endpoint
  async getPayslipsByUser(userId: number): Promise<Payslip[]> {
    return apiClient.get(`/hr/payroll/payslips/user/${userId}`);
  }
}

export const hrApiService = new HrApiService();
