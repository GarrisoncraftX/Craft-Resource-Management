export interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  description: string;
  category?: string;
  status: 'Active' | 'Inactive';
  parentAccount?: string;
}

export interface AttendancePayload {
  faceData?: string;
  fingerprintId?: string;
  employeeId?: string;
  password?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  user?: {
    user_id: string;
    department_id: string;
    role_id: string;
    permissions: string[];
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    role: string;
  };
  token?: string;
}

export interface BudgetItem {
  id?: string;
  amount?: number;
  budgetName?: string;
  departmentId?: number;
  departmentName?: string;
  description?: string;
  endDate: string;
  remainingAmount: number;
  spentAmount: number;
  startDate: string;
  name?: string;
  department?: string;
  category?: string;
  budgetAmount?: number;
  remaining?: number;
  percentage?: number;
  period?: string;
  status?: 'On Track' | 'Warning' | 'Over Budget';
  lastUpdated?: string;
  budget_name?: string;
  start_date?: string;
  end_date?: string;
  department_id?: number;
  fiscal_year?: string;
  total_amount?: number;
  allocated_amount?: number;
  remaining_amount?: number;
  created_by?: number;
  approved_by?: number | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetRequest {
  id?: string;
  department: string;
  category: string;
  requestedAmount: number;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string;
  requestDate: string;
}

export interface DashboardKPIs {
  leaveBalance: number;
  nextPayrollDate: string;
  pendingTasks: number;
}

export interface LeaveBalance {
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string;
  leaveTypeId: number;
  leaveTypeName: string;
  allocatedDays: number;
  allocatedDaysFormatted: string;
  usedDays: number;
  usedDaysFormatted: string;
  carriedForwardDays: number;
  carriedForwardDaysFormatted: string;
  remainingDays: number;
  remainingDaysFormatted: string;
  balance: number;
  updatedAt: string;
}

export interface LeaveType {
  id: number;
  name: string;
  desciption: string;
  maxDaysPerYear: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  requiresApproval: boolean;
  isPaid: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  totalDays: string;
  reason: string;
  status: string;
  appliedAt: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewComments: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  handoverNotes: string | null;
  createdAt: string;
  updatedAt: string;
  LeaveType: LeaveType;
}

export interface IdCardData {
  cardId: string;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  email?: string;
  department?: string;
  nationalId?: string;
  phoneNumber?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Overdue';
  description: string;
  issueDate: string;
  category: string;
  paymentTerms: string;
  approvedBy?: string;
  apAccountCode?: string;
  expenseAccountCode?: string;
}


export interface PayrollDisplayData {
  id: number;
  employee: string;
  period: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
};

export interface Payslip {
  id: number;
  user_id?: number;
  grossPay: number;
  netPay: number;
  otherDeductions: number;
  payPeriodEnd: string;
  payPeriodStart: string;
  taxDeductions: number;
  payrollRun: {
    id: number;
    runDate: string;
    status: 'COMPLETED' | 'PENDING' | 'DRAFT';
  };

  


  user: {
    id: number;
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
   };
}

export interface PayrollRun {
  id: number;
  run_date: string;
  status: string;
}

export type PayrollStatus = 'Processed' | 'Pending' | 'Draft';

export interface AuditLog {
  id?: number | string;
  action: string;
  performedBy?: string;
  timestamp: string;
  details?: string;
  user?: string;
  resource?: string;
}
