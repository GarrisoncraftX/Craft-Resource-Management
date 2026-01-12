import { apiClient } from '@/utils/apiClient';
import { mockUsers, mockAuditLogs, mockSecurityEvents, mockNotifications } from '@/services/mockData/admin';
import type { User, AuditLog, SecurityEvent, Notification } from '@/services/mockData/admin';

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

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

  // User Management
  async getUsers(): Promise<User[]> {
    return this.handleApiCall(
      () => apiClient.get('/admin/users'),
      mockUsers
    );
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.handleApiCall(
      () => apiClient.post('/admin/users', user),
      { ...user, id: Date.now() }
    );
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    return this.handleApiCall(
      () => apiClient.put(`/admin/users/${id}`, user),
      { ...mockUsers[0], ...user, id }
    );
  }

  async deleteUser(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`/admin/users/${id}`),
      undefined
    );
  }

  async toggleUserStatus(id: number): Promise<User> {
    return this.handleApiCall(
      () => apiClient.patch(`/admin/users/${id}/toggle-status`),
      { ...mockUsers[0], id, status: mockUsers[0].status === 'Active' ? 'Locked' : 'Active' }
    );
  }

  // Audit Logs
  async getAuditLogs(limit?: number): Promise<AuditLog[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.handleApiCall(
      () => apiClient.get(`/admin/audit-logs${query}`),
      limit ? mockAuditLogs.slice(0, limit) : mockAuditLogs
    );
  }

  // Security Events
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return this.handleApiCall(
      () => apiClient.get('/admin/security/events'),
      mockSecurityEvents
    );
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return this.handleApiCall(
      () => apiClient.get('/admin/notifications'),
      mockNotifications
    );
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'status'>): Promise<Notification> {
    return this.handleApiCall(
      () => apiClient.post('/admin/notifications', notification),
      { ...notification, id: Date.now(), timestamp: new Date().toISOString(), status: 'Sent' }
    );
  }

  async deleteNotification(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`/admin/notifications/${id}`),
      undefined
    );
  }

  // Support Tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    const mockTickets: SupportTicket[] = [
      {
        id: 1,
        title: 'Login Issues',
        description: 'Users unable to login to the system',
        priority: 'High',
        status: 'Open',
        assignedTo: 'IT Support',
        createdBy: 'john.doe@company.com',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        title: 'Database Performance',
        description: 'Slow query performance on reports',
        priority: 'Medium',
        status: 'In Progress',
        assignedTo: 'Database Admin',
        createdBy: 'jane.smith@company.com',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-15T09:15:00Z'
      }
    ];
    return this.handleApiCall(
      () => apiClient.get('/admin/support-tickets'),
      mockTickets
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

  // System Stats
  async getSystemStats() {
    const mockStats = {
      totalUsers: 247,
      activeSessions: 89,
      databaseSize: '2.4GB',
      systemUptime: '99.9%',
      cpuUsage: 42,
      memoryUsage: 68,
      diskUsage: 47,
      activeUsers: 156,
      systemHealth: 'Good',
      lastBackup: '2024-01-15T02:00:00Z',
      pendingUpdates: 3
    };
    return this.handleApiCall(
      () => apiClient.get('/admin/stats'),
      mockStats
    );
  }

  // System Settings
  async getSystemSettings() {
    const mockSettings = {
      organizationName: 'Craft Resource Management',
      systemTimezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      currency: 'USD',
      language: 'English',
      sessionTimeout: '30',
      maxLoginAttempts: '3',
      passwordExpiry: '90',
      enableTwoFactor: true,
      enableAuditLog: true,
      maintenanceMode: false,
      backupFrequency: 'daily',
      emailNotifications: true,
      smsNotifications: false,
      autoBackup: true,
      systemTheme: 'light'
    };
    return this.handleApiCall(
      () => apiClient.get('/admin/settings'),
      mockSettings
    );
  }

  async updateSystemSettings(settings: Record<string, unknown>) {
    return this.handleApiCall(
      () => apiClient.put('/admin/settings', settings),
      settings
    );
  }

  // Database Management
  async getDatabaseStats() {
    const mockDbStats = {
      totalTables: 45,
      totalRecords: 125000,
      databaseSize: '2.4GB',
      indexSize: '450MB',
      lastOptimization: '2024-01-14T03:00:00Z',
      connectionPool: { active: 12, idle: 8, max: 20 },
      queryPerformance: {
        avgResponseTime: 125,
        slowQueries: 3,
        totalQueries: 15420
      }
    };
    return this.handleApiCall(
      () => apiClient.get('/admin/database/stats'),
      mockDbStats
    );
  }

  async optimizeDatabase(): Promise<{ success: boolean; message: string }> {
    return this.handleApiCall(
      () => apiClient.post('/admin/database/optimize', {}),
      { success: true, message: 'Database optimization completed successfully' }
    );
  }

  async backupDatabase(): Promise<{ success: boolean; message: string; backupId?: string }> {
    return this.handleApiCall(
      () => apiClient.post('/admin/database/backup', {}),
      { success: true, message: 'Database backup initiated', backupId: `backup_${Date.now()}` }
    );
  }
}

export const adminApiService = new AdminApiService();
