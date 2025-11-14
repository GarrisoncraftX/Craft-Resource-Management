import { apiClient } from '../../utils/apiClient';

// Types for System API
export interface SystemConfig {
  id?: number;
  key: string;
  value: string;
  description?: string;
}

export interface AuditLog {
  id?: number;
  action: string;
  entity: string;
  entityId: number;
  performedBy: string;
  timestamp: string;
  details?: string;
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

  async getRecentAuditLogsForUser(performedBy: string): Promise<AuditLog[]> {
    return apiClient.get(`/system/audit-logs/user/${performedBy}/recent`);
  }
}

export const systemApiService = new SystemApiService();
