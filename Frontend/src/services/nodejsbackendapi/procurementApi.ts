import { apiClient } from '@/utils/apiClient';
import type {
  ProcurementRequest,
  Vendor,
  Tender,
  Bid,
  Contract,
  EvaluationCommittee,
  ProcurementActivityReport
} from '@/types/nodejsbackendapi/procurementTypes';

class ProcurementApiService {
  // Procurement Requests
  async createProcurementRequest(request: Omit<ProcurementRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcurementRequest> {
    return apiClient.post('/api/procurement/requests', request);
  }

  async getProcurementRequestById(id: string): Promise<ProcurementRequest> {
    return apiClient.get(`/api/procurement/requests/${id}`);
  }

  async getProcurementRequests(): Promise<ProcurementRequest[]> {
    return apiClient.get('/api/procurement/requests');
  }

  async updateRequestStatus(id: string, status: ProcurementRequest['status']): Promise<ProcurementRequest> {
    return apiClient.put(`/api/procurement/requests/${id}/status`, { status });
  }

  async addRequestApproval(id: string, approval: { approvedBy: string; comments?: string }): Promise<void> {
    return apiClient.post(`/api/procurement/requests/${id}/approvals`, approval);
  }

  async submitProcurementRequest(id: string, data?: Record<string, unknown>): Promise<ProcurementRequest> {
    return apiClient.post(`/api/procurement/requests/${id}/submit`, data || {});
  }

  async approveProcurementRequest(id: string, data?: Record<string, unknown>): Promise<ProcurementRequest> {
    return apiClient.post(`/api/procurement/requests/${id}/approve`, data || {});
  }

  async rejectProcurementRequest(id: string, data?: Record<string, unknown>): Promise<ProcurementRequest> {
    return apiClient.post(`/api/procurement/requests/${id}/reject`, data || {});
  }

  // Vendors
  async createVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> {
    return apiClient.post('/api/procurement/vendors', vendor);
  }

  async getVendorById(id: string): Promise<Vendor> {
    return apiClient.get(`/api/procurement/vendors/${id}`);
  }

  async getVendors(): Promise<Vendor[]> {
    return apiClient.get('/api/procurement/vendors');
  }

  async approveVendor(id: string, data?: Record<string, unknown>): Promise<Vendor> {
    return apiClient.post(`/api/procurement/vendors/${id}/approve`, data || {});
  }

  async blacklistVendor(id: string, data?: Record<string, unknown>): Promise<Vendor> {
    return apiClient.post(`/api/procurement/vendors/${id}/blacklist`, data || {});
  }

  // Tenders
  async createTender(tender: Omit<Tender, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tender> {
    return apiClient.post('/api/procurement/tenders', tender);
  }

  async getTenderById(id: string): Promise<Tender> {
    return apiClient.get(`/api/procurement/tenders/${id}`);
  }

  async getTenders(): Promise<Tender[]> {
    return apiClient.get('/api/procurement/tenders');
  }

  async publishTender(id: string, data?: Record<string, unknown>): Promise<Tender> {
    return apiClient.post(`/api/procurement/tenders/${id}/publish`, data || {});
  }

  async closeTender(id: string, data?: Record<string, unknown>): Promise<Tender> {
    return apiClient.post(`/api/procurement/tenders/${id}/close`, data || {});
  }

  // Bids
  async createBid(bid: Omit<Bid, 'id' | 'submittedAt' | 'evaluatedAt'>): Promise<Bid> {
    return apiClient.post('/api/procurement/bids', bid);
  }

  async getBidById(id: string): Promise<Bid> {
    return apiClient.get(`/api/procurement/bids/${id}`);
  }

  async getBids(): Promise<Bid[]> {
    return apiClient.get('/api/procurement/bids');
  }

  async evaluateBid(id: string, evaluation: { score: number; comments?: string }): Promise<Bid> {
    return apiClient.put(`/api/procurement/bids/${id}/evaluate`, evaluation);
  }

  // Evaluation Committees
  async getEvaluationCommittee(tenderId: string): Promise<EvaluationCommittee> {
    return apiClient.get(`/api/procurement/evaluation-committees/${tenderId}`);
  }

  async createOrUpdateEvaluationCommittee(committee: Omit<EvaluationCommittee, 'id' | 'createdAt'>): Promise<EvaluationCommittee> {
    return apiClient.post('/api/procurement/evaluation-committees', committee);
  }

  // Contracts
  async createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    return apiClient.post('/api/procurement/contracts', contract);
  }

  async getContractById(id: string): Promise<Contract> {
    return apiClient.get(`/api/procurement/contracts/${id}`);
  }

  async getContracts(): Promise<Contract[]> {
    return apiClient.get('/api/procurement/contracts');
  }

  async updateContract(id: string, contract: Partial<Contract>): Promise<Contract> {
    return apiClient.put(`/api/procurement/contracts/${id}`, contract);
  }

  async amendContract(id: string, amendment: { description: string; amount?: number }): Promise<Contract> {
    return apiClient.post(`/api/procurement/contracts/${id}/amend`, amendment);
  }

  // Reports and Audit Trails
  async getProcurementActivityReport(): Promise<ProcurementActivityReport> {
    return apiClient.get('/api/procurement/reports/activity');
  }

  async getAuditTrails(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/procurement/audit-trails');
  }
}

export const procurementApiService = new ProcurementApiService();
