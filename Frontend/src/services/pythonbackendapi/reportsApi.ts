import { apiClient } from '@/utils/apiClient';
import type { ReportParams, Report, MonthlyTrend, AIInsight, KPIData } from '@/types/pythonbackendapi/reportsTypes';

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
