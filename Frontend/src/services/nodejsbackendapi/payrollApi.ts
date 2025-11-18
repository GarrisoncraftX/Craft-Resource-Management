import { apiClient } from '@/utils/apiClient';

// Types for Payroll API
export interface PayrollRecord {
  id: number;
  userId: number;
  period: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  netPay: number;
  status: 'Processed' | 'Pending' | 'Failed';
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePayrollRecordRequest {
  userId: number;
  period: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  netPay: number;
  status?: 'Processed' | 'Pending' | 'Failed';
}

export interface UpdatePayrollRecordRequest {
  userId?: number;
  period?: string;
  basicSalary?: number;
  allowances?: number;
  overtime?: number;
  deductions?: number;
  netPay?: number;
  status?: 'Processed' | 'Pending' | 'Failed';
}

class PayrollApiService {
  // Create a new payroll record
  async createPayrollRecord(record: CreatePayrollRecordRequest): Promise<PayrollRecord> {
    return apiClient.post('/api/payroll', record);
  }

  // Get payroll records by user ID
  async getPayrollRecordsByUser(userId: number): Promise<PayrollRecord[]> {
    return apiClient.get(`/api/payroll/user/${userId}`);
  }

  // Get all payroll records (admin function)
  async getAllPayrollRecords(): Promise<PayrollRecord[]> {
    return apiClient.get('/api/payroll');
  }

  // Get payroll record by ID
  async getPayrollRecordById(id: number): Promise<PayrollRecord> {
    return apiClient.get(`/api/payroll/${id}`);
  }

  // Update payroll record
  async updatePayrollRecord(id: number, record: UpdatePayrollRecordRequest): Promise<PayrollRecord> {
    return apiClient.put(`/api/payroll/${id}`, record);
  }

  // Delete payroll record
  async deletePayrollRecord(id: number): Promise<void> {
    return apiClient.delete(`/api/payroll/${id}`);
  }

  // Get payroll records by period
  async getPayrollRecordsByPeriod(period: string): Promise<PayrollRecord[]> {
    return apiClient.get(`/api/payroll/period/${period}`);
  }

  // Get payroll records by status
  async getPayrollRecordsByStatus(status: 'Processed' | 'Pending' | 'Failed'): Promise<PayrollRecord[]> {
    return apiClient.get(`/api/payroll/status/${status}`);
  }

  // Bulk create payroll records
  async bulkCreatePayrollRecords(records: CreatePayrollRecordRequest[]): Promise<PayrollRecord[]> {
    return apiClient.post('/api/payroll/bulk', { records });
  }

  // Process payroll for a specific period
  async processPayrollForPeriod(period: string): Promise<{ processed: number; failed: number }> {
    return apiClient.post('/api/payroll/process', { period });
  }
}

export const payrollApiService = new PayrollApiService();
