import { apiClient } from '@/utils/apiClient';

// Types for Legal API
export interface LegalCase {
  id?: number;
  caseNumber: string;
  title: string;
  description: string;
  status: string;
  assignedLawyer: string;
  filingDate: string;
  resolutionDate?: string;
}

export interface ComplianceRecord {
  id?: number;
  entity: string;
  regulation: string;
  complianceDate: string;
  status: string;
  notes?: string;
}

class LegalApiService {
  // LegalCase endpoints
  async createLegalCase(legalCase: LegalCase): Promise<LegalCase> {
    return apiClient.post('/legal/cases', legalCase);
  }

  async getAllLegalCases(): Promise<LegalCase[]> {
    return apiClient.get('/legal/cases');
  }

  async getLegalCaseById(id: number): Promise<LegalCase> {
    return apiClient.get(`/legal/cases/${id}`);
  }

  async updateLegalCase(id: number, legalCase: LegalCase): Promise<LegalCase> {
    return apiClient.put(`/legal/cases/${id}`, legalCase);
  }

  async deleteLegalCase(id: number): Promise<void> {
    return apiClient.delete(`/legal/cases/${id}`);
  }

  // ComplianceRecord endpoints
  async createComplianceRecord(record: ComplianceRecord): Promise<ComplianceRecord> {
    return apiClient.post('/legal/compliance-records', record);
  }

  async getAllComplianceRecords(): Promise<ComplianceRecord[]> {
    return apiClient.get('/legal/compliance-records');
  }

  async getComplianceRecordById(id: number): Promise<ComplianceRecord> {
    return apiClient.get(`/legal/compliance-records/${id}`);
  }

  async updateComplianceRecord(id: number, record: ComplianceRecord): Promise<ComplianceRecord> {
    return apiClient.put(`/legal/compliance-records/${id}`, record);
  }

  async deleteComplianceRecord(id: number): Promise<void> {
    return apiClient.delete(`/legal/compliance-records/${id}`);
  }
}

export const legalApiService = new LegalApiService();

// ============================================================================
// WRAPPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================
export async function createLegalCaseRecord(record: LegalCase) {
  return legalApiService.createLegalCase(record);
}

export async function fetchLegalCases() {
  return legalApiService.getAllLegalCases();
}

export async function updateLegalCaseRecord(id: number | string, record: LegalCase) {
  return legalApiService.updateLegalCase(Number(id), record);
}

export async function deleteLegalCaseRecord(id: number | string) {
  return legalApiService.deleteLegalCase(Number(id));
}

export async function fetchLegalCaseById(id: number | string) {
  return legalApiService.getLegalCaseById(Number(id));
}

export async function createComplianceRecordItem(record: ComplianceRecord) {
  return legalApiService.createComplianceRecord(record);
}

export async function fetchComplianceRecords() {
  return legalApiService.getAllComplianceRecords();
}

export async function fetchComplianceRecordById(id: number | string) {
  return legalApiService.getComplianceRecordById(Number(id));
}

export async function updateComplianceRecordItem(id: number | string, record: ComplianceRecord) {
  return legalApiService.updateComplianceRecord(Number(id), record);
}

export async function deleteComplianceRecordItem(id: number | string) {
  return legalApiService.deleteComplianceRecord(Number(id));
}
