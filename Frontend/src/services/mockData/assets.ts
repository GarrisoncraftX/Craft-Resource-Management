export interface AssetStats {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  disposedAssets: number;
  totalValue: number;
  depreciationRate: number;
}

export interface AcquisitionRequest {
  id: string;
  item: string;
  department: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestedBy: string;
  date: string;
  priority: 'Low' | 'Medium' | 'High';
  justification?: string;
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

import type { Asset, MaintenanceRecord, DisposalRecord } from '@/types/asset';

export interface AssetStats {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  disposedAssets: number;
  totalValue: number;
  depreciationRate: number;
}

export interface AcquisitionRequest {
  id: string;
  item: string;
  department: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestedBy: string;
  date: string;
  priority: 'Low' | 'Medium' | 'High';
  justification?: string;
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

export const mockAssets: Asset[] = [
  {
    id: 1,
    assetTag: 'AST001',
    assetName: 'Dell Laptop OptiPlex 7090',
    description: 'IT Equipment',
    location: 'IT Department',
    status: 'Active',
    acquisitionDate: '2023-06-15',
    acquisitionCost: 1200,
    currentValue: 1100,
    condition: 'Good'
  },
  {
    id: 2,
    assetTag: 'AST002',
    assetName: 'Conference Room Table',
    description: 'Furniture',
    location: 'Meeting Room A',
    status: 'Active',
    acquisitionDate: '2022-03-20',
    acquisitionCost: 800,
    currentValue: 650,
    condition: 'Good'
  },
  {
    id: 3,
    assetTag: 'AST003',
    assetName: 'Industrial Printer HP LaserJet',
    description: 'Office Equipment',
    location: 'Admin Office',
    status: 'Maintenance',
    acquisitionDate: '2023-01-10',
    acquisitionCost: 1500,
    currentValue: 1200,
    condition: 'Fair'
  },
  {
    id: 4,
    assetTag: 'AST004',
    assetName: 'Server Rack Dell PowerEdge',
    description: 'IT Infrastructure',
    location: 'Server Room',
    status: 'Active',
    acquisitionDate: '2023-08-20',
    acquisitionCost: 5000,
    currentValue: 4200,
    condition: 'Excellent'
  },
  {
    id: 5,
    assetTag: 'AST005',
    assetName: 'Vehicle - Toyota Camry',
    description: 'Transportation',
    location: 'Parking Lot A',
    status: 'Active',
    acquisitionDate: '2022-11-10',
    acquisitionCost: 25000,
    currentValue: 18000,
    condition: 'Good'
  }
];

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 1,
    asset: 'Generator',
    type: 'Inspection',
    maintenanceDate: '2024-02-05',
    performedBy: 'Power Systems',
    status: 'Scheduled',
    description: 'Routine inspection'
  },
  {
    id: 2,
    asset: 'AC Unit',
    type: 'Repair',
    maintenanceDate: '2024-01-25',
    performedBy: 'HVAC Services',
    status: 'In Progress',
    description: 'Cooling system repair'
  },
  {
    id: 3,
    asset: 'Dell Laptop OptiPlex 7090',
    type: 'Preventive',
    maintenanceDate: '2024-02-10',
    performedBy: 'IT Support',
    status: 'Completed',
    description: 'Software updates and hardware check'
  }
];

export const mockDisposalRecords: DisposalRecord[] = [
  {
    id: 1,
    asset: 'Old Printer',
    method: 'Auction',
    disposalDate: '2024-01-28',
    status: 'Pending Approval',
    proceeds: 0
  },
  {
    id: 2,
    asset: 'Damaged Chair',
    method: 'Scrap',
    disposalDate: '2024-01-18',
    status: 'Completed',
    proceeds: 10
  },
  {
    id: 3,
    asset: 'Old Server Equipment',
    method: 'Recycling',
    disposalDate: '2024-02-01',
    status: 'In Progress',
    proceeds: 150
  }
];

export const mockAcquisitionRequests: AcquisitionRequest[] = [
  {
    id: 'AQ-001',
    item: 'Laptops (10)',
    department: 'IT',
    amount: 15000,
    status: 'Pending',
    requestedBy: 'John Tech',
    date: '2024-01-20',
    priority: 'High',
    justification: 'Replacement for outdated equipment'
  },
  {
    id: 'AQ-002',
    item: 'Office Chairs (25)',
    department: 'HR',
    amount: 3750,
    status: 'Approved',
    requestedBy: 'Jane HR',
    date: '2024-01-22',
    priority: 'Medium',
    justification: 'Ergonomic upgrade for staff comfort'
  },
  {
    id: 'AQ-003',
    item: 'Network Equipment',
    department: 'IT',
    amount: 8500,
    status: 'Completed',
    requestedBy: 'Mike Network',
    date: '2024-01-15',
    priority: 'High',
    justification: 'Infrastructure upgrade for better connectivity'
  }
];

export const mockValuationRecords: ValuationRecord[] = [
  {
    id: 1,
    assetId: 1,
    assetName: 'Dell Laptop OptiPlex 7090',
    previousValue: 1200,
    currentValue: 1100,
    valuationDate: '2024-01-15',
    valuationMethod: 'Depreciation',
    valuedBy: 'Asset Manager',
    notes: 'Standard depreciation applied'
  },
  {
    id: 2,
    assetId: 4,
    assetName: 'Server Rack Dell PowerEdge',
    previousValue: 4500,
    currentValue: 4200,
    valuationDate: '2024-01-20',
    valuationMethod: 'Market Value',
    valuedBy: 'External Appraiser',
    notes: 'Market assessment based on current technology standards'
  }
];

export const mockAssetStats: AssetStats = {
  totalAssets: mockAssets.length,
  activeAssets: mockAssets.filter(a => a.status === 'Active').length,
  maintenanceAssets: mockAssets.filter(a => a.status === 'Maintenance').length,
  disposedAssets: mockDisposalRecords.filter(d => d.status === 'Completed').length,
  totalValue: mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0),
  depreciationRate: 8.5
};

// Chart data for asset analytics
export const mockAssetsByCategory: AssetCategory[] = [
  { category: 'IT Equipment', count: 15, value: 18500 },
  { category: 'Furniture', count: 25, value: 12000 },
  { category: 'Vehicles', count: 8, value: 145000 },
  { category: 'Machinery', count: 12, value: 85000 },
  { category: 'Office Equipment', count: 18, value: 22000 }
];

export const mockAssetTrends: AssetTrend[] = [
  { month: 'Jan', acquisitions: 12, disposals: 3, value: 285000 },
  { month: 'Feb', acquisitions: 8, disposals: 5, value: 287000 },
  { month: 'Mar', acquisitions: 15, disposals: 2, value: 295000 },
  { month: 'Apr', acquisitions: 10, disposals: 4, value: 298000 },
  { month: 'May', acquisitions: 18, disposals: 6, value: 305000 },
  { month: 'Jun', acquisitions: 14, disposals: 3, value: 312000 }
];

export const mockMaintenanceCosts: MaintenanceCost[] = [
  { month: 'Jan', preventive: 2500, corrective: 1800, emergency: 500 },
  { month: 'Feb', preventive: 2200, corrective: 2100, emergency: 800 },
  { month: 'Mar', preventive: 2800, corrective: 1500, emergency: 300 },
  { month: 'Apr', preventive: 2600, corrective: 1900, emergency: 600 },
  { month: 'May', preventive: 3000, corrective: 1700, emergency: 400 },
  { month: 'Jun', preventive: 2900, corrective: 2000, emergency: 700 }
];