
export interface TrainingProgram {
  id: string;
  title: string;
  category: string;
  duration: string;
  enrolled: number;
  capacity: number;
  startDate: string;
  status: string;
  cost: number;
}

export interface EmployeeProgress {
  employee: string;
  program: string;
  progress: number;
  status: string;
  startDate: string;
  expectedCompletion: string;
}

export interface Certification {
  employee: string;
  certification: string;
  issueDate: string;
  expiryDate: string;
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
  managerId?: string;
  salary?: number;
  accountNumber?: string;
  momoNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  email?: string;
  employeeId?: string;
  password?: string;
  confirmPassword?: string;
}

export interface Employee {
  id: string;
  tenantId: number;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  departmentId: number;
  roleId: number;
  managerId?: string;
  salary?: number;
  isActive: number;
  biometricEnrollmentStatus: string;
  lastLogin?: string;
  failedLoginAttempts: number;
  accountLockedUntil?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  createdAt: string;
  updatedAt: string;
  dateOfJoining?: string;
  accountNumber?: string;
  momoNumber?: string;
  profilePictureUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  role?: string;
  department?: string;
}
