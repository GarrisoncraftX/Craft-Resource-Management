/**
 * Enhanced HR Types for Banking Workforce Governance
 * Includes compliance, risk-sensitive roles, training, and offboarding
 */

export interface EmployeeProfile {
  // Basic Information
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Employment Details
  employmentType: 'permanent' | 'contract' | 'temporary' | 'part-time';
  department: string;
  designation: string;
  joiningDate: string;
  reportingTo?: number; // Manager ID
  
  // Risk & Compliance
  riskSensitivePosition: boolean;
  positionCategory?: 'executive' | 'officer' | 'specialist' | 'support';
  complianceStatus: 'fit-and-proper' | 'pending-review' | 'non-compliant';
  fitAndProperCheckDate?: string;
  fitAndProperCheckExpiry?: string;
  
  // Background & Clearance
  backgroundCheckStatus: 'pending' | 'passed' | 'failed' | 'expired';
  backgroundCheckDate?: string;
  backgroundCheckExpiryDate?: string;
  clearanceLevel?: 'none' | 'basic' | 'enhanced' | 'top-secret';
  
  // Training & Development
  certifications: Certification[];
  trainingRecords: TrainingRecord[];
  amlKycCompletedDate?: string;
  amlKycExpiryDate?: string;
  
  // Performance
  performanceMetrics?: PerformanceMetric[];
  kpiStatus?: 'on-track' | 'at-risk' | 'exceeded';
  
  // Assets Assigned
  assignedAssets: number[]; // Asset IDs
  
  // Security Access
  securityAccounts: SecurityAccount[];
  accessCards?: AccessCard[];
  
  // Offboarding (if applicable)
  offboardingStatus?: 'active' | 'notice-period' | 'final-week' | 'offboarded';
  offboardingInitiatedDate?: string;
  exitDate?: string;
  offboardingType?: 'resignation' | 'termination' | 'retirement' | 'transfer';
  
  // System Fields
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  certificationDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'pending';
}

export interface TrainingRecord {
  id: number;
  trainingName: string;
  trainingType: 'AML/KYC' | 'Compliance' | 'Security' | 'Product' | 'Other';
  completionDate: string;
  expiryDate?: string;
  score?: number;
  status: 'completed' | 'in-progress' | 'not-started';
  certificateUrl?: string;
}

export interface PerformanceMetric {
  id: number;
  metricName: string;
  kpiCategory: 'sales' | 'portfolio-quality' | 'compliance' | 'customer-service';
  targetValue: number;
  actualValue: number;
  quarter: string;
  status: 'on-track' | 'at-risk' | 'exceeded';
}

export interface SecurityAccount {
  id: number;
  system: string;
  userId: string;
  status: 'active' | 'disabled' | 'locked';
  createdDate: string;
  lastLoginDate?: string;
  expiryDate?: string;
}

export interface AccessCard {
  id: number;
  cardNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'disabled' | 'lost';
  accessLevels: string[];
}

export interface EmployeeOffboarding {
  id: number;
  employeeId: number;
  offboardingType: 'RESIGNATION' | 'TERMINATION' | 'RETIREMENT' | 'TRANSFER';
  initiatedDate: string;
  exitDate: string;
  status: 'NOTICE_PERIOD' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'COMPLETED';
  
  // Offboarding Checklist
  exitInterviewScheduled: boolean;
  exitInterviewCompletedDate?: string;
  
  // Asset Return Tracking
  assetsReturned: boolean;
  assetReturnChecklist: AssetReturnItem[];
  
  // Access & System Cleanup
  accessRevoked: boolean;
  securityAccountsDisabled: boolean;
  systemsAffected: string[];
  
  // Compliance & Finance
  clearanceCompleted: boolean;
  complianceSignOffDate?: string;
  finalSettlementPaid: boolean;
  settlementDate?: string;
  
  // Approvals
  approvals: OffboardingApproval[];
  completionDate?: string;
  
  // Notes
  notes?: string;
  createdBy: string;
  updatedBy: string;
}

export interface AssetReturnItem {
  assetId: number;
  assetTag: string;
  assetName: string;
  returnStatus: 'pending' | 'returned' | 'missing' | 'damaged';
  expectedReturnDate: string;
  actualReturnDate?: string;
  returnedCondition?: string;
  notes?: string;
}

export interface OffboardingApproval {
  id: number;
  approverId: number;
  approverName: string;
  approverRole: string;
  approvalType: 'manager' | 'hr' | 'finance' | 'compliance';
  status: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
  comments?: string;
}

export interface OnboardingChecklist {
  id?: number;
  userId: number;
  taskName: string;
  category: 'system' | 'compliance' | 'training' | 'asset' | 'other';
  dueDate: string;
  completionDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  assignedTo: string;
  notes?: string;
}

export interface JobPosting {
  id?: number;
  title: string;
  description: string;
  departmentId: number;
  jobGradeId: number;
  requiredQualifications: string;
  closingDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'FILLED';
  hiringManager?: number;
  applicationCount?: number;
  createdDate?: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveType: 'annual' | 'sick' | 'maternity' | 'sabbatical' | 'unpaid';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approverId?: number;
  approvalDate?: string;
  createdDate: string;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  payPeriod: string;
  basicSalary: number;
  allowances: PayrollAllowance[];
  deductions: PayrollDeduction[];
  grossSalary: number;
  netSalary: number;
  processedDate: string;
  status: 'pending' | 'processed' | 'paid';
}

export interface PayrollAllowance {
  name: string;
  amount: number;
  type: 'fixed' | 'variable';
}

export interface PayrollDeduction {
  name: string;
  amount: number;
  type: 'tax' | 'insurance' | 'loan' | 'other';
}

export interface BenefitPlan {
  id: number;
  employeeId: number;
  planName: string;
  planType: 'health' | 'pension' | 'insurance' | 'other';
  enrollmentDate: string;
  coverage: string;
  status: 'active' | 'inactive' | 'pending';
  beneficiary?: string;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  duration: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  remarks?: string;
}
