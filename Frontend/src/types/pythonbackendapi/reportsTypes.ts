export interface ReportParams {
  name: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  data: Record<string, unknown>;
  parameters: ReportParams;
}

export interface MonthlyTrend {
  month: string;
  value: number;
  change: number;
}

export interface AIInsight {
  id: number;
  title: string;
  description: string;
  confidence: number;
  category: string;
  generatedAt: string;
}

export interface KPIData {
  totalRevenue: { value: number; change: number };
  totalExpenses: { value: number; change: number };
  netProfit: { value: number; change: number };
  employeeCount: { value: number; change: number };
  projectCompletionRate: { value: number; change: number };
  customerSatisfaction: { value: number; change: number };
}
