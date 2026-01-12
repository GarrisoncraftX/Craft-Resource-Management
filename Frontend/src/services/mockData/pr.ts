export const mockPressReleases = [
  { id: 'PR-001', title: 'New Municipal Development Project Announced', content: 'Full content here...', summary: 'Brief summary', status: 'published' as const, publishDate: '2024-01-20', authorId: 'USR-001', tags: ['Development', 'Infrastructure'], mediaContacts: ['MC-001'], views: 1250, engagement: 87 },
  { id: 'PR-002', title: 'City Council Budget Approval for 2024', content: 'Full content here...', summary: 'Brief summary', status: 'draft' as const, authorId: 'USR-002', tags: ['Finance', 'Budget'], mediaContacts: ['MC-002'], views: 0, engagement: 0 },
  { id: 'PR-003', title: 'Public Safety Initiative Launch', content: 'Full content here...', summary: 'Brief summary', status: 'published' as const, publishDate: '2024-01-19', authorId: 'USR-001', tags: ['Safety'], mediaContacts: ['MC-001', 'MC-003'], views: 850, engagement: 63 },
];

export const mockMediaContacts = [
  { id: 'MC-001', name: 'Jane Reporter', organization: 'City Daily News', position: 'Senior Reporter', email: 'jane@dailynews.com', phone: '+1-555-0101', address: '123 News St', specialization: ['Government', 'Politics'], status: 'active' as const, lastContacted: '2024-01-18' },
  { id: 'MC-002', name: 'Mike Broadcaster', organization: 'Local TV 5', position: 'News Anchor', email: 'mike@localtv5.com', phone: '+1-555-0102', address: '456 TV Ave', specialization: ['Breaking News', 'Community'], status: 'active' as const, lastContacted: '2024-01-15' },
  { id: 'MC-003', name: 'Sarah Journalist', organization: 'Metro Radio', position: 'Reporter', email: 'sarah@metroradio.com', phone: '+1-555-0103', address: '789 Radio Blvd', specialization: ['Local Events'], status: 'inactive' as const, lastContacted: '2024-01-10' },
];

export const mockPublicEvents = [
  { id: 'EVT-001', title: 'Town Hall Meeting', description: 'Monthly town hall meeting', eventDate: '2024-02-15T18:00:00', location: 'City Hall Auditorium', organizerId: 'USR-001', attendees: ['ATT-001', 'ATT-002'], mediaCoverage: ['MC-001'], status: 'planned' as const, budget: 2500, expectedAttendees: 200, registeredAttendees: 145, actualAttendees: undefined },
  { id: 'EVT-002', title: 'Community Festival', description: 'Annual community festival', eventDate: '2024-03-10T10:00:00', location: 'Central Park', organizerId: 'USR-002', attendees: [], mediaCoverage: ['MC-001', 'MC-002'], status: 'planned' as const, budget: 15000, expectedAttendees: 1500, registeredAttendees: 0, actualAttendees: undefined },
  { id: 'EVT-003', title: 'Budget Presentation', description: 'Annual budget presentation', eventDate: '2024-01-20T14:00:00', location: 'City Council Chambers', organizerId: 'USR-001', attendees: ['ATT-003'], mediaCoverage: ['MC-002'], status: 'completed' as const, budget: 800, expectedAttendees: 50, registeredAttendees: 48, actualAttendees: 42 },
];

export const mockSocialMediaPosts = [
  { id: 'SM-001', platform: 'Facebook', content: 'Excited to announce our new community initiative!', scheduledDate: '2024-01-20', scheduledTime: '10:00', status: 'scheduled' as const, engagement: { likes: 0, comments: 0, shares: 0 } },
  { id: 'SM-002', platform: 'Twitter', content: 'Breaking: New policy update will benefit over 1000 residents', scheduledDate: '2024-01-18', scheduledTime: '14:30', status: 'published' as const, engagement: { likes: 120, comments: 35, shares: 67 } },
  { id: 'SM-003', platform: 'LinkedIn', content: 'Our quarterly transparency report is now available', scheduledDate: '2024-01-15', scheduledTime: '09:00', status: 'published' as const, engagement: { likes: 89, comments: 23, shares: 41 } },
];

export const mockPRMetrics = {
  totalReach: 45000,
  engagementRate: 3.4,
  mediaReports: 23,
  publicEvents: 8,
  totalPressReleases: 124,
  publishedPressReleases: 98,
  totalMediaContacts: 45,
  activeMediaContacts: 38,
  totalEvents: 15,
  completedEvents: 8,
  mediaCoverage: 23
};
