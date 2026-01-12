// Admin Module Mock Data

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  department: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  severity: string;
  category: string;
  ip: string;
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
