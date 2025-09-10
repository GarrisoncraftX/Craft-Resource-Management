// Mock data for leave management
const mockLeaveTypes = [
  {
    id: 1,
    name: "Annual Leave",
    days_allowed: 21,
    description: "Annual vacation leave",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Sick Leave",
    days_allowed: 10,
    description: "Medical leave for illness",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Maternity Leave",
    days_allowed: 90,
    description: "Maternity leave for new mothers",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Paternity Leave",
    days_allowed: 14,
    description: "Paternity leave for new fathers",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Emergency Leave",
    days_allowed: 5,
    description: "Emergency situations requiring immediate leave",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Compassionate Leave",
    days_allowed: 7,
    description: "Leave for family emergencies or bereavement",
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

const mockLeaveRequests = [
  {
    id: "LR_001",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    leave_type_id: 1,
    start_date: "2024-02-15",
    end_date: "2024-02-19",
    days_requested: 5,
    reason: "Family vacation",
    status: "approved",
    created_at: "2024-01-15T10:00:00Z",
    reviewed_at: "2024-01-16T14:30:00Z",
    reviewed_by: "550e8400-e29b-41d4-a716-446655440001",
    review_comments: "Approved for vacation period",
  },
  {
    id: "LR_002",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    leave_type_id: 2,
    start_date: "2024-01-20",
    end_date: "2024-01-22",
    days_requested: 3,
    reason: "Medical appointment and recovery",
    status: "pending",
    created_at: "2024-01-18T09:15:00Z",
    reviewed_at: null,
    reviewed_by: null,
    review_comments: null,
  },
]

const mockLeaveBalances = [
  {
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    leave_type_id: 1,
    used_days: 5,
    remaining_days: 16,
    leave_type_name: "Annual Leave",
    days_allowed: 21,
  },
  {
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    leave_type_id: 2,
    used_days: 2,
    remaining_days: 8,
    leave_type_name: "Sick Leave",
    days_allowed: 10,
  },
]

const getLeaveTypes = () => {
  return Promise.resolve(mockLeaveTypes)
}

const getLeaveRequestsByUser = (userId, filters = {}) => {
  let requests = mockLeaveRequests.filter((req) => req.user_id === userId)

  if (filters.status) {
    requests = requests.filter((req) => req.status === filters.status)
  }

  return Promise.resolve(requests)
}

const getLeaveBalancesByUser = (userId) => {
  const balances = mockLeaveBalances.filter((balance) => balance.user_id === userId)
  return Promise.resolve(balances)
}

const createLeaveRequest = (data) => {
  const newRequest = {
    id: `LR_${Date.now()}`,
    user_id: data.userId,
    leave_type_id: data.leaveTypeId,
    start_date: data.startDate,
    end_date: data.endDate,
    days_requested: data.daysRequested,
    reason: data.reason,
    status: "pending",
    created_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    review_comments: null,
  }

  mockLeaveRequests.push(newRequest)
  return Promise.resolve(newRequest)
}

const updateLeaveRequestStatus = (id, status, reviewedBy, comments) => {
  const requestIndex = mockLeaveRequests.findIndex((req) => req.id === id)

  if (requestIndex === -1) {
    return Promise.reject(new Error("Leave request not found"))
  }

  mockLeaveRequests[requestIndex] = {
    ...mockLeaveRequests[requestIndex],
    status,
    reviewed_by: reviewedBy,
    review_comments: comments,
    reviewed_at: new Date().toISOString(),
  }

  return Promise.resolve(mockLeaveRequests[requestIndex])
}

module.exports = {
  getLeaveTypes,
  getLeaveRequestsByUser,
  getLeaveBalancesByUser,
  createLeaveRequest,
  updateLeaveRequestStatus,
  mockLeaveTypes,
  mockLeaveRequests,
  mockLeaveBalances,
}
