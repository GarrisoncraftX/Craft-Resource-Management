export interface Asset {
  id: number;
  assetName: string;
  assetTag?: string;
  category?: string;
  description?: string;
  location?: string;
  purchaseDate?: string;
  acquisitionDate?: string;
  value?: number;
  acquisitionCost?: number;
  currentValue?: number;
  status?: string;
  condition: string;
}

export interface MaintenanceRecord {
  id: number;
  asset: string;
  type: string;
  maintenanceDate: string;
  performedBy: string;
  description: string;
  status: string;
}

export interface DisposalRecord {
  id: number;
  asset: string;
  method: string;
  disposalDate: string;
  status: string;
  proceeds?: number;
}

export interface AssetStatistics {
  total: number;
  totalValue?: number;
  underMaintenance?: number;
  depreciationYtd?: number;
  byCategory?: Record<string, number>;
  byStatus?: Record<string, number>;
}
