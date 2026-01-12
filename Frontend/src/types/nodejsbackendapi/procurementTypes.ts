export interface ProcurementRequest {
  id?: string;
  title: string;
  description: string;
  departmentId: string;
  requestedBy: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Vendor {
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'blacklisted';
  createdAt?: string;
  updatedAt?: string;
}

export interface Tender {
  id?: string;
  title: string;
  description: string;
  procurementRequestId: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  publishDate?: string;
  closeDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bid {
  id?: string;
  tenderId: string;
  vendorId: string;
  amount: number;
  description: string;
  status: 'submitted' | 'evaluated' | 'accepted' | 'rejected';
  submittedAt?: string;
  evaluatedAt?: string;
}

export interface Contract {
  id?: string;
  title: string;
  vendorId: string;
  procurementRequestId: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  terms: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationCommittee {
  id?: string;
  tenderId: string;
  members: string[];
  createdAt?: string;
}

export interface ProcurementActivityReport {
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalValue: number;
  averageProcessingTime: number;
}
