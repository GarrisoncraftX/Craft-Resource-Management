export interface Asset {
  id: number;
  assetName: string;
  category?: string;
  location?: string;
  purchaseDate?: string; // ISO string
  value?: number;
  status?: string; // e.g. "Active" | "Maintenance" | "Disposed"
  condition: string; // e.g. "New" | "Good" | "Fair" | "Poor"
  
}

export interface AssetStatistics {
  total: number;
  totalValue?: number;
  underMaintenance?: number;
  depreciationYtd?: number;
  byCategory?: Record<string, number>;
  byStatus?: Record<string, number>;
}
