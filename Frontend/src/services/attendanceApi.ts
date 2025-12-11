import { apiClient } from '@/utils/apiClient';
import type {
  AttendanceRecord,
  AttendanceStats,
  AttendanceSearchParams,
  AttendanceClockInPayload,
  AttendanceClockOutPayload,
  QRToken,
  AttendanceStatus
} from '@/types/attendance';

class AttendanceApiService {
  // Generate QR token for kiosk display
  async generateQRToken(): Promise<QRToken> {
    return apiClient.get('/api/biometric/attendance/qr-display');
  }

  // Scan QR code for attendance
  async scanQRCode(token: string): Promise<{ success: boolean; message: string; action?: string }> {
    return apiClient.post('/api/biometric/attendance/qr-scan', { token });
  }

  // Clock in employee
  async clockIn(payload: AttendanceClockInPayload): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
    return apiClient.post('/api/biometric/attendance/clock-in', payload);
  }

  // Clock out employee
  async clockOut(payload: AttendanceClockOutPayload): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
    return apiClient.post('/api/biometric/attendance/clock-out', payload);
  }

  // Get attendance status for user
  async getAttendanceStatus(userId: string): Promise<AttendanceStatus> {
    return apiClient.get(`/api/biometric/attendance/status?user_id=${userId}`);
  }

  // Get all attendance records with optional filtering
  async getAttendanceRecords(params?: AttendanceSearchParams): Promise<AttendanceRecord[]> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.employee_name) queryParams.append('employee_name', params.employee_name);
      if (params.department) queryParams.append('department', params.department);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.status) queryParams.append('status', params.status);
    }

    const response = await apiClient.get(`/api/attendance/records?${queryParams.toString()}`);
    return response.records || [];
  }

  // Get attendance statistics
  async getAttendanceStats(date?: string, department?: string): Promise<AttendanceStats> {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    if (department) queryParams.append('department', department);

    const response = await apiClient.get(`/api/attendance/stats?${queryParams.toString()}`);
    return response.stats || {
      onTime: 0,
      late: 0,
      absent: 0,
      present: 0,
      totalEmployees: 0
    };
  }

  // Get currently checked-in employees
  async getCheckedInEmployees(): Promise<AttendanceRecord[]> {
    const response = await apiClient.get('/api/attendance/checked-in');
    return response.employees || [];
  }

  // Manual check-out for admin
  async manualCheckOut(userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/api/attendance/manual-checkout', { user_id: userId });
  }

  // Export attendance data
  async exportAttendanceData(params?: AttendanceSearchParams): Promise<Blob> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.employee_name) queryParams.append('employee_name', params.employee_name);
      if (params.department) queryParams.append('department', params.department);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.status) queryParams.append('status', params.status);
    }

    return apiClient.get(`/api/attendance/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
  }
}

export const attendanceApiService = new AttendanceApiService();
