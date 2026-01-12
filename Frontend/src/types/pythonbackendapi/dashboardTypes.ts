export interface DashboardData {
  totalEmployees?: number;
  presentToday?: number;
  activeVisitors?: number;
  pendingIncidents?: number;
  [key: string]: unknown;
}

export interface DashboardWidget {
  id: string;
  title: string;
  value: number | string;
  type: string;
  [key: string]: unknown;
}
