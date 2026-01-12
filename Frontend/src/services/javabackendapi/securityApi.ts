import { apiClient } from '@/utils/apiClient';
import type { AccessRule, SecurityIncident, IdCard, GuardPost, SOP } from '@/types/javabackendapi/securityTypes';

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
