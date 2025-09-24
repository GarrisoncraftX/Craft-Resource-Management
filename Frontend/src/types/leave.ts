// Leave Management Types
export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  maxDaysPerYear: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  requiresApproval: boolean;
  isPaid: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  reviewComments?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  handoverNotes?: string;
  createdAt: string;
  updatedAt: string;
  leaveType?: LeaveType;
}

export interface LeaveBalance {
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

export interface LeaveStatistics {
  pendingRequests: number;
  approvedToday: number;
  employeesOnLeave: number;
  averageLeaveDays: number;
}

export interface LeaveRequestForm {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  handoverNotes?: string;
}

export interface LeaveApprovalAction {
  status: 'approved' | 'rejected';
  comments?: string;
}

// Mock data for fallback
export const mockLeaveTypes: LeaveType[] = [
  {
    id: 1,
    name: 'Annual Leave',
    description: 'Regular vacation leave',
    maxDaysPerYear: 21,
    carryForwardAllowed: true,
    maxCarryForwardDays: 5,
    requiresApproval: true,
    isPaid: true,
    isActive: true,
    createdAt: '2025-07-07 15:16:00',
    updatedAt: '2025-07-07 15:16:00'
  },
  {
    id: 2,
    name: 'Sick Leave',
    description: 'Medical leave for illness',
    maxDaysPerYear: 10,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresApproval: false,
    isPaid: true,
    isActive: true,
    createdAt: '2025-07-07 15:16:00',
    updatedAt: '2025-07-07 15:16:00'
  },
  {
    id: 3,
    name: 'Personal Leave',
    description: 'Personal time off',
    maxDaysPerYear: 5,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresApproval: true,
    isPaid: true,
    isActive: true,
    createdAt: '2025-07-07 15:16:00',
    updatedAt: '2025-07-07 15:16:00'
  }
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'LR001',
    userId: 1,
    leaveTypeId: 1,
    startDate: '2024-12-15',
    endDate: '2024-12-19',
    totalDays: 5,
    reason: 'Family vacation',
    status: 'approved',
    appliedAt: '2025-07-07 15:16:01',
    reviewedBy: 6,
    reviewedAt: '2024-12-01 10:00:00',
    createdAt: '2025-07-07 15:16:01',
    updatedAt: '2025-07-07 15:16:01'
  },
  {
    id: 'LR002',
    userId: 2,
    leaveTypeId: 2,
    startDate: '2024-12-10',
    endDate: '2024-12-10',
    totalDays: 1,
    reason: 'Medical appointment',
    status: 'approved',
    appliedAt: '2025-07-07 15:16:01',
    reviewedBy: 7,
    reviewedAt: '2024-12-01 11:00:00',
    createdAt: '2025-07-07 15:16:01',
    updatedAt: '2025-07-07 15:16:01'
  },
  {
    id: 'LR003',
    userId: 3,
    leaveTypeId: 1,
    startDate: '2024-12-20',
    endDate: '2024-12-31',
    totalDays: 10,
    reason: 'Year-end vacation',
    status: 'pending',
    appliedAt: '2025-07-07 15:16:01',
    createdAt: '2025-07-07 15:16:01',
    updatedAt: '2025-07-07 15:16:01'
  }
];

export const mockLeaveBalances: LeaveBalance[] = [
  {
    leaveTypeId: 1,
    leaveTypeName: 'Annual Leave',
    allocatedDays: 21,
    allocatedDaysFormatted: '21 days',
    usedDays: 8,
    usedDaysFormatted: '8 days',
    carriedForwardDays: 0,
    carriedForwardDaysFormatted: '0 days',
    remainingDays: 13,
    remainingDaysFormatted: '13 days',
    balance: 13,
    updatedAt: '2025-07-07 15:16:00'
  },
  {
    leaveTypeId: 2,
    leaveTypeName: 'Sick Leave',
    allocatedDays: 10,
    allocatedDaysFormatted: '10 days',
    usedDays: 2,
    usedDaysFormatted: '2 days',
    carriedForwardDays: 0,
    carriedForwardDaysFormatted: '0 days',
    remainingDays: 8,
    remainingDaysFormatted: '8 days',
    balance: 8,
    updatedAt: '2025-07-07 15:16:00'
  },
  {
    leaveTypeId: 3,
    leaveTypeName: 'Personal Leave',
    allocatedDays: 5,
    allocatedDaysFormatted: '5 days',
    usedDays: 1,
    usedDaysFormatted: '1 days',
    carriedForwardDays: 0,
    carriedForwardDaysFormatted: '0 days',
    remainingDays: 4,
    remainingDaysFormatted: '4 days',
    balance: 4,
    updatedAt: '2025-07-07 15:16:00'
  }
];

export const mockLeaveStatistics: LeaveStatistics = {
  pendingRequests: 8,
  approvedToday: 3,
  employeesOnLeave: 12,
  averageLeaveDays: 18.5
};
