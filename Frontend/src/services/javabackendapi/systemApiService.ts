import { apiClient } from '@/utils/apiClient';
import { mockSystemMetrics, mockSystemAlerts, mockDatabaseTables, mockBackupRecords, mockSupportTickets } from '@/services/mockData/system';
import type { SystemMetric, SystemAlert, DatabaseTable, BackupRecord, SupportTicket } from '@/services/mockData/system';

class SystemApiService {
  async getSystemMetrics(): Promise<SystemMetric[]> {
    try {
      return await apiClient.get('/admin/system/metrics');
    } catch {
      return mockSystemMetrics;
    }
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      return await apiClient.get('/admin/system/alerts');
    } catch {
      return mockSystemAlerts;
    }
  }

  async getSystemStats() {
    try {
      return await apiClient.get('/admin/system/stats');
    } catch {
      return { currentCpu: 42, currentMemory: 68, currentDisk: 47, activeUsers: 156 };
    }
  }

  async getDatabaseTables(): Promise<DatabaseTable[]> {
    try {
      return await apiClient.get('/admin/database/tables');
    } catch {
      return mockDatabaseTables;
    }
  }

  async getBackupRecords(): Promise<BackupRecord[]> {
    try {
      return await apiClient.get('/admin/database/backups');
    } catch {
      return mockBackupRecords;
    }
  }

  async createBackup(): Promise<BackupRecord> {
    try {
      return await apiClient.post('/admin/database/backups', {});
    } catch {
      return { id: Date.now(), type: 'Manual', timestamp: new Date().toISOString(), size: '0MB', status: 'Running', duration: '0 min' };
    }
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    try {
      return await apiClient.get('/admin/support/tickets');
    } catch {
      return mockSupportTickets;
    }
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt'>): Promise<SupportTicket> {
    try {
      return await apiClient.post('/admin/support/tickets', ticket);
    } catch {
      return { ...ticket, id: Date.now(), createdAt: new Date().toISOString() };
    }
  }

  async updateTicketStatus(id: number, status: string): Promise<SupportTicket> {
    try {
      return await apiClient.put(`/admin/support/tickets/${id}/status`, { status });
    } catch {
      return mockSupportTickets[0];
    }
  }
}

export const systemApiService = new SystemApiService();
