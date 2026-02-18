export interface AssetStatistics {
  total: number;
  totalValue?: number;
  underMaintenance?: number;
  depreciationYtd?: number;
  byCategory?: Record<string, number>;
  byStatus?: Record<string, number>;
}


export interface AssetStats {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  disposedAssets: number;
  totalValue: number;
  depreciationRate: number;
}



export interface ValuationRecord {
  id: number;
  assetId: number;
  assetName: string;
  previousValue: number;
  currentValue: number;
  valuationDate: string;
  valuationMethod: string;
  valuedBy: string;
  notes?: string;
}

export interface Person {
  id: number;
  avatar?: string;
  name: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  company?: string;
  employeeNumber?: string;
  title?: string;
  vipUser?: boolean;
  remote?: boolean;
  email: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  language?: string;
  department?: string;
  departmentManager?: string;
  location?: string;
  manager?: string;
  assets?: number;
  licenses?: number;
  consumables?: number;
  accessories?: number;
  managedUsers?: number;
  managedLocations?: number;
  notes?: string;
  groups?: string;
  ldapEnabled?: boolean;
  twoFADeviceEnrolled?: boolean;
  twoFAActive?: boolean;
  loginEnabled?: boolean;
  autoAssignLicenses?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  lastLogin?: string;
  role?: string;
  isAdmin?: boolean;
  isDeleted?: boolean;
}

export interface License {
  id: number;
  name: string;
  productKey: string;
  expirationDate: string;
  terminationDate?: string;
  licensedToEmail: string;
  licensedTo: string;
  category?: string;
  supplier?: string;
  manufacturer: string;
  minQty: number;
  total: number;
  avail: number;
  purchaseDate?: string;
  depreciation?: string;
  maintained?: boolean;
  reassignable?: boolean;
  purchaseCost?: string;
  purchaseOrderNumber?: string;
  orderNumber?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  company?: string;
}

export interface BaseInventoryItem {
  id: number;
  name?: string;
  category: string;
  modelNo: string;
  location: string;
  minQty: number;
  total: number;
  remaining?: number;
  avail?: number;
  checkedOut?: number;
  unitCost: number;
  totalCost?: number;
  company?: string;
  manufacturer?: string;
  supplier?: string;
  purchaseDate?: string;
  orderNumber?: string;
  itemNo?: string;
  serial?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PredefinedKit {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCategory {
  category: string;
  count: number;
  value: number;
}

export interface AssetTrend {
  month: string;
  acquisitions: number;
  disposals: number;
  value: number;
}

export interface MaintenanceCost {
  month: string;
  preventive: number;
  corrective: number;
  emergency: number;
}

export interface Asset {
  // Identification & Classification
  id: number;
  assetCode?: string;
  assetTag?: string;
  name?: string;
  assetName?: string;
  description?: string;
  category?: string;
  assetClass?: 'laptop' | 'phone' | 'server' | 'atm' | 'pos' | 'vehicle' | 'tool' | string;
  
  // Location & Custody
  location?: string;
  defaultLocation?: string;
  assignedTo?: string;
  assignedToEmployee?: { id: string; name: string; email?: string };
  department?: string;
  company?: string;
  
  // Status & Lifecycle
  status?: 'Active' | 'Maintenance' | 'Disposed' | 'In Use' | 'Available' | 'Archived' | 'Retired' | string;
  condition?: string;
  lifecycleStage?: 'procurement' | 'received' | 'tagged' | 'assigned' | 'in-use' | 'maintenance' | 'retired' | string;
  
  // Financial & Depreciation
  purchaseDate?: string;
  acquisitionDate?: string;
  purchasePrice?: number;
  acquisitionCost?: number;
  currentValue?: number;
  depreciationRate?: number;
  depreciationMethod?: 'straight-line' | 'accelerated' | 'units-of-production' | string;
  eolDate?: string; // End of life
  
  // Identification
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  
  // Maintenance & Compliance
  warrantyExpiration?: string;
  nextMaintenanceDate?: string;
  lastMaintenanceDate?: string;
  maintenanceSchedule?: string;
  
  // Audit & Compliance
  nextAuditDate?: string;
  lastAuditDate?: string;
  auditStatus?: 'pending' | 'in-progress' | 'completed' | 'discrepancy' | string;
  complianceStatus?: 'compliant' | 'non-compliant' | 'pending-review' | string;
  riskRegistryLink?: string;
  
  // Assignment History & Custody Chain
  assignmentHistory?: AssignmentRecord[];
  custodyChain?: CustodyRecord[];
  checkInOutHistory?: CheckInOutRecord[];
  
  // Offboarding
  offboardingStatus?: 'active' | 'pending-return' | 'returned' | 'missing' | string;
  offboardingDate?: string;
  returnedDate?: string;
  returnedCondition?: string;
  
  // Request Management
  requestable?: boolean;
  requestStatus?: 'available' | 'requested' | 'checked-out' | string;
  
  // Metadata
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  imageUrl?: string;
}

export interface AssignmentRecord {
  id: string;
  assetId: number;
  assignedTo: string;
  assignedToEmployee?: { id: string; name: string };
  assignedDate: string;
  unassignedDate?: string;
  assignedBy: string;
  reason?: string;
}

export interface CustodyRecord {
  id: string;
  assetId: number;
  custodian: string;
  custodianType: 'employee' | 'department' | 'location' | string;
  receivedDate: string;
  releasedDate?: string;
  condition: string;
  signedBy?: string;
  notes?: string;
}

export interface CheckInOutRecord {
  id: string;
  assetId: number;
  type: 'check-out' | 'check-in';
  checkedOutTo?: string;
  checkedOutDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  checkedBy: string;
  condition?: string;
  notes?: string;
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

export interface AssetStats {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  disposedAssets: number;
  totalValue: number;
  depreciationRate: number;
}


export interface ValuationRecord {
  id: number;
  assetId: number;
  assetName: string;
  previousValue: number;
  currentValue: number;
  valuationDate: string;
  valuationMethod: string;
  valuedBy: string;
  notes?: string;
}