import { apiClient } from '@/utils/apiClient';

// Types for Revenue API
export interface TaxAssessment {
  id?: number;
  taxpayerId: string;
  taxYear: number;
  assessedAmount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
}

export interface RevenueCollection {
  id?: number;
  taxpayerId: string;
  amount: number;
  collectionDate: string;
  paymentMethod: string;
  referenceNumber: string;
}

class RevenueApiService {
  // TaxAssessment endpoints
  async createTaxAssessment(assessment: TaxAssessment): Promise<TaxAssessment> {
    return apiClient.post('/revenue/tax-assessments', assessment);
  }

  async getAllTaxAssessments(): Promise<TaxAssessment[]> {
    return apiClient.get('/revenue/tax-assessments');
  }

  async getTaxAssessmentById(id: number): Promise<TaxAssessment> {
    return apiClient.get(`/revenue/tax-assessments/${id}`);
  }

  async updateTaxAssessment(id: number, assessment: TaxAssessment): Promise<TaxAssessment> {
    return apiClient.put(`/revenue/tax-assessments/${id}`, assessment);
  }

  async deleteTaxAssessment(id: number): Promise<void> {
    return apiClient.delete(`/revenue/tax-assessments/${id}`);
  }

  // RevenueCollection endpoints
  async createRevenueCollection(collection: RevenueCollection): Promise<RevenueCollection> {
    return apiClient.post('/revenue/revenue-collections', collection);
  }

  async getAllRevenueCollections(): Promise<RevenueCollection[]> {
    return apiClient.get('/revenue/revenue-collections');
  }

  async getRevenueCollectionById(id: number): Promise<RevenueCollection> {
    return apiClient.get(`/revenue/revenue-collections/${id}`);
  }

  async updateRevenueCollection(id: number, collection: RevenueCollection): Promise<RevenueCollection> {
    return apiClient.put(`/revenue/revenue-collections/${id}`, collection);
  }

  async deleteRevenueCollection(id: number): Promise<void> {
    return apiClient.delete(`/revenue/revenue-collections/${id}`);
  }
}

export const revenueApiService = new RevenueApiService();

// ============================================================================
// WRAPPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================
export async function createTaxAssessmentRecord(record: TaxAssessment) {
  return revenueApiService.createTaxAssessment(record);
}

export async function fetchTaxAssessments() {
  return revenueApiService.getAllTaxAssessments();
}

export async function fetchTaxAssessmentById(id: number | string) {
  return revenueApiService.getTaxAssessmentById(Number(id));
}

export async function updateTaxAssessmentRecord(id: number | string, record: TaxAssessment) {
  return revenueApiService.updateTaxAssessment(Number(id), record);
}

export async function deleteTaxAssessmentRecord(id: number | string) {
  return revenueApiService.deleteTaxAssessment(Number(id));
}

export async function createRevenueCollectionRecord(record: RevenueCollection) {
  return revenueApiService.createRevenueCollection(record);
}

export async function fetchRevenueCollections() {
  return revenueApiService.getAllRevenueCollections();
}

export async function fetchRevenueCollectionById(id: number | string) {
  return revenueApiService.getRevenueCollectionById(Number(id));
}

export async function updateRevenueCollectionRecord(id: number | string, record: RevenueCollection) {
  return revenueApiService.updateRevenueCollection(Number(id), record);
}

export async function deleteRevenueCollectionRecord(id: number | string) {
  return revenueApiService.deleteRevenueCollection(Number(id));
}
