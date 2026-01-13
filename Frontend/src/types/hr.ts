export interface Employee {
  id?: string | number;
  employeeId?: string;
  userId?: string | number;
  tenantId?: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  department?: string;
  departmentId?: number;
  role?: string;
  roleId?: number;
  position?: string;
  status?: string;
  hireDate?: string;
  dateOfBirth?: string;
  address?: string;
  nationalId?: string;
  profilePictureUrl?: string;
  salary?: number;
  managerId?: string | number;
  isActive?: boolean | number;
  createdAt?: string;
  updatedAt?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  accountNumber?: string;
  momoNumber?: string;
  lastLogin?: string;
  biometricEnrollmentStatus?: string;
  failedLoginAttempts?: number;
  accountLockedUntil?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  dateOfJoining?: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  departmentId?: number;
  roleId?: number;
  address?: string;
  dateOfBirth?: string;
  nationalId?: string;
  salary?: number;
  managerId?: string | number;
}

export interface Department {
  id: number | string;
  name: string;
  code?: string;
  description?: string;
}

export interface Role {
  id: number | string;
  name: string;
  code?: string;
  description?: string;
}