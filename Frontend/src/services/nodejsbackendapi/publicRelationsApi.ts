import { apiClient } from '../utils/apiClient';

// Types for Public Relations API
export interface PressRelease {
  id?: string;
  title: string;
  content: string;
  summary: string;
  status: 'draft' | 'published' | 'archived';
  publishDate?: string;
  authorId: string;
  tags: string[];
  mediaContacts: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaContact {
  id?: string;
  name: string;
  organization: string;
  position: string;
  email: string;
  phone: string;
  address: string;
  specialization: string[];
  status: 'active' | 'inactive';
  lastContacted?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicEvent {
  id?: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  organizerId: string;
  attendees: string[];
  mediaCoverage: string[];
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  budget?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaKit {
  id?: string;
  title: string;
  description: string;
  files: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface CrisisCommunication {
  id?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'monitored';
  stakeholders: string[];
  actions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicRelationsReport {
  totalPressReleases: number;
  publishedPressReleases: number;
  totalMediaContacts: number;
  activeMediaContacts: number;
  totalEvents: number;
  completedEvents: number;
  mediaCoverage: number;
}

class PublicRelationsApiService {
  // Press Releases
  async createPressRelease(pressRelease: Omit<PressRelease, 'id' | 'createdAt' | 'updatedAt'>): Promise<PressRelease> {
    return apiClient.post('/api/public-relations/press-releases', pressRelease);
  }

  async getPressReleaseById(id: string): Promise<PressRelease> {
    return apiClient.get(`/api/public-relations/press-releases/${id}`);
  }

  async getPressReleases(): Promise<PressRelease[]> {
    return apiClient.get('/api/public-relations/press-releases');
  }

  async updatePressRelease(id: string, pressRelease: Partial<PressRelease>): Promise<PressRelease> {
    return apiClient.put(`/api/public-relations/press-releases/${id}`, pressRelease);
  }

  async publishPressRelease(id: string, publishDate?: string): Promise<PressRelease> {
    return apiClient.post(`/api/public-relations/press-releases/${id}/publish`, { publishDate } as Record<string, unknown>);
  }

  async archivePressRelease(id: string): Promise<PressRelease> {
    return apiClient.post(`/api/public-relations/press-releases/${id}/archive`, {});
  }

  // Media Contacts
  async createMediaContact(contact: Omit<MediaContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaContact> {
    return apiClient.post('/api/public-relations/media-contacts', contact);
  }

  async getMediaContactById(id: string): Promise<MediaContact> {
    return apiClient.get(`/api/public-relations/media-contacts/${id}`);
  }

  async getMediaContacts(): Promise<MediaContact[]> {
    return apiClient.get('/api/public-relations/media-contacts');
  }

  async updateMediaContact(id: string, contact: Partial<MediaContact>): Promise<MediaContact> {
    return apiClient.put(`/api/public-relations/media-contacts/${id}`, contact);
  }

  async deactivateMediaContact(id: string): Promise<MediaContact> {
    return apiClient.post(`/api/public-relations/media-contacts/${id}/deactivate`, {});
  }

  async logContact(id: string, contactLog: { date: string; type: string; notes: string }): Promise<void> {
    return apiClient.post(`/api/public-relations/media-contacts/${id}/log-contact`, contactLog);
  }

  // Public Events
  async createPublicEvent(event: Omit<PublicEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<PublicEvent> {
    return apiClient.post('/api/public-relations/events', event);
  }

  async getPublicEventById(id: string): Promise<PublicEvent> {
    return apiClient.get(`/api/public-relations/events/${id}`);
  }

  async getPublicEvents(): Promise<PublicEvent[]> {
    return apiClient.get('/api/public-relations/events');
  }

  async updatePublicEvent(id: string, event: Partial<PublicEvent>): Promise<PublicEvent> {
    return apiClient.put(`/api/public-relations/events/${id}`, event);
  }

  async cancelPublicEvent(id: string): Promise<PublicEvent> {
    return apiClient.post(`/api/public-relations/events/${id}/cancel`, {});
  }

  async addEventAttendee(id: string, attendeeId: string): Promise<PublicEvent> {
    return apiClient.post(`/api/public-relations/events/${id}/attendees`, { attendeeId });
  }

  async removeEventAttendee(id: string, attendeeId: string): Promise<PublicEvent> {
    return apiClient.delete(`/api/public-relations/events/${id}/attendees/${attendeeId}`);
  }

  // Media Kits
  async createMediaKit(mediaKit: Omit<MediaKit, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaKit> {
    return apiClient.post('/api/public-relations/media-kits', mediaKit);
  }

  async getMediaKitById(id: string): Promise<MediaKit> {
    return apiClient.get(`/api/public-relations/media-kits/${id}`);
  }

  async getMediaKits(): Promise<MediaKit[]> {
    return apiClient.get('/api/public-relations/media-kits');
  }

  async updateMediaKit(id: string, mediaKit: Partial<MediaKit>): Promise<MediaKit> {
    return apiClient.put(`/api/public-relations/media-kits/${id}`, mediaKit);
  }

  async publishMediaKit(id: string): Promise<MediaKit> {
    return apiClient.post(`/api/public-relations/media-kits/${id}/publish`, {});
  }

  async archiveMediaKit(id: string): Promise<MediaKit> {
    return apiClient.post(`/api/public-relations/media-kits/${id}/archive`, {});
  }

  // Crisis Communications
  async createCrisisCommunication(crisis: Omit<CrisisCommunication, 'id' | 'createdAt' | 'updatedAt'>): Promise<CrisisCommunication> {
    return apiClient.post('/api/public-relations/crisis-communications', crisis);
  }

  async getCrisisCommunicationById(id: string): Promise<CrisisCommunication> {
    return apiClient.get(`/api/public-relations/crisis-communications/${id}`);
  }

  async getCrisisCommunications(): Promise<CrisisCommunication[]> {
    return apiClient.get('/api/public-relations/crisis-communications');
  }

  async updateCrisisCommunication(id: string, crisis: Partial<CrisisCommunication>): Promise<CrisisCommunication> {
    return apiClient.put(`/api/public-relations/crisis-communications/${id}`, crisis);
  }

  async resolveCrisisCommunication(id: string): Promise<CrisisCommunication> {
    return apiClient.post(`/api/public-relations/crisis-communications/${id}/resolve`, {});
  }

  async addCrisisAction(id: string, action: string): Promise<CrisisCommunication> {
    return apiClient.post(`/api/public-relations/crisis-communications/${id}/actions`, { action });
  }

  // Reports and Analytics
  async getPublicRelationsReport(): Promise<PublicRelationsReport> {
    return apiClient.get('/api/public-relations/reports/overview');
  }

  async getMediaCoverageAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/public-relations/analytics/media-coverage');
  }

  async getStakeholderEngagementMetrics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/public-relations/analytics/stakeholder-engagement');
  }
}

export const publicRelationsApiService = new PublicRelationsApiService();
