export interface Visitor {
  visitor_id?: string;
  full_name: string;
  contact_number: string;
  email: string;
  visiting_employee_id: number;
  visiting_employee_name?: string;
  purpose_of_visit: string;
  check_in_time: string;
  check_out_time?: string;
  status: 'Checked In' | 'Checked Out';
  qr_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VisitorCheckInPayload {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  visiting_employee_id: number;
  purpose_of_visit: string;
  qr_token: string;
  company?: string;
}

export interface VisitorCheckOutPayload {
  visitor_id: string;
}

export interface QRToken {
  token: string;
  expires_at: string;
  created_at: string;
  check_in_url: string;
}

export interface AttendanceRecord {
  id?: number;
  employee_id: string;
  employee_name?: string;
  clock_in_time?: string;
  clock_out_time?: string;
  date: string;
  status: 'Clocked In' | 'Clocked Out';
  verification_method: 'face_id' | 'qr_code' | 'manual';
  created_at?: string;
  updated_at?: string;
}

export interface EntryPass {
  visitor_id: string;
  visitor_name: string;
  host_name: string;
  purpose: string;
  check_in_time: string;
  valid_until: string;
  issued_at: string;
  qr_code: string;
}
