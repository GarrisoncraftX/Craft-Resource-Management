import { apiClient } from '@/utils/apiClient';
import type { Visitor, VisitorCheckInPayload, VisitorCheckOutPayload, QRToken, EntryPass } from '@/types/visitor';

class VisitorApiService {
  // Generate dynamic QR token for kiosk
  async generateQRToken(): Promise<QRToken> {
    return apiClient.post('/api/visitors/generate-token', {});
  }

  // Validate QR token
  async validateQRToken(token: string): Promise<{ valid: boolean; message?: string }> {
    return apiClient.post('/api/visitors/validate-token', { token });
  }

  // Check in visitor
  async checkInVisitor(payload: VisitorCheckInPayload): Promise<Visitor> {
    return apiClient.post('/api/visitors/checkin', payload);
  }

  // Check out visitor
  async checkOutVisitor(payload: VisitorCheckOutPayload): Promise<{ message: string }> {
    return apiClient.post('/api/visitors/checkout', payload);
  }

  // Get all visitors
  async getAllVisitors(): Promise<Visitor[]> {
    return apiClient.get('/api/visitors/list');
  }

  // Get active visitors (currently checked in)
  async getActiveVisitors(): Promise<Visitor[]> {
    return apiClient.get('/api/visitors/active');
  }

  // Get visitor by ID
  async getVisitorById(visitorId: number): Promise<Visitor> {
    return apiClient.get(`/api/visitors/${visitorId}`);
  }

  // Search visitors
  async searchVisitors(params: {
    name?: string;
    host?: string;
    date?: string;
  }): Promise<Visitor[]> {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.host) queryParams.append('host', params.host);
    if (params.date) queryParams.append('date', params.date);

    return apiClient.get(`/api/visitors/search?${queryParams.toString()}`);
  }

  // Generate entry pass for visitor
  async generateEntryPass(visitorId: number): Promise<EntryPass> {
    return apiClient.post('/api/visitors/entry-pass', { visitor_id: visitorId });
  }
}

export const visitorApiService = new VisitorApiService();
