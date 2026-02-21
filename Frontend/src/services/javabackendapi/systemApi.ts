import { apiClient } from '@/utils/apiClient';

// Types for System API
export interface SystemConfig {
  id?: number;
  key: string;
  value: string;
  description?: string;
}

export interface AuditLog {
  id?: number;
  userId?: number;
  userName?: string;
  performedBy?: string;
  action: string;
  timestamp: string;
  details?: string;
  serviceName?: string;
  ipAddress?: string;
  requestId?: string;
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  result?: string;
}

class SystemApiService {
  // SystemConfig endpoints
  async createSystemConfig(config: SystemConfig): Promise<SystemConfig> {
    return apiClient.post('/system/configs', config);
  }

  async getAllSystemConfigs(): Promise<SystemConfig[]> {
    return apiClient.get('/system/configs');
  }

  async getSystemConfigById(id: number): Promise<SystemConfig> {
    return apiClient.get(`/system/configs/${id}`);
  }

  async updateSystemConfig(id: number, config: SystemConfig): Promise<SystemConfig> {
    return apiClient.put(`/system/configs/${id}`, config);
  }

  async deleteSystemConfig(id: number): Promise<void> {
    return apiClient.delete(`/system/configs/${id}`);
  }

  // AuditLog endpoints
  async createAuditLog(log: AuditLog): Promise<AuditLog> {
    return apiClient.post('/system/audit-logs', log);
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return apiClient.get('/system/audit-logs');
  }

  async getAuditLogById(id: number): Promise<AuditLog> {
    return apiClient.get(`/system/audit-logs/${id}`);
  }

  async updateAuditLog(id: number, log: AuditLog): Promise<AuditLog> {
    return apiClient.put(`/system/audit-logs/${id}`, log);
  }

  async deleteAuditLog(id: number): Promise<void> {
    return apiClient.delete(`/system/audit-logs/${id}`);
  }

  async getRecentAuditLogsForUser(userId: string | number): Promise<AuditLog[]> {
    return apiClient.get(`/system/audit-logs/user/${userId}/recent`);
  }

  async getAssetAuditLogs(limit: number = 10): Promise<AuditLog[]> {
    const response = await apiClient.get('/system/audit-logs/search', {
      params: { entityType: 'ASSET', size: limit }
    });
    return response.content || [];
  }
}

export const systemApiService = new SystemApiService();

// ============================================================================
// WRAPPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================
export async function createSystem(record: SystemConfig) {
  return systemApiService.createSystemConfig(record);
}

export async function fetchSystemByID(id: number | string) {
  return systemApiService.getSystemConfigById(Number(id));
}

export async function fetchSystem() {
  return systemApiService.getAllSystemConfigs();
}

export async function updateSystem(id: number | string, record: SystemConfig) {
  return systemApiService.updateSystemConfig(Number(id), record);
}

export async function deleteSystem(id: number | string) {
  return systemApiService.deleteSystemConfig(Number(id));
}

export async function fetchRecentActivities(userId: string | number): Promise<AuditLog[]> {
  return systemApiService.getRecentAuditLogsForUser(String(userId));
}

// Notification functions
export async function createNotification(notification: Notification) {
  return apiClient.post('/system/notifications', notification);
}

export async function fetchNotificationsByUserId(userId: number | string): Promise<Notification[]> {
  return apiClient.get(`/system/notifications/user/${userId}`);
}

export async function markNotificationAsRead(id: number | string): Promise<Notification> {
  return apiClient.put(`/system/notifications/${id}/read`, {});
}

export async function deleteNotification(id: number | string): Promise<void> {
  return apiClient.delete(`/system/notifications/${id}`);
}

export async function getUnreadNotificationCount(userId: number | string): Promise<number> {
  const response = await apiClient.get(`/system/notifications/user/${userId}/unread-count`);
  return response.count;
}

export interface Notification {
  id?: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
  createdAt?: string;
}
