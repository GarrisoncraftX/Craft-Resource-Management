import { apiClient } from '@/utils/apiClient';
import { 
  mockAssets, 
  mockMaintenanceRecords, 
  mockDisposalRecords,
  mockCompanies,
  mockModels,
  mockStatusLabels,
  mockLocations,
  mockManufacturers,
  mockSuppliers,
  mockDepartments,
  mockMaintenanceReports,
} from '@/services/mockData/assets';
import type { Asset, MaintenanceRecord,  MaintenanceReportData, DisposalRecord, MaintenanceCost, Category, Manufacturer, Supplier, Location, AssetModel, StatusLabel, Depreciation, Company, Department, DepreciationReport, AssetAudit, MaintenanceRecordInput, License } from '@/types/javabackendapi/assetTypes';

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

// Asset Image Upload
  async uploadAssetImage(id: number, file: File): Promise<Asset> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${API_BASE}/${id}/image`, formData);
    return response;
  }

  // Assets
  async getAllAssets(): Promise<Asset[]> {
    return this.handleApiCall(
      async () => {
        const response = await apiClient.get(`${API_BASE}`);
        // Transform API response to match frontend Asset type
        return Array.isArray(response) ? response.map(asset => ({
          ...asset,
          assetName: asset.name || asset.assetName || asset.asset_name,
          assetTag: asset.asset_tag || asset.assetTag,
          status: asset.statusLabel?.name || asset.status,
        })) : response;
      },
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

  async checkinAsset(id: number, checkinData: Record<string, unknown>): Promise<Asset> {
    return this.handleApiCall(
      () => apiClient.post(`${API_BASE}/${id}/checkin`, checkinData),
      mockAssets[0]
    );
  }


  // Maintenance
  async getAllMaintenances(): Promise<MaintenanceReportData[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/maintenances`),
      []
    );
  }

  async getMaintenanceById(id: number): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/maintenances/${id}`),
      mockMaintenanceRecords.find(r => r.id === id) || mockMaintenanceRecords[0]
    );
  }

  async createMaintenance(record: MaintenanceRecordInput): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.post(`${API_BASE}/maintenances`, record),
      { ...record, id: Date.now() } as MaintenanceRecord
    );
  }

  async updateMaintenance(id: number, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return this.handleApiCall(
      () => apiClient.put(`${API_BASE}/maintenances/${id}`, record),
      { ...mockMaintenanceRecords[0], ...record, id }
    );
  }

  async deleteMaintenance(id: number): Promise<void> {
    return this.handleApiCall(
      () => apiClient.delete(`${API_BASE}/maintenances/${id}`),
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

  async getAssetStats(): Promise<Record<string, number>> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/stats`),
      { totalAssets: 0, activeAssets: 0, maintenanceAssets: 0, disposedAssets: 0, totalValue: 0, depreciationRate: 0 }
    );
  }

  async getAssetsByCategory(): Promise<Array<{ category: string; count: number }>> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/by-category`),
      []
    );
  }

  async getAssetTrends(): Promise<Array<{ month: string; total: number }>> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/trends`),
      []
    );
  }

  // Settings
  async getAllCategories(): Promise<Category[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/categories`),
      []
    );
  }

  async getAllManufacturers(): Promise<Manufacturer[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/manufacturers`),
      mockManufacturers
    );
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/suppliers`),
      mockSuppliers
    );
  }

  async getAllLocations(): Promise<Location[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/locations`),
      mockLocations
    );
  }

  async getAllModels(): Promise<AssetModel[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/models`),
      mockModels
    );
  }

  async getAllStatusLabels(): Promise<StatusLabel[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/status-labels`),
      mockStatusLabels
    );
  }

  async getAllDepreciations(): Promise<Depreciation[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/depreciations`),
      []
    );
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/companies`),
      mockCompanies
    );
  }

  async getAllDepartments(): Promise<Department[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/departments`),
      mockDepartments
    );
  }

  // Reports
  async getDepreciationReport(): Promise<DepreciationReport[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/reports/depreciation`),
      []
    );
  }

// Asset Audits
  async createAssetAudit(auditData: Record<string, unknown>): Promise<AssetAudit> {
    return this.handleApiCall(
      () => apiClient.post(`${API_BASE}/audits`, auditData),
      {} as AssetAudit
    );
  }

  async updateAssetAudit(id: number, auditData: Record<string, unknown>): Promise<AssetAudit> {
    return this.handleApiCall(
      () => apiClient.put(`${API_BASE}/audits/${id}`, auditData),
      {} as AssetAudit
    );
  }

  async getAllAssetAudits(): Promise<AssetAudit[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/audits`),
      []
    );
  }

  async getAssetAuditById(id: number): Promise<AssetAudit> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/audits/${id}`),
      {} as AssetAudit
    );
  }

  // Licenses
  async getAllLicenses(): Promise<License[]> {
    return this.handleApiCall(
      () => apiClient.get(`${API_BASE}/licenses`),
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
  return assetApiService.getAllMaintenances();
}

export async function createMaintenanceRecordItem(record: MaintenanceRecord) {
  const input: MaintenanceRecordInput = {
    ...record,
    asset: typeof record.asset === 'string' ? record.asset : String(record.asset.id)
  };
  return assetApiService.createMaintenance(input);
}

export async function updateMaintenanceRecordItem(id: number | string, record: unknown) {
  return assetApiService.updateMaintenance(Number(id), record);
}

export async function deleteMaintenanceRecordItem(id: number | string) {
  return assetApiService.deleteMaintenance(Number(id));
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

export async function uploadAssetImage(id: number | string, file: File) {
  return assetApiService.uploadAssetImage(Number(id), file);
}
