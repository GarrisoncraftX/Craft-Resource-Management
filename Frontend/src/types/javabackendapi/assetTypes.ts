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
  category_id?: number;
  manufacturer_id?: number;
  supplier_id?: number;
  company_id?: number;
  product_key?: string;
  seats_total: number;
  seats_used: number;
  available_seats?: number;
  purchase_date?: string;
  expiration_date?: string;
  purchase_cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BaseInventoryItem {
  id: number;
  name: string;
  category_id?: number;
  manufacturer_id?: number;
  supplier_id?: number;
  company_id?: number;
  location_id?: number;
  item_no?: string;
  model_no?: string;
  serial?: string;
  min_qty: number;
  qty_total: number;
  qty_remaining: number;
  unit_cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Consumable {
  id: number;
  name: string;
  category_id?: number;
  manufacturer_id?: number;
  supplier_id?: number;
  company_id?: number;
  location_id?: number;
  item_no?: string;
  model_no?: string;
  min_qty: number;
  qty_total: number;
  qty_remaining: number;
  unit_cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Component {
  id: number;
  name: string;
  category_id?: number;
  manufacturer_id?: number;
  supplier_id?: number;
  company_id?: number;
  location_id?: number;
  model_no?: string;
  serial?: string;
  min_qty: number;
  qty_total: number;
  qty_remaining: number;
  unit_cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  type: string;
  qty: number;
  acceptance: boolean;
  useDefaultEULA: boolean;
}

export interface Company {
  id: string;
  name: string;
  email?: string;
  image?: string;
  assets: number;
  licenses: number;
  accessories: number;
  components: number;
}

export interface CustomField {
  id: number;
  name: string;
  helpText: string;
  format: string;
  isSortable?: boolean;
  isSearchable?: boolean;
  isFilterable?: boolean;
  isRequired?: boolean;
  isListColumn?: boolean;
  element: string;
  fieldsets: string[];
}

export interface Department {
  id: string;
  name: string;
  image?: string;
  manager?: string;
  location?: string;
  assets: number;
}

export interface Depreciation {
  id: number;
  name: string;
  term: string;
  floorValue: number;
  assets: number;
  assetModels: number;
  licenses: number;
}

export interface Location {
  id: string;
  name: string;
  image?: string;
  parent?: string;
  assets: number;
  licenses: number;
  accessories: number;
  components: number;
  address: string;
  city: string;
  state: string;
}

export interface AssetModel {
  id: string;
  name: string;
  image?: string;
  modelNo: string;
  minQty: number;
  assets: number;
  assigned: number;
  remaining: number;
  archived: number;
  category: string;
  eolRate?: string;
  fieldset?: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  image?: string;
  url?: string;
  supportUrl?: string;
  supportPhone?: string;
  supportEmail?: string;
  assets: number;
  licenses: number;
  accessories: number;
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

export interface StatusLabel {
  id: number;
  name: string;
  statusType: string;
  assets: number;
  chartColor: string;
  showInSideNav: boolean;
  defaultLabel: boolean;
}

export interface MaintenanceCost {
  month: string;
  preventive: number;
  corrective: number;
  emergency: number;
}


export interface Supplier {
  id: string;
  name: string;
  image?: string;
  url?: string;
  assets: number;
  components: number;
  licenses: number;
  accessories: number;
  address: string;
  city: string;
  state: string;
}


export interface RequestableItem {
  id: string;
  image?: string;
  assetTag: string;
  model: string;
  modelNo: string;
  assetName: string;
  serial: string;
  location: string;
  status: string;
  expectedCheckinDate?: string;
  cpu?: string;
}
export interface Asset {
  // Identification & Classification
  id: number;
  assetCode?: string;
  assetTag?: string;
  asset_tag?: string;
  name?: string;
  assetName?: string;
  asset_name?: string;
  description?: string;
  category?: string;
 
 
  // Model & Specifications
  model?: string;
  model_id?: number;
  modelNo?: string;
  model_no?: string;
  serial?: string;
  manufacturer?: string;
  supplier?: string;
  supplier_id?: number;
  company?: string;
  company_id?: number;
  location?: string;
  location_id?: number;
  rtd_location?: string;
  rtd_location_id?: number;
  status?: string;
  status_id?: number;
  statusLabel?: { id: number; name: string; statusType: string; color?: string };
  defaultLocation?: string;
  requestable?: boolean | number;
  warranty?: string;
  warrantyMonths?: number;
  warranty_months?: number;
  currentValue?: number;
  current_value?: number;
  assigned_to?: number;
  assigned_type?: string;

  //Audit
  expectedCheckinDate?: string;
  expected_checkin?: string;
  nextAuditDate?: string;
  next_audit_date?: string;
  byod?: boolean | number;
  orderNumber?: string;
  order_number?: string;
  purchaseDate?: string;
  purchase_date?: string;
  purchaseCost?: string | number;
  purchase_cost?: number;
  eolDate?: string;
  eol_date?: string;
  currency?: string;
 
 
// Metadata
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  imageUrl?: string;
  image?: string;
  lastAuditDate?: string;
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

export interface MaintenanceReport {
  id: number;
  company: string;
  assetTag: string;
  assetName: string;
  supplier: string;
  assetMaintenanceType: string;
  title: string;
  startDate: string;
  completionDate: string;
  assetMaintenanceTime: number;
  cost: number;
  location: string;
  defaultLocation: string;
  warranty: string;
  createdBy: string;
  notes: string;
}

export interface DepreciationReport {
  id: number;
  company: string;
  category: string;
  assetTag: string;
  model: string;
  modelNo: string;
  serial: string;
  depreciation: string;
  numberOfMonths: number;
  status: string;
  checkedOut: string;
  location: string;
  manufacturer: string;
  supplier: string;
  purchaseDate: string;
  currency: string;
  purchaseCost: number;
  orderNumber: string;
  eol: string;
  currentValue: number;
  monthlyDepreciation: number;
  diff: number;
  warrantyExpires: string;
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
