import { apiClient } from '@/utils/apiClient';

export interface ReportParams {
  name: string;
  type: string;
  dataSources: string[];
  dateRange: string;
  format: string;
  filters?: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  generated: string;
  status: string;
  size: string;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
  employees: number;
  incidents: number;
}

export interface AIInsight {
  id: number;
  type: string;
  severity: string;
  title: string;
  description: string;
  department: string;
  confidence: number;
  date: string;
}

export interface KPIData {
  totalRevenue: { value: number; change: number };
  activeEmployees: { value: number; change: number };
  reportsGenerated: { value: number; period: string };
  systemEfficiency: { value: number; change: number };
}

class ReportsApiService {
  async generateReport(params: ReportParams): Promise<Report> {
    const response = await apiClient.post('/api/reports', params);
    return response.data;
  }

  async listReports(): Promise<Report[]> {
    const response = await apiClient.get('/api/reports');
    return response.data.reports || [];
  }

  async getReport(reportId: string): Promise<Report> {
    const response = await apiClient.get(`/api/reports/${reportId}`);
    return response.data.data;
  }

  async getMonthlyTrends(): Promise<MonthlyTrend[]> {
    const response = await apiClient.get('/api/analytics/monthly-trends');
    return response.data.data || [];
  }

  async getAIInsights(): Promise<AIInsight[]> {
    const response = await apiClient.get('/api/analytics/ai-insights');
    return response.data.data || [];
  }

  async getKPIs(): Promise<KPIData> {
    const response = await apiClient.get('/api/analytics/kpis');
    return response.data.data;
  }

  async deleteReport(reportId: string): Promise<void> {
    await apiClient.delete(`/api/reports/${reportId}`);
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await apiClient.get(`/api/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const reportsApiService = new ReportsApiService();
