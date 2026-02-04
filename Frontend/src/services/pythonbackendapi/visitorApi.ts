import { apiClient } from '@/utils/apiClient';
import type { Visitor, VisitorCheckInPayload, VisitorCheckOutPayload, QRToken, EntryPass } from '@/types/pythonbackendapi/visitorTypes';

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
    const response = await apiClient.get('/api/visitors/list');
    const logs = response.visitor_logs || [];
    return logs.map(log => ({
      visitor_id: log.id,
      full_name: log.visitor_name || '',
      contact_number: log.phone || '',
      email: log.email || '',
      visiting_employee_name: log.host_name,
      purpose_of_visit: log.purpose || '',
      check_in_time: log.check_in_time || '',
      check_out_time: log.check_out_time,
      status: log.status === 'checked_in' ? 'Checked In' as const : 'Checked Out' as const
    }));
  }

  // Get active visitors (currently checked in)
  async getActiveVisitors(): Promise<Visitor[]> {
    const response = await apiClient.get('/api/visitors/active');
    const visitors = response.active_visitors || [];
    return visitors.map(visitor => ({
      visitor_id: visitor.id,
      full_name: visitor.visitor_name || '',
      contact_number: visitor.phone || '',
      email: visitor.email || '',
      visiting_employee_name: visitor.host_name,
      purpose_of_visit: visitor.purpose || '',
      check_in_time: visitor.check_in_time || '',
      status: 'Checked In' as const
    }));
  }

  // Get visitor by ID
  async getVisitorById(visitorId: string): Promise<Visitor> {
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

    const response = await apiClient.get(`/api/visitors/search?${queryParams.toString()}`);
    const logs = response.visitor_logs || [];
    return logs.map(log => ({
      visitor_id: log.id,
      full_name: log.visitor_name || '',
      contact_number: log.phone || '',
      email: log.email || '',
      visiting_employee_name: log.host_name,
      purpose_of_visit: log.purpose || '',
      check_in_time: log.check_in_time || '',
      check_out_time: log.check_out_time,
      status: log.status === 'checked_in' ? 'Checked In' as const : 'Checked Out' as const
    }));
  }

  // Generate entry pass for visitor
  async generateEntryPass(visitorId: string): Promise<EntryPass> {
    const response = await apiClient.post('/api/visitors/entry-pass', { visitor_id: visitorId });
    return response.entry_pass;
  }

  // Approve visitor
  async approveVisitor(visitorId: string): Promise<{ message: string }> {
    return apiClient.post('/api/visitors/approve', { visitor_id: visitorId });
  }

  // Reject visitor
  async rejectVisitor(visitorId: string, reason?: string): Promise<{ message: string }> {
    return apiClient.post('/api/visitors/reject', { visitor_id: visitorId, reason });
  }

  // Check visitor status
  async checkVisitorStatus(visitorId: string): Promise<any> {
    return apiClient.get(`/api/visitors/status?visitor_id=${visitorId}`);
  }
}

export const visitorApiService = new VisitorApiService();
