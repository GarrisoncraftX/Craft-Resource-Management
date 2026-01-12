import { apiClient } from '@/utils/apiClient';

export interface AuditLog {
  id?: number;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
}

class SystemApiService {
  async getRecentActivities(userId: string): Promise<AuditLog[]> {
    return apiClient.get(`/system/audit-logs/user/${userId}/recent`);
  }
}

export const systemApiService = new SystemApiService();

// ============================================================================
// WRAPPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================
export async function fetchRecentActivities(userId: string): Promise<AuditLog[]> {
  return systemApiService.getRecentActivities(userId);
}
