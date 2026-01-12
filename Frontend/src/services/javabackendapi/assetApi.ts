import { apiClient } from '@/utils/apiClient';
import { 
  mockAssets, 
  mockMaintenanceRecords, 
  mockDisposalRecords, 
  mockAcquisitionRequests,
  type AcquisitionRequest,
  type ValuationRecord,
  type AssetStats,
  type AssetCategory,
  type AssetTrend,
  type MaintenanceCost
} from '@/services/mockData/assets';
import type { Asset, MaintenanceRecord, DisposalRecord } from '@/types/asset';

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
      () => apiClient.get('/assets'),
      mockAssets
    );
  }

  async getAssetById(id: number): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.get(`/assets/${id}`),
      mockAssets[0]
    );
  }

  async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.post('/assets', asset),
      { ...asset, id: Date.now() }
    );
  }

  async updateAsset(id: number, asset: Partial<Asset>): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.put(`/assets/${id}`, asset),
      { ...mockAssets[0], ...asset, id }
    );
  }

  async deleteAsset(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`/assets/${id}`),
      undefined
    );
  }

  // Asset Statistics
  async getAssetStats(): Promise<AssetStats> {
    const mockStats: AssetStats = {
      totalAssets: mockAssets.length,
      activeAssets: mockAssets.filter(a => a.status === 'Active').length,
      maintenanceAssets: mockAssets.filter(a => a.status === 'Maintenance').length,
      disposedAssets: 2,
      totalValue: mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0),
      depreciationRate: 8.5
    };
    return this.handleApiCall(
      () => apiClient.get('/assets/stats'),
      mockStats
    );
  }

  async getAssetsByCategory(): Promise<AssetCategory[]> {
    const mockCategories: AssetCategory[] = [
      { category: 'IT Equipment', count: 15, value: 18500 },
      { category: 'Furniture', count: 25, value: 12000 },
      { category: 'Vehicles', count: 8, value: 145000 },
      { category: 'Machinery', count: 12, value: 85000 },
      { category: 'Office Equipment', count: 18, value: 22000 }
    ];
    return this.handleApiCall(
      () => apiClient.get('/assets/by-category'),
      mockCategories
    );
  }

  async getAssetTrends(): Promise<AssetTrend[]> {
    const mockTrends: AssetTrend[] = [
      { month: 'Jan', acquisitions: 12, disposals: 3, value: 285000 },
      { month: 'Feb', acquisitions: 8, disposals: 5, value: 287000 },
      { month: 'Mar', acquisitions: 15, disposals: 2, value: 295000 },
      { month: 'Apr', acquisitions: 10, disposals: 4, value: 298000 },
      { month: 'May', acquisitions: 18, disposals: 6, value: 305000 },
      { month: 'Jun', acquisitions: 14, disposals: 3, value: 312000 }
    ];
    return this.handleApiCall(
      () => apiClient.get('/assets/trends'),
      mockTrends
    );
  }

  // Maintenance
  async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    return this.handleApiCall(
      () => apiClient.get('/assets/maintenance-records'),
      mockMaintenanceRecords
    );
  }

  async getMaintenanceRecordById(id: number): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.get(`/assets/maintenance-records/${id}`),
      mockMaintenanceRecords[0]
    );
  }

  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.post('/assets/maintenance-records', record),
      { ...record, id: Date.now() }
    );
  }

  async updateMaintenanceRecord(id: number, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.put(`/assets/maintenance-records/${id}`, record),
      { ...mockMaintenanceRecords[0], ...record, id }
    );
  }

  async deleteMaintenanceRecord(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`/assets/maintenance-records/${id}`),
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
      () => apiClient.get('/assets/maintenance/costs'),
      mockCosts
    );
  }

  // Disposal
  async getAllDisposalRecords(): Promise<DisposalRecord[]> {
    return this.handleApiCall(
      () => apiClient.get('/assets/disposal-records'),
      mockDisposalRecords
    );
  }

  async getDisposalRecordById(id: number): Promise<DisposalRecord> {
    return this.handleApiCall(
      () => apiClient.get(`/assets/disposal-records/${id}`),
      mockDisposalRecords[0]
    );
  }

  async createDisposalRecord(record: Omit<DisposalRecord, 'id'>): Promise<DisposalRecord> {
    return this.handleApiCall(
      () => apiClient.post('/assets/disposal-records', record),
      { ...record, id: Date.now() }
    );
  }

  async updateDisposalRecord(id: number, record: Partial<DisposalRecord>): Promise<DisposalRecord> {
    return this.handleApiCall(
      () => apiClient.put(`/assets/disposal-records/${id}`, record),
      { ...mockDisposalRecords[0], ...record, id }
    );
  }

  async deleteDisposalRecord(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`/assets/disposal-records/${id}`),
      undefined
    );
  }

  // Acquisition
  async getAcquisitionRequests(): Promise<AcquisitionRequest[]> {
    return this.handleApiCall(
      () => apiClient.get('/assets/acquisition-requests'),
      mockAcquisitionRequests
    );
  }

  async submitAcquisitionRequest(request: Omit<AcquisitionRequest, 'id'>): Promise<AcquisitionRequest> {
    return this.handleApiCall(
      () => apiClient.post('/assets/acquisition-requests', request),
      { ...request, id: `AQ-${Date.now()}` }
    );
  }

  async updateAcquisitionStatus(id: string, status: AcquisitionRequest['status']): Promise<AcquisitionRequest> {
    return this.handleApiCall(
      () => apiClient.put(`/assets/acquisition-requests/${id}`, { status }),
      { ...mockAcquisitionRequests[0], id, status }
    );
  }

  // Valuation
  async getValuationRecords(): Promise<ValuationRecord[]> {
    const mockRecords: ValuationRecord[] = [
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
      }
    ];
    return this.handleApiCall(
      () => apiClient.get('/assets/valuation'),
      mockRecords
    );
  }

  async createValuationRecord(record: Omit<ValuationRecord, 'id'>): Promise<ValuationRecord> {
    return this.handleApiCall(
      () => apiClient.post('/assets/valuation', record),
      { ...record, id: Date.now() }
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
  return assetApiService.createAsset(asset as any);
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

export async function createMaintenanceRecordItem(record: unknown) {
  return assetApiService.createMaintenanceRecord(record as any);
}

export async function updateMaintenanceRecordItem(id: number | string, record: unknown) {
  return assetApiService.updateMaintenanceRecord(Number(id), record as any);
}

export async function deleteMaintenanceRecordItem(id: number | string) {
  return assetApiService.deleteMaintenanceRecord(Number(id));
}

export async function fetchDisposalRecords() {
  return assetApiService.getAllDisposalRecords();
}

export async function createDisposalRecordItem(record: unknown) {
  return assetApiService.createDisposalRecord(record as any);
}

export async function updateDisposalRecordItem(id: number | string, record: unknown) {
  return assetApiService.updateDisposalRecord(Number(id), record as any);
}

export async function deleteDisposalRecordItem(id: number | string) {
  return assetApiService.deleteDisposalRecord(Number(id));
}

export async function fetchAcquisitionRequests() {
  return assetApiService.getAcquisitionRequests();
}

export async function submitAcquisitionRequestItem(request: unknown) {
  return assetApiService.submitAcquisitionRequest(request);
}