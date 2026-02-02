export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  activeSessions?: number;
  uptime?: string;
  storageUsed?: string;
}

export interface AuditStatistics {
  totalLogs?: number;
  todayLogs?: number;
  weekLogs?: number;
}

export interface AdminResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NotificationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export interface PasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TicketFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: SupportTicket;
  onSubmit: (data: Partial<SupportTicket>) => void;
}

export interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onSubmit: (data: any) => void;
}
