export interface AttendanceRecord {
  id: string;
  user_id: string;
  employee_id?: string;
  employee_name: string;
  department?: string;
  designation?: string;
  clock_in_time: string;
  clock_out_time?: string;
  total_hours?: number;
  status: 'present' | 'absent' | 'late' | 'early_out' | 'incomplete';
  clock_in_method?: string;
  clock_out_method?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceStats {
  onTime: number;
  late: number;
  absent: number;
  present: number;
  totalEmployees: number;
}

export interface AttendanceSearchParams {
  employee_name?: string;
  department?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
}

export interface AttendanceClockInPayload {
  user_id: string;
  method: 'qr' | 'manual' | 'biometric';
  location?: string;
}

export interface AttendanceClockOutPayload {
  user_id: string;
  method: 'qr' | 'manual' | 'biometric';
}

export interface QRToken {
  token: string;
  expires_at: string;
  qr_url: string;
}

export interface AttendanceStatus {
  can_clock_in: boolean;
  can_clock_out: boolean;
  last_action?: 'clock_in' | 'clock_out';
  last_timestamp?: string;
}
