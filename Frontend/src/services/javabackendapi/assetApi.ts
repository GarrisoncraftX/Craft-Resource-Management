import { apiClient } from '@/utils/apiClient';
import { 
  mockAssets, 
  mockMaintenanceRecords, 
  mockDisposalRecords, 
} from '@/services/mockData/assets';
import type { Asset, MaintenanceRecord, DisposalRecord, MaintenanceCost } from '@/types/javabackendapi/assetTypes';

const API_BASE = '/api/assets';

class AssetApiService {
  private async handleApiCall<T>(apiCall: () => Promise<T>, fallback: T): Promise<T> {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.warn('Asset API call failed, using fallback data:', error);
      return fallback;
    }
  }

  // Assets
  async getAllAssets(): Promise<Asset[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}`),
      mockAssets
    );
  }

  async getAssetById(id: number): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/${id}`),
      mockAssets.find(a => a.id === id) || mockAssets[0]
    );
  }

  async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.post(`${API_BASE}`, asset),
      { ...asset, id: Date.now() }
    );
  }

  async updateAsset(id: number, asset: Partial<Asset>): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.put(`${API_BASE}/${id}`, asset),
      { ...mockAssets[0], ...asset, id }
    );
  }

  async deleteAsset(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`${API_BASE}/${id}`),
      undefined
    );
  }

  async checkoutAsset(id: number, assignedTo: number, assignedType: string, note?: string): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.post(`${API_BASE}/${id}/checkout`, { assigned_to: assignedTo, assigned_type: assignedType, note }),
      mockAssets[0]
    );
  }

  async checkinAsset(id: number, note?: string): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.post(`${API_BASE}/${id}/checkin`, { note }),
      mockAssets[0]
    );
  }


  // Maintenance
  async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/maintenance-records`),
      mockMaintenanceRecords
    );
  }

  async getMaintenanceRecordById(id: number): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/maintenance-records/${id}`),
      mockMaintenanceRecords.find(r => r.id === id) || mockMaintenanceRecords[0]
    );
  }

  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.post(`${API_BASE}/maintenance-records`, record),
      { ...record, id: Date.now() }
    );
  }

  async updateMaintenanceRecord(id: number, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.put(`${API_BASE}/maintenance-records/${id}`, record),
      { ...mockMaintenanceRecords[0], ...record, id }
    );
  }

  async deleteMaintenanceRecord(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`${API_BASE}/maintenance-records/${id}`),
      undefined
    );
  }

  async getMaintenanceCosts(): Promise<MaintenanceCost[]> {
    const mockCosts: MaintenanceCost[] = [
      { month: 'Jan', preventive: 2500, corrective: 1800, emergency: 500 },
      { month: 'Feb', preventive: 2200, corrective: 2100, emergency: 800 },
      { month: 'Mar', preventive: 2800, corrective: 1500, emergency: 300 },
      { month: 'Apr', preventive: 2600, corrective: 1900, emergency: 600 },
      { month: 'May', preventive: 3000, corrective: 1700, emergency: 400 },
      { month: 'Jun', preventive: 2900, corrective: 2000, emergency: 700 }
    ];
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/maintenance/costs`),
      mockCosts
    );
  }

  // Disposal
  async getAllDisposalRecords(): Promise<DisposalRecord[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/disposal-records`),
      mockDisposalRecords
    );
  }

  async getDisposalRecordById(id: number): Promise<DisposalRecord> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/disposal-records/${id}`),
      mockDisposalRecords.find(r => r.id === id) || mockDisposalRecords[0]
    );
  }

  async createDisposalRecord(record: Omit<DisposalRecord, 'id'>): Promise<DisposalRecord> {
    return this.handleApiCall(
      () => apiClient.post(`${API_BASE}/disposal-records`, record),
      { ...record, id: Date.now() }
    );
  }

  async updateDisposalRecord(id: number, record: Partial<DisposalRecord>): Promise<DisposalRecord> {
    return this.handleApiCall(
      () => apiClient.put(`${API_BASE}/disposal-records/${id}`, record),
      { ...mockDisposalRecords[0], ...record, id }
    );
  }

  async deleteDisposalRecord(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`${API_BASE}/disposal-records/${id}`),
      undefined
    );
  }



  async getAssetCounts(): Promise<Record<string, number>> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/counts`),
      { 'list-all': 0, deployed: 0, 'ready-to-deploy': 0, pending: 0, 'un-deployable': 0, archived: 0 }
    );
  }

  // Settings
  async getAllCategories(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/categories`),
      []
    );
  }

  async getAllManufacturers(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/manufacturers`),
      []
    );
  }

  async getAllSuppliers(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/suppliers`),
      []
    );
  }

  async getAllLocations(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/locations`),
      []
    );
  }

  async getAllModels(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/models`),
      []
    );
  }

  async getAllStatusLabels(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/status-labels`),
      []
    );
  }

  async getAllDepreciations(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/depreciations`),
      []
    );
  }

  async getAllCompanies(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/companies`),
      []
    );
  }

  async getAllDepartments(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/departments`),
      []
    );
  }

  // Reports
  async getDepreciationReport(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/reports/depreciation`),
      []
    );
  }

  async getMaintenanceReport(): Promise<any[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/reports/maintenance`),
      []
    );
  }
}

export const assetApiService = new AssetApiService();

// ============================================================================
// WRAPPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================
export async function fetchAssets(): Promise<Asset[]> {
  return assetApiService.getAllAssets();
}

export async function fetchAssetById(id: number | string): Promise<Asset> {
  return assetApiService.getAssetById(Number(id));
}

export async function createAssetRecord(asset: Partial<Asset>): Promise<Asset> {
  return assetApiService.createAsset(asset as Omit<Asset, 'id'>);
}

export async function updateAssetRecord(id: number | string, asset: Partial<Asset>): Promise<Asset> {
  return assetApiService.updateAsset(Number(id), asset);
}

export async function deleteAssetRecord(id: number | string): Promise<void> {
  return assetApiService.deleteAsset(Number(id));
}

export async function fetchMaintenanceRecords() {
  return assetApiService.getAllMaintenanceRecords();
}

export async function createMaintenanceRecordItem(record: MaintenanceRecord) {
  return assetApiService.createMaintenanceRecord(record);
}

export async function updateMaintenanceRecordItem(id: number | string, record: unknown) {
  return assetApiService.updateMaintenanceRecord(Number(id), record);
}

export async function deleteMaintenanceRecordItem(id: number | string) {
  return assetApiService.deleteMaintenanceRecord(Number(id));
}

export async function fetchDisposalRecords() {
  return assetApiService.getAllDisposalRecords();
}

export async function createDisposalRecordItem(record: DisposalRecord) {
  return assetApiService.createDisposalRecord(record);
}

export async function updateDisposalRecordItem(id: number | string, record: unknown) {
  return assetApiService.updateDisposalRecord(Number(id), record);
}

export async function deleteDisposalRecordItem(id: number | string) {
  return assetApiService.deleteDisposalRecord(Number(id));
}
