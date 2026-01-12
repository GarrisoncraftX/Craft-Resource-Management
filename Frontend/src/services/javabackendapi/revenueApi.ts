import { apiClient } from '@/utils/apiClient';
import type { TaxAssessment, RevenueCollection, BusinessPermit } from '@/types/javabackendapi/revenueTypes';

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

  // BusinessPermit endpoints
  async createBusinessPermit(permit: BusinessPermit): Promise<BusinessPermit> {
    return apiClient.post('/revenue/business-permits', permit);
  }

  async getAllBusinessPermits(): Promise<BusinessPermit[]> {
    return apiClient.get('/revenue/business-permits');
  }

  async getBusinessPermitById(id: number): Promise<BusinessPermit> {
    return apiClient.get(`/revenue/business-permits/${id}`);
  }

  async updateBusinessPermit(id: number, permit: BusinessPermit): Promise<BusinessPermit> {
    return apiClient.put(`/revenue/business-permits/${id}`, permit);
  }

  async deleteBusinessPermit(id: number): Promise<void> {
    return apiClient.delete(`/revenue/business-permits/${id}`);
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

export async function createBusinessPermitRecord(record: BusinessPermit) {
  return revenueApiService.createBusinessPermit(record);
}

export async function fetchBusinessPermits() {
  return revenueApiService.getAllBusinessPermits();
}

export async function fetchBusinessPermitById(id: number | string) {
  return revenueApiService.getBusinessPermitById(Number(id));
}

export async function updateBusinessPermitRecord(id: number | string, record: BusinessPermit) {
  return revenueApiService.updateBusinessPermit(Number(id), record);
}

export async function deleteBusinessPermitRecord(id: number | string) {
  return revenueApiService.deleteBusinessPermit(Number(id));
}
