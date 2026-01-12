export interface AccessRule {
  id: string;
  role: string;
  door: string;
  schedule: string;
  status: string;
}

export interface SecurityIncident {
  id: string;
  type: string;
  location: string;
  date: string;
  status: string;
  severity: string;
  description?: string;
}

export interface IdCard {
  cardId: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  department: string;
  nationalId: string;
  phoneNumber: string;
  status: string;
  issueDate: string;
}

export interface GuardPost {
  id: string;
  post: string;
  guards: number;
  shift: string;
  status: string;
}

export interface SOP {
  id: string;
  title: string;
  category: string;
  version: string;
  lastUpdated: string;
  status: string;
  description?: string;
}

export interface GuardPost {
  id: string;
  post: string;
  guards: number;
  shift: string;
  status: string;
}

export interface SOP {
  id: string;
  title: string;
  category: string;
  version: string;
  lastUpdated: string;
  status: string;
  description?: string;
}
