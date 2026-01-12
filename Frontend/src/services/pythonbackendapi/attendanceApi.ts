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
  async getAttendanceRecords(params?: AttendanceSearchParams & { user_id?: string }): Promise<AttendanceRecord[]> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.employee_name) queryParams.append('employee_name', params.employee_name);
      if (params.department) queryParams.append('department', params.department);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.status) queryParams.append('status', params.status);
      if (params.user_id) queryParams.append('user_id', params.user_id);
    }

    const response = await apiClient.get(`/api/biometric/attendance/records?${queryParams.toString()}`);
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

  // Manual fallback attendances
  async getManualFallbackAttendances(): Promise<any[]> {
    const response = await apiClient.get('/api/attendance/manual-fallbacks');
    return response.attendances || [];
  }

  async getAttendancesByMethod(method: string): Promise<any[]> {
    const response = await apiClient.get(`/api/attendance/by-method/${method}`);
    return response.attendances || [];
  }

  async flagAttendanceForAudit(attendanceId: number, auditNotes: string): Promise<any> {
    return apiClient.post(`/api/attendance/${attendanceId}/flag-audit`, { auditNotes });
  }

  async getManualFallbacksByDateRange(startDate: string, endDate: string): Promise<any[]> {
    const response = await apiClient.get(`/api/attendance/manual-fallbacks/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    return response.attendances || [];
  }

  async getUserAttendanceByDateRange(userId: number, startDate: string, endDate: string): Promise<any[]> {
    const response = await apiClient.get(`/api/attendance/user/${userId}/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    return response.attendances || [];
  }

  async getBuddyPunchReport(): Promise<any> {
    const response = await apiClient.get('/api/attendance/buddy-punch-report');
    return response.report || {};
  }

  async flagBuddyPunchRisk(attendanceId: number, reason: string): Promise<any> {
    return apiClient.post(`/api/attendance/${attendanceId}/buddy-punch-flag`, { reason });
  }

  async getAttendanceMethodStatistics(): Promise<any> {
    const response = await apiClient.get('/api/attendance/method-statistics');
    return response.stats || {};
  }

  async reviewAttendance(attendanceId: number, hrUserId: number, notes: string): Promise<any> {
    return apiClient.post(`/api/attendance/${attendanceId}/review`, { hrUserId, notes });
  }
}

export const attendanceApiService = new AttendanceApiService();

// ============================================================================
// WRAPPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================================================
export async function fetchAttendance(userId: string): Promise<any[]> {
  return attendanceApiService.getAttendanceRecords({ user_id: userId });
}

export async function getManualFallbackAttendances(): Promise<any[]> {
  return attendanceApiService.getManualFallbackAttendances();
}

export async function getAttendancesByMethod(method: string): Promise<any[]> {
  return attendanceApiService.getAttendancesByMethod(method);
}

export async function flagAttendanceForAudit(attendanceId: number, auditNotes: string): Promise<any> {
  return attendanceApiService.flagAttendanceForAudit(attendanceId, auditNotes);
}

export async function getManualFallbacksByDateRange(startDate: string, endDate: string): Promise<any[]> {
  return attendanceApiService.getManualFallbacksByDateRange(startDate, endDate);
}

export async function getUserAttendanceByDateRange(userId: number, startDate: string, endDate: string): Promise<any[]> {
  return attendanceApiService.getUserAttendanceByDateRange(userId, startDate, endDate);
}

export async function getBuddyPunchReport(): Promise<any> {
  return attendanceApiService.getBuddyPunchReport();
}

export async function flagBuddyPunchRisk(attendanceId: number, reason: string): Promise<any> {
  return attendanceApiService.flagBuddyPunchRisk(attendanceId, reason);
}

export async function getAttendanceMethodStatistics(): Promise<any> {
  return attendanceApiService.getAttendanceMethodStatistics();
}

export async function reviewAttendance(attendanceId: number, hrUserId: number, notes: string): Promise<any> {
  return attendanceApiService.reviewAttendance(attendanceId, hrUserId, notes);
}

export const mapAttendanceToUI = (attendanceData: any[]) => {
  return attendanceData.map((record: any) => {
    const clockInDate = record.clock_in_time ? new Date(record.clock_in_time) : null;
    const clockOutDate = record.clock_out_time ? new Date(record.clock_out_time) : null;
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC' 
      });
    };
    
    return {
      date: clockInDate ? clockInDate.toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'N/A',
      checkIn: clockInDate ? formatTime(clockInDate) : '-',
      checkOut: clockOutDate ? formatTime(clockOutDate) : '-',
      totalHours: record.total_hours ? Number(record.total_hours).toFixed(2) : '0.00',
      status: clockOutDate ? 'Present' : 'Incomplete',
      clock_in_method: record.clock_in_method || 'N/A',
      clock_out_method: record.clock_out_method || 'N/A'
    };
  });
};
