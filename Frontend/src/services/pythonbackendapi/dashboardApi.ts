import { apiClient } from '@/utils/apiClient';

interface DashboardData {
  totalEmployees?: number;
  presentToday?: number;
  activeVisitors?: number;
  pendingIncidents?: number;
  [key: string]: unknown;
}

interface DashboardWidget {
  id: string;
  title: string;
  value: number | string;
  type: string;
  [key: string]: unknown;
}

class DashboardApiService {
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/api/dashboard');
    return response.data || {};
  }

  async getDashboardWidgets(): Promise<DashboardWidget[]> {
    const response = await apiClient.get('/api/dashboard/widgets');
    return response.widgets || [];
  }
}

export const dashboardApiService = new DashboardApiService();
