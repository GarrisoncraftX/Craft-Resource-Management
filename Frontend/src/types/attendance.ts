export interface AttendanceRecord {
  id: number;
  user_id: string;
  employee_id?: string;
  employee_name: string;
  clock_in_time: string;
  clock_out_time?: string;
  clock_in_method?: string;
  clock_out_method?: string;
  method?: string;
  status: string;
  total_hours?: number;
  department?: string;
  designation?: string;
}

export interface ManualFallbackAttendance {
  id: number | string;
  user_id?: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  clock_in_time: string;
  clock_out_time?: string;
  audit_notes?: string;
}

export interface AttendanceMethodStats {
  qrCount: number;
  manualCount: number;
  biometricCount: number;
  totalAttendances: number;
  manualPercentage: number;
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