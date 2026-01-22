// Admin Module Mock Data

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  department: string;
  profilePictureUrl?: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  performedBy?: string;
  details?: string;
  serviceName?: string;
  ipAddress?: string;
  requestId?: string;
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  result?: string;
  user?: string;
  resource?: string;
  severity?: string;
  category?: string;
  ip?: string;
}

export interface SecurityEvent {
  id: number;
  type: string;
  user: string;
  timestamp: string;
  severity: string;
  status: string;
  ip: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  recipients: number;
  timestamp: string;
  status: string;
  priority: string;
}

export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15 10:30 AM', department: 'IT' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', role: 'HR Manager', status: 'Active', lastLogin: '2024-01-14 2:15 PM', department: 'Human Resources' },
  { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'Employee', status: 'Locked', lastLogin: '2024-01-10 9:00 AM', department: 'Finance' }
];

export const mockAuditLogs: AuditLog[] = [
  { id: 1, timestamp: '2024-01-15 14:30:22', user: 'john.doe@company.com', action: 'Login', resource: 'System', details: 'Successful login from IP 192.168.1.45', severity: 'Info', category: 'Authentication', ip: '192.168.1.45' },
  { id: 2, timestamp: '2024-01-15 13:45:15', user: 'jane.smith@company.com', action: 'Update', resource: 'User Profile', details: 'Updated user profile information', severity: 'Info', category: 'User Management', ip: '192.168.1.78' },
  { id: 3, timestamp: '2024-01-15 12:20:08', user: 'admin@company.com', action: 'Delete', resource: 'Database Record', details: 'Deleted user record ID: 12345', severity: 'Warning', category: 'Data Management', ip: '192.168.1.10' }
];

export const mockSecurityEvents: SecurityEvent[] = [
  { id: 1, type: 'Failed Login', user: 'unknown@attacker.com', timestamp: '2024-01-15 14:30:22', severity: 'High', status: 'Blocked', ip: '192.168.1.100' },
  { id: 2, type: 'Privilege Escalation', user: 'john.doe@company.com', timestamp: '2024-01-15 13:45:15', severity: 'Critical', status: 'Investigating', ip: '192.168.1.45' },
  { id: 3, type: 'Suspicious Activity', user: 'jane.smith@company.com', timestamp: '2024-01-15 12:20:08', severity: 'Medium', status: 'Resolved', ip: '192.168.1.78' }
];

export const mockNotifications: Notification[] = [
  { id: 1, title: 'System Maintenance Alert', message: 'Scheduled maintenance will begin at 2:00 AM', type: 'System', recipients: 245, timestamp: '2024-01-15 09:30:00', status: 'Sent', priority: 'High' },
  { id: 2, title: 'Security Alert', message: 'Multiple failed login attempts detected', type: 'Security', recipients: 12, timestamp: '2024-01-15 08:45:00', status: 'Delivered', priority: 'Critical' },
  { id: 3, title: 'Weekly Report Available', message: 'Your weekly analytics report is ready', type: 'Report', recipients: 89, timestamp: '2024-01-15 07:00:00', status: 'Sent', priority: 'Low' }
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 1,
    title: 'Login Issues',
    description: 'Users unable to login to the system',
    priority: 'High',
    status: 'Open',
    assignedTo: 'IT Support',
    createdBy: 'john.doe@company.com',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: 'Database Performance',
    description: 'Slow query performance on reports',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Database Admin',
    createdBy: 'jane.smith@company.com',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  }
];

export const mockSystemStats = {
  totalUsers: 247,
  activeSessions: 89,
  databaseSize: '2.4GB',
  systemUptime: '99.9%',
  cpuUsage: 42,
  memoryUsage: 68,
  diskUsage: 47,
  activeUsers: 156,
  systemHealth: 'Good',
  lastBackup: '2024-01-15T02:00:00Z',
  pendingUpdates: 3
};

export const mockSystemSettings = {
  organizationName: 'Craft Resource Management',
  systemTimezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  currency: 'USD',
  language: 'English',
  sessionTimeout: '30',
  maxLoginAttempts: '3',
  passwordExpiry: '90',
  enableTwoFactor: true,
  enableAuditLog: true,
  maintenanceMode: false,
  backupFrequency: 'daily',
  emailNotifications: true,
  smsNotifications: false,
  autoBackup: true,
  systemTheme: 'light'
};

export const mockDatabaseStats = {
  totalTables: 45,
  totalRecords: 125000,
  databaseSize: '2.4GB',
  indexSize: '450MB',
  lastOptimization: '2024-01-14T03:00:00Z',
  connectionPool: { active: 12, idle: 8, max: 20 },
  queryPerformance: {
    avgResponseTime: 125,
    slowQueries: 3,
    totalQueries: 15420
  }
};

export const mockAuditStatistics = {
  totalLogs: 15420,
  todayLogs: 342,
  weekLogs: 2156,
  topActions: ['LOGIN', 'UPDATE', 'CREATE'],
  topUsers: ['admin', 'john.doe', 'jane.smith']
};

export const mockTopActions = [
  { action: 'LOGIN', count: 450 },
  { action: 'UPDATE', count: 320 },
  { action: 'CREATE', count: 180 },
  { action: 'DELETE', count: 45 }
];

export const mockTopUsers = [
  { user: 'admin', count: 523 },
  { user: 'john.doe', count: 342 },
  { user: 'jane.smith', count: 289 }
];
