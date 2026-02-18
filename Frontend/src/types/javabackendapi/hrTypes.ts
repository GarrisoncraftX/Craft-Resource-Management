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
  bankName?: string;
  momoNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  employeeId: string;
  profilePictureUrl?: string;
  hireDate: string;
  accountStatus?: string;
  isActive?: number;
  employeeNumber?: string;
  jobTitle?: string;
  title?: string;
  department?: { id?: number; name?: string };
  departmentName?: string;
  location?: { id?: number; name?: string };
  locationName?: string;
  role?: { id?: number; name?: string };
  roleName?: string;
  status?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
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
  bankName?: string;
  momoNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  email?: string;
  role?: string;
  department?: string;
  accountStatus?: string;
  isActive?: number;
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

export interface ProvisionedEmployee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  accountStatus: string;
  provisionedDate: string;
  profileCompleted: boolean;
  defaultPasswordChanged: boolean;
}

export interface JobPosting {
  id?: number;
  title: string;
  description?: string;
  departmentId?: number;
  jobGradeId?: number;
  requiredQualifications?: string;
  postingDate?: string;
  closingDate?: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'FILLED';
  createdBy?: number;
}

export interface OnboardingChecklist {
  id?: number;
  userId: number;
  taskName: string;
  isCompleted: boolean;
  completedAt?: string;
  assignedDate?: string;
}

export interface EmployeeOffboarding {
  id?: number;
  userId: number;
  resignationDate?: string;
  lastWorkingDate?: string;
  offboardingType: 'RESIGNATION' | 'TERMINATION' | 'RETIREMENT' | 'CONTRACT_END';
  reason?: string;
  status: 'NOTICE_PERIOD' | 'IN_PROGRESS' | 'COMPLETED';
  exitInterviewScheduled?: boolean;
  exitInterviewDate?: string;
  assetsReturned?: boolean;
  clearanceCompleted?: boolean;
  finalSettlementAmount?: number;
  finalSettlementPaid?: boolean;
  accessRevoked?: boolean;
  createdBy?: number;
}
