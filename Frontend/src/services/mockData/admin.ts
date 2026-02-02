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
  userId?: number;
  userName?: string;
  action: string;
  timestamp: string;
  details?: string;
  serviceName?: string;
  ipAddress?: string;
  requestId?: string;
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  result?: string;
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
  { id: 1, userId: 1, action: 'User John Doe has signed in successfully', timestamp: '2024-01-15T14:30:22Z', details: '{"module":"authentication","operation":"SIGN_IN"}', serviceName: 'java-backend', ipAddress: '192.168.1.45', entityType: 'USER', entityId: '1', result: 'success' },
  { id: 2, userId: 2, action: 'User Jane Smith has updated their profile information', timestamp: '2024-01-15T13:45:15Z', details: '{"module":"user_management","operation":"UPDATE"}', serviceName: 'java-backend', ipAddress: '192.168.1.78', entityType: 'USER', entityId: '2', result: 'success' },
  { id: 3, userId: 1, action: 'User Admin has deleted user record ID: 12345', timestamp: '2024-01-15T12:20:08Z', details: '{"module":"user_management","operation":"DELETE","recordId":"12345"}', serviceName: 'java-backend', ipAddress: '192.168.1.10', entityType: 'USER', entityId: '12345', result: 'success' }
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
  weekLogs: 2156
};

export const mockTopActions = [
  { action: 'has signed in successfully', count: 450 },
  { action: 'has updated', count: 320 },
  { action: 'has created', count: 180 },
  { action: 'has deleted', count: 45 }
];

export const mockTopUsers = [
  { user: '1', count: 523 },
  { user: '2', count: 342 },
  { user: '3', count: 289 }
];
