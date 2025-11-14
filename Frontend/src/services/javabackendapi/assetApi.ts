import { apiClient } from '../../utils/apiClient';

// Types for Asset API
export interface Asset {
  id?: number;
  name: string;
  description: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  location: string;
  status: string;
  depreciationRate: number;
  usefulLife: number;
}

export interface MaintenanceRecord {
  id?: number;
  assetId: number;
  maintenanceDate: string;
  description: string;
  cost: number;
  performedBy: string;
  nextMaintenanceDate?: string;
}

export interface DisposalRecord {
  id?: number;
  assetId: number;
  disposalDate: string;
  reason: string;
  salePrice?: number;
  buyer?: string;
}

class AssetApiService {
  // Asset endpoints
  async createAsset(asset: Asset): Promise<Asset> {
    return apiClient.post('/assets', asset);
  }

  async getAllAssets(): Promise<Asset[]> {
    return apiClient.get('/assets');
  }

  async getAssetById(id: number): Promise<Asset> {
    return apiClient.get(`/assets/${id}`);
  }

  async updateAsset(id: number, asset: Asset): Promise<Asset> {
    return apiClient.put(`/assets/${id}`, asset);
  }

  async deleteAsset(id: number): Promise<void> {
    return apiClient.delete(`/assets/${id}`);
  }

  // MaintenanceRecord endpoints
  async createMaintenanceRecord(record: MaintenanceRecord): Promise<MaintenanceRecord> {
    return apiClient.post('/assets/maintenance-records', record);
  }

  async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return apiClient.get('/assets/maintenance-records');
  }

  async getMaintenanceRecordById(id: number): Promise<MaintenanceRecord> {
    return apiClient.get(`/assets/maintenance-records/${id}`);
  }

  async updateMaintenanceRecord(id: number, record: MaintenanceRecord): Promise<MaintenanceRecord> {
    return apiClient.put(`/assets/maintenance-records/${id}`, record);
  }

  async deleteMaintenanceRecord(id: number): Promise<void> {
    return apiClient.delete(`/assets/maintenance-records/${id}`);
  }

  // DisposalRecord endpoints
  async createDisposalRecord(record: DisposalRecord): Promise<DisposalRecord> {
    return apiClient.post('/assets/disposal-records', record);
  }

  async getAllDisposalRecords(): Promise<DisposalRecord[]> {
    return apiClient.get('/assets/disposal-records');
  }

  async getDisposalRecordById(id: number): Promise<DisposalRecord> {
    return apiClient.get(`/assets/disposal-records/${id}`);
  }

  async updateDisposalRecord(id: number, record: DisposalRecord): Promise<DisposalRecord> {
    return apiClient.put(`/assets/disposal-records/${id}`, record);
  }

  async deleteDisposalRecord(id: number): Promise<void> {
    return apiClient.delete(`/assets/disposal-records/${id}`);
  }
}

export const assetApiService = new AssetApiService();
