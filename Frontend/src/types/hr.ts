
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
  departmentId: string;
  roleId: string;
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
  employeeNumber?: string;
  accountNumber?: string;
  momoNumber?: string;
  profilePictureUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  role?: string;
  department?: string;
  hiredate?: string;
}
