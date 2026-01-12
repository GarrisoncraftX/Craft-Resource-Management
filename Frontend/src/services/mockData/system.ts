// System Monitoring, Database, and Support Tickets Mock Data

export interface SystemMetric {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface SystemAlert {
  id: number;
  type: string;
  severity: string;
  timestamp: string;
  message: string;
  status: string;
}

export interface DatabaseTable {
  name: string;
  records: number;
  size: string;
  growth: string;
}

export interface BackupRecord {
  id: number;
  type: string;
  timestamp: string;
  size: string;
  status: string;
  duration: string;
}

export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  requester: string;
  department: string;
  priority: string;
  status: string;
  createdAt: string;
  category: string;
}

export const mockSystemMetrics: SystemMetric[] = [
  { time: '00:00', cpu: 25, memory: 65, disk: 45, network: 30 },
  { time: '04:00', cpu: 18, memory: 58, disk: 42, network: 15 },
  { time: '08:00', cpu: 45, memory: 72, disk: 48, network: 85 },
  { time: '12:00', cpu: 62, memory: 78, disk: 52, network: 95 },
  { time: '16:00', cpu: 38, memory: 69, disk: 47, network: 72 },
  { time: '20:00', cpu: 28, memory: 61, disk: 44, network: 45 }
];

export const mockSystemAlerts: SystemAlert[] = [
  { id: 1, type: 'High CPU Usage', severity: 'Warning', timestamp: '2024-01-15 14:30:00', message: 'CPU usage exceeded 80%', status: 'Active' },
  { id: 2, type: 'Disk Space Low', severity: 'Critical', timestamp: '2024-01-15 13:45:00', message: 'Available disk space below 10%', status: 'Resolved' },
  { id: 3, type: 'Memory Usage High', severity: 'Warning', timestamp: '2024-01-15 12:20:00', message: 'Memory usage reached 85%', status: 'Active' }
];

export const mockDatabaseTables: DatabaseTable[] = [
  { name: 'Users', records: 1247, size: '2.3MB', growth: '+5.2%' },
  { name: 'Employees', records: 342, size: '1.8MB', growth: '+2.1%' },
  { name: 'Assets', records: 892, size: '4.7MB', growth: '+8.3%' },
  { name: 'Transactions', records: 5634, size: '15.2MB', growth: '+12.5%' }
];

export const mockBackupRecords: BackupRecord[] = [
  { id: 1, type: 'Full Backup', timestamp: '2024-01-15 02:00:00', size: '2.4GB', status: 'Completed', duration: '45 min' },
  { id: 2, type: 'Incremental', timestamp: '2024-01-14 02:00:00', size: '340MB', status: 'Completed', duration: '12 min' },
  { id: 3, type: 'Full Backup', timestamp: '2024-01-13 02:00:00', size: '2.3GB', status: 'Failed', duration: '38 min' }
];

export const mockSupportTickets: SupportTicket[] = [
  { id: 1, title: 'Cannot access email', description: 'Unable to log into company email', requester: 'John Doe', department: 'Finance', priority: 'High', status: 'Open', createdAt: '2024-01-15 09:30:00', category: 'Email' },
  { id: 2, title: 'Software installation request', description: 'Need Adobe Photoshop installed', requester: 'Jane Smith', department: 'Marketing', priority: 'Medium', status: 'In Progress', createdAt: '2024-01-14 14:20:00', category: 'Software' },
  { id: 3, title: 'Network connectivity issues', description: 'Intermittent internet connection', requester: 'Bob Johnson', department: 'HR', priority: 'Critical', status: 'Resolved', createdAt: '2024-01-13 11:15:00', category: 'Network' }
];
