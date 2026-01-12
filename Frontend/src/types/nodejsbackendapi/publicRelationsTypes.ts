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
  views?: number;
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
  expectedAttendees?: number;
  registeredAttendees?: number;
  actualAttendees?: number;
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
  totalReach?: number;
  engagementRate?: number;
  mediaReports?: number;
  publicEvents?: number;
}
