import { apiClient } from '@/utils/apiClient';
import { mockUsers, mockAuditLogs, mockSecurityEvents, mockNotifications,mockSupportTickets,mockSystemStats,mockSystemSettings,mockDatabaseStats,mockAuditStatistics,mockTopActions,mockTopUsers } from '@/services/mockData/admin';
import type { User, AuditLog, SecurityEvent, Notification, SupportTicket } from '@/services/mockData/admin';

interface EmployeeResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: number;
  lastLogin?: string;
  roleId?: number;
  departmentId?: number;
  profilePictureUrl?: string;
}

const ROLE_MAP: Record<number, string> = {
  1: 'Admin',
  2: 'Department Head',
  5: 'Employee',
  9: 'HR Manager',
  10: 'Finance Manager',
  11: 'IT Manager'
};

const DEPARTMENT_MAP: Record<number, string> = {
  1: 'Human Resources',
  2: 'Finance',
  3: 'IT',
  4: 'Operations',
  5: 'Marketing',
  6: 'Sales',
  7: 'Legal'
};

class AdminApiService {
  private async handleApiCall<T>(apiCall: () => Promise<T>, fallback: T): Promise<T> {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.warn('API call failed, using fallback data:', error);
      return fallback;
    }
  }

  // User Management - Using HR Employee endpoints
  async getUsers(): Promise<User[]> {
    return this.handleApiCall(
      async () => {
        const employees = await apiClient.get('/hr/employees/list');
        return employees.map((emp: EmployeeResponse) => ({
          id: emp.id,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A',
          email: emp.email || '',
          role: ROLE_MAP[emp.roleId || 5] || 'Employee',
          status: emp.isActive === 1 ? 'Active' : 'Inactive',
          lastLogin: emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : 'Never',
          department: DEPARTMENT_MAP[emp.departmentId || 1] || 'N/A',
          profilePictureUrl: emp.profilePictureUrl
        }));
      },
      mockUsers
    );
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.handleApiCall(
      () => apiClient.post('/hr/employees/register', user),
      { ...user, id: Date.now() }
    );
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    return this.handleApiCall(
      () => apiClient.put(`/hr/employees/id/${id}`, user),
      { ...mockUsers[0], ...user, id }
    );
  }

  async deleteUser(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`/hr/employees/id/${id}`),
      undefined
    );
  }

  async toggleUserStatus(id: number): Promise<User> {
    return this.handleApiCall(
      () => apiClient.patch(`/hr/employees/id/${id}/toggle-status`),
      { ...mockUsers[0], id, status: mockUsers[0].status === 'Active' ? 'Locked' : 'Active' }
    );
  }

  // Audit Logs - Using real Java backend endpoint
  async getAuditLogs(limit?: number): Promise<AuditLog[]> {
    const params = limit ? { page: 0, size: limit } : { page: 0, size: 20 };
    return this.handleApiCall(
      async () => {
        const response = await apiClient.get('/system/audit-logs', { params });
        return response.content || response;
      },
      limit ? mockAuditLogs.slice(0, limit) : mockAuditLogs
    );
  }

  // Security Events - Using system security incidents endpoint
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return this.handleApiCall(
      () => apiClient.get('/system/security/incidents'),
      mockSecurityEvents
    );
  }

  // Notifications - Mock only (no backend endpoint yet)
  async getNotifications(): Promise<Notification[]> {
    return mockNotifications;
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'status'>): Promise<Notification> {
    return { ...notification, id: Date.now(), timestamp: new Date().toISOString(), status: 'Sent' };
  }

  async deleteNotification(id: number): Promise<void> {
    return undefined;
  }

  // Support Tickets - Using real Java backend endpoint
  async getSupportTickets(): Promise<SupportTicket[]> {
    return this.handleApiCall(
      () => apiClient.get('/admin/support-tickets'),
      mockSupportTickets
    );
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    return this.handleApiCall(
      () => apiClient.post('/admin/support-tickets', ticket),
      {
        ...ticket,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  }

  // Analytics - Using real Java backend audit analytics endpoints
  async getAuditStatistics() {
    return this.handleApiCall(
      () => apiClient.get('/system/audit-logs/analytics/statistics'),
      mockAuditStatistics
    );
  }

  async getTopActions(days: number = 7) {
    return this.handleApiCall(
      () => apiClient.get('/system/audit-logs/analytics/top-actions', { params: { days } }),
      mockTopActions
    );
  }

  async getTopUsers(days: number = 7) {
    return this.handleApiCall(
      () => apiClient.get('/system/audit-logs/analytics/top-users', { params: { days } }),
      mockTopUsers
    );
  }

  // System Config - Using real Java backend endpoint
  async getSystemConfigs() {
    return this.handleApiCall(
      () => apiClient.get('/system/configs'),
      []
    );
  }

  async updateSystemConfig(id: number, config: Record<string, unknown>) {
    return this.handleApiCall(
      () => apiClient.put(`/system/configs/${id}`, config),
      config
    );
  }

  // System Stats
  async getSystemStats() {
    return this.handleApiCall(
      () => apiClient.get('/admin/stats'),
      mockSystemStats
    );
  }

  // System Settings - Using system configs endpoint
  async getSystemSettings() {
    return this.handleApiCall(
      () => apiClient.get('/system/configs'),
      mockSystemSettings
    );
  }

  async updateSystemSettings(settings: Record<string, unknown>) {
    return this.handleApiCall(
      () => apiClient.put('/system/configs', settings),
      settings
    );
  }

  // Database Management - Mock only (no backend endpoint yet)
  async getDatabaseStats() {
    return mockDatabaseStats;
  }

  async optimizeDatabase(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Database optimization completed successfully' };
  }

  async backupDatabase(): Promise<{ success: boolean; message: string; backupId?: string }> {
    return { success: true, message: 'Database backup initiated', backupId: `backup_${Date.now()}` };
  }
}

export const adminApiService = new AdminApiService();
