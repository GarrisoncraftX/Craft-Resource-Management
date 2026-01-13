export interface Asset {
  id: number;
  assetCode?: string;
  assetTag?: string;
  name?: string;
  assetName?: string;
  description?: string;
  category?: string;
  location?: string;
  status?: 'Active' | 'Maintenance' | 'Disposed' | 'In Use' | string;
  purchaseDate?: string;
  acquisitionDate?: string;
  purchasePrice?: number;
  acquisitionCost?: number;
  currentValue?: number;
  depreciationRate?: number;
  assignedTo?: string;
  condition?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceRecord {
  id: number;
  asset: string | { id: number; name?: string };
  maintenanceDate: string;
  description: string;
  performedBy: string;
  type: string;
  status: 'Scheduled' | 'Completed' | 'In Progress' | 'Cancelled' | string;
  cost?: number;
  nextMaintenanceDate?: string;
}

export interface DisposalRecord {
  id: number;
  asset: string | { id: number; name?: string };
  disposalDate: string;
  method: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'In Progress' | 'Pending Approval' | string;
  reason?: string;
  proceeds?: number;
  approvedBy?: string;
}

export interface AcquisitionRequest {
  id: string;
  item: string;
  department: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | string;
  requestedBy: string;
  date: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  justification?: string;
}