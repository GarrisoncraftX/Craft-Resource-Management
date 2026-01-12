import { apiClient } from '@/utils/apiClient';
import type {
  LeaveType,
  LeaveRequest,
  LeaveBalance,
  LeaveRequestForm,
  LeaveApprovalAction
} from '@/types/nodejsbackendapi/leaveTypes';
import {
  mockLeaveTypes,
  mockLeaveRequests,
  mockLeaveBalances,
  mockLeaveStatistics
} from '@/types/nodejsbackendapi/leaveTypes';

class LeaveApiService {
  private useMockData = false;

  private async handleApiError<T>(apiCall: () => Promise<T>, mockData: T): Promise<T> {
    try {
      if (this.useMockData) {
        return mockData;
      }
      return await apiCall();
    } catch (error) {
      console.warn('API call failed, falling back to mock data:', error);
      this.useMockData = true;
      return mockData;
    }
  }

  // Leave Types
  async getLeaveTypes(): Promise<LeaveType[]> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.get('/api/leave/types');
        if (Array.isArray(response)) {
          return response;
        } else if (response?.success) {
          return response.data;
        } else {
          return mockLeaveTypes;
        }
      },
      mockLeaveTypes
    );
  }

  async createLeaveType(leaveType: Partial<LeaveType>): Promise<LeaveType> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.post('/api/leave/types', leaveType);
        if (response?.success) {
          return response.data;
        } else {
          throw new Error('Failed to create leave type');
        }
      },
      mockLeaveTypes[0]
    );
  }

  // Leave Requests
  async getLeaveRequests(userId?: number): Promise<LeaveRequest[]> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.get(`/api/leave/requests/${userId}`);
        let leaveRequests: LeaveRequest[];
        if (Array.isArray(response)) {
          leaveRequests = response;
        } else if (response?.success) {
          leaveRequests = response.data;
        } else {
          return mockLeaveRequests;
        }
        // Populate leaveType if missing
        const leaveTypes = await this.getLeaveTypes();
        return leaveRequests.map(req => ({
          ...req,
          leaveType: req.leaveType || leaveTypes.find(lt => lt.id === req.leaveTypeId)
        }));
      },
      mockLeaveRequests
    );
  }

  // Get all leave requests (for HR view)
  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.get('/api/leave/requests');
        if (Array.isArray(response)) {
          return response;
        } else if (response?.success) {
          return response.data;
        } else {
          return mockLeaveRequests;
        }
      },
      mockLeaveRequests
    );
  }

  async createLeaveRequest(leaveRequest: LeaveRequestForm | FormData): Promise<LeaveRequest> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.post('/api/leave/requests', leaveRequest);
        if (response?.success) {
          return response.data;
        } else {
          throw new Error('Failed to create leave request');
        }
      },
      {
        ...mockLeaveRequests[0],
        ...(leaveRequest instanceof FormData ? {} : leaveRequest),
        id: `LR${Date.now()}`,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        leaveType: mockLeaveTypes.find(lt => lt.id === (leaveRequest instanceof FormData ? 1 : leaveRequest.leaveTypeId))
      }
    );
  }


  async updateLeaveRequestStatus(
    id: string,
    action: LeaveApprovalAction,
    reviewedBy: number = 1
  ): Promise<LeaveRequest> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.put(`/api/leave/requests/${id}/status`, {
          status: action.status,
          reviewedBy,
          comments: action.comments
        });
        if (response?.success) {
          return response.data;
        } else {
          throw new Error('Failed to update leave request status');
        }
      },
      {
        ...mockLeaveRequests.find(req => req.id === id)!,
        status: action.status,
        reviewedBy,
        reviewComments: action.comments,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  }

  async approveLeaveRequest(id: string, approverId: number = 1): Promise<LeaveRequest> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.post(`/api/leave/requests/${id}/approve`, { userId: approverId });
        if (response?.success) {
          return response.data;
        } else {
          throw new Error('Failed to approve leave request');
        }
      },
      {
        ...mockLeaveRequests.find(req => req.id === id)!,
        status: 'approved' as const,
        reviewedBy: approverId,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  }

  async rejectLeaveRequest(id: string, approverId: number = 1, reason?: string): Promise<LeaveRequest> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.post(`/api/leave/requests/${id}/reject`, { userId: approverId, reason });
        if (response?.success) {
          return response.data;
        } else {
          throw new Error('Failed to reject leave request');
        }
      },
      {
        ...mockLeaveRequests.find(req => req.id === id)!,
        status: 'rejected' as const,
        reviewedBy: approverId,
        reviewComments: reason,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  }

  // Leave Balances
  async getLeaveBalances(userId: number): Promise<LeaveBalance[]> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.get(`/api/leave/balances/${userId}`);
        if (Array.isArray(response)) {
          return response;
        } else if (response?.success) {
          return response.data;
        } else {
          return mockLeaveBalances;
        }
      },
      mockLeaveBalances
    );
  }

  // Get all leave balances for all employees
  async getAllLeaveBalances(): Promise<LeaveBalance[]> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.get('/api/leave/balances');
        if (Array.isArray(response)) {
          return response;
        } else if (response?.success) {
          return response.data;
        } else {
          return mockLeaveBalances;
        }
      },
      mockLeaveBalances
    );
  }

  // Statistics
  async getLeaveStatistics(): Promise<typeof mockLeaveStatistics> {
    return this.handleApiError(
      async () => {
        const response = await apiClient.get('/api/leave/statistics');
        if (response?.success) {
          return response.data;
        } else {
          return mockLeaveStatistics;
        }
      },
      mockLeaveStatistics
    );
  }

  // Utility methods
  calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  formatLeaveDays(days: number): string {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  getLeaveTypeColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }
}

export const leaveApiService = new LeaveApiService();
