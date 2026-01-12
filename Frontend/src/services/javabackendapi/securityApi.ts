import { apiClient } from '@/utils/apiClient';

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

class SecurityApiService {
  // Access Control
  async getAccessRules(): Promise<AccessRule[]> {
    return apiClient.get('/system/security/access-rules');
  }

  async createAccessRule(data: Omit<AccessRule, 'id'>): Promise<AccessRule> {
    return apiClient.post('/system/security/access-rules', data);
  }

  // Security Incidents
  async getSecurityIncidents(): Promise<SecurityIncident[]> {
    return apiClient.get('/system/security/incidents');
  }

  async createSecurityIncident(data: Omit<SecurityIncident, 'id'>): Promise<SecurityIncident> {
    return apiClient.post('/system/security/incidents', data);
  }

  // Guard Posts
  async getGuardPosts(): Promise<GuardPost[]> {
    return apiClient.get('/system/security/guard-posts');
  }

  async createGuardPost(data: Omit<GuardPost, 'id'>): Promise<GuardPost> {
    return apiClient.post('/system/security/guard-posts', data);
  }

  // SOPs
  async getSOPs(): Promise<SOP[]> {
    return apiClient.get('/system/security/sops');
  }

  async createSOP(data: Omit<SOP, 'id' | 'lastUpdated'>): Promise<SOP> {
    return apiClient.post('/system/security/sops', data);
  }
}

export const securityApiService = new SecurityApiService();
