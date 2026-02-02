export interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  onSuccess?: () => void;
}

export interface ViewEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
}

export interface AddBenefitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
}

export interface AddCertificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  onSuccess?: () => void;
}

export interface AddEmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface AddPerformanceReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  onSuccess?: () => void;
}

export interface AddTrainingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface EnrollEmployeeTrainingFormProps {
  isOpen: boolean;
  onClose: () => void;
  trainingId: number;
  onSuccess?: () => void;
}

export interface PayslipDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: unknown;
}

export interface ProcessingDialogProps {
  isOpen: boolean;
  message: string;
}

export interface ProcessPayrollFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface ITSupportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
}

export interface LeaveBalancesProps {
  employeeId: string;
}

export interface LeaveCalendarProps {
  leaves: unknown[];
}

export interface LeavePoliciesProps {
  onPolicySelect?: (policyId: string) => void;
}

export interface LeaveRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
}

export interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
}

export interface LeaveRequestsProps {
  employeeId?: string;
  isManager?: boolean;
}

export interface PerformanceGoalsTabProps {
  employeeId: string;
}

export interface PerformanceKPIsTabProps {
  employeeId: string;
}

export interface PerformanceReportsTabProps {
  employeeId: string;
}

export interface PerformanceReviewsTabProps {
  employeeId: string;
}

export interface PerformanceStatsProps {
  employeeId: string;
}
