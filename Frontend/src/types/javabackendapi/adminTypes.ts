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
