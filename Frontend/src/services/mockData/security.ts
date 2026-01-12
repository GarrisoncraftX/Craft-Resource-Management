// Mock data for Security module

export const mockAccessRules = [
  { id: 'AC-001', role: 'IT Staff', door: 'Server Room', schedule: '09:00-18:00', status: 'Enabled' },
  { id: 'AC-002', role: 'Cleaners', door: 'All Offices', schedule: '18:00-22:00', status: 'Enabled' },
  { id: 'AC-003', role: 'Security', door: 'All Areas', schedule: '24/7', status: 'Enabled' },
];

export const mockSecurityIncidents = [
  { id: 'INC-001', type: 'Unauthorized Access', location: 'Server Room', date: '2024-01-18', status: 'Investigating', severity: 'High' },
  { id: 'INC-002', type: 'Lost ID Card', location: 'Lobby', date: '2024-01-20', status: 'Closed', severity: 'Low' },
  { id: 'INC-003', type: 'Suspicious Activity', location: 'Parking Lot', date: '2024-01-22', status: 'Open', severity: 'Medium' },
];

export const mockIdCards = [
  {
    cardId: 'CARD12345',
    firstName: 'John',
    lastName: 'Doe',
    employeeId: 'EMP001',
    email: 'john.doe@example.com',
    department: 'FINANCE',
    nationalId: 'NID123456789',
    phoneNumber: '555-1234',
    status: 'Active',
    issueDate: '2024-01-15',
  },
  {
    cardId: 'CARD67890',
    firstName: 'Jane',
    lastName: 'Smith',
    employeeId: 'EMP002',
    email: 'jane.smith@example.com',
    department: 'HR',
    nationalId: 'NID987654321',
    phoneNumber: '555-5678',
    status: 'Active',
    issueDate: '2024-01-20',
  },
];

export const mockGuardPosts = [
  { id: 'GP-001', post: 'Gate A', guards: 3, shift: 'Day', status: 'Active' },
  { id: 'GP-002', post: 'Gate B', guards: 2, shift: 'Night', status: 'Active' },
  { id: 'GP-003', post: 'Server Room', guards: 1, shift: '24/7', status: 'Restricted' },
];

export const mockSOPs = [
  { id: 'SOP-001', title: 'Emergency Evacuation', category: 'Emergency', version: '2.1', lastUpdated: '2024-01-15', status: 'Active' },
  { id: 'SOP-002', title: 'Visitor Check-in Protocol', category: 'Access Control', version: '1.5', lastUpdated: '2024-01-10', status: 'Active' },
  { id: 'SOP-003', title: 'Incident Response', category: 'Security', version: '3.0', lastUpdated: '2024-01-20', status: 'Active' },
];
