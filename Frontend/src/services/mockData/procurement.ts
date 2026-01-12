export const mockProcurementPlans = [
  { id: 'PROC001', item: 'Office Laptops (50 units)', category: 'IT Equipment', budget: 75000, spent: 0, status: 'Planning', priority: 'High', targetDate: '2024-03-15', progress: 25 },
  { id: 'PROC002', item: 'Annual Software Licenses', category: 'Software', budget: 25000, spent: 18500, status: 'In Progress', priority: 'Medium', targetDate: '2024-02-28', progress: 74 },
  { id: 'PROC003', item: 'Security System Upgrade', category: 'Security', budget: 120000, spent: 120000, status: 'Completed', priority: 'High', targetDate: '2024-01-31', progress: 100 },
];

export const mockRequisitions = [
  { id: 'REQ-001', title: 'Laptops', description: 'New laptops for development team', departmentId: 'IT', requestedBy: 'John Tech', estimatedCost: 15000, priority: 'high' as const, status: 'approved' as const, createdAt: '2024-01-20', department: 'IT', item: 'Laptops (10 units)', requestor: 'John Tech', amount: 15000, date: '2024-01-20' },
  { id: 'REQ-002', title: 'Training Materials', description: 'Employee training resources', departmentId: 'HR', requestedBy: 'Jane HR', estimatedCost: 2500, priority: 'medium' as const, status: 'submitted' as const, createdAt: '2024-01-22', department: 'HR', item: 'Training Materials', requestor: 'Jane HR', amount: 2500, date: '2024-01-22' },
  { id: 'REQ-003', title: 'Accounting Software', description: 'Annual software renewal', departmentId: 'Finance', requestedBy: 'Bob Finance', estimatedCost: 8000, priority: 'medium' as const, status: 'submitted' as const, createdAt: '2024-01-21', department: 'Finance', item: 'Accounting Software License', requestor: 'Bob Finance', amount: 8000, date: '2024-01-21' },
];

export const mockTenders = [
  { id: 'TND-001', title: 'Office Furniture Supply', description: 'Supply of office furniture for new building', procurementRequestId: 'REQ-001', status: 'published' as const, publishDate: '2024-01-10', closeDate: '2024-02-15', bidders: 8, deadline: '2024-02-15', value: 45000 },
  { id: 'TND-002', title: 'IT Equipment Procurement', description: 'Procurement of IT equipment', procurementRequestId: 'REQ-002', status: 'published' as const, publishDate: '2024-01-12', closeDate: '2024-02-20', bidders: 12, deadline: '2024-02-20', value: 125000 },
  { id: 'TND-003', title: 'Cleaning Services Contract', description: 'Annual cleaning services', procurementRequestId: 'REQ-003', status: 'awarded' as const, publishDate: '2024-01-05', closeDate: '2024-02-10', bidders: 5, deadline: '2024-02-10', value: 32000 },
];

export const mockBids = [
  { id: 'BID-001', tenderId: 'TND-001', vendorId: 'VND-002', amount: 43000, description: 'Office furniture bid', status: 'evaluated' as const, submittedAt: '2024-01-15', vendor: 'Office Plus', score: 86, price: 43000 },
  { id: 'BID-002', tenderId: 'TND-001', vendorId: 'VND-004', amount: 42000, description: 'Furniture supply bid', status: 'evaluated' as const, submittedAt: '2024-01-16', vendor: 'FurnishCo', score: 82, price: 42000 },
  { id: 'BID-003', tenderId: 'TND-002', vendorId: 'VND-001', amount: 120000, description: 'IT equipment bid', status: 'evaluated' as const, submittedAt: '2024-01-18', vendor: 'TechCorp Solutions', score: 92, price: 120000 },
];

export const mockContracts = [
  { id: 'CTR-001', title: 'IT Equipment Supply', vendorId: 'VND-001', procurementRequestId: 'REQ-001', amount: 125000, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active' as const, terms: 'Annual supply contract', vendor: 'TechCorp Solutions', start: '2024-01-01', end: '2024-12-31', value: 125000 },
  { id: 'CTR-002', title: 'Cleaning Services', vendorId: 'VND-003', procurementRequestId: 'REQ-002', amount: 32000, startDate: '2023-06-01', endDate: '2024-05-31', status: 'active' as const, terms: 'Monthly cleaning services', vendor: 'Clean Masters', start: '2023-06-01', end: '2024-05-31', value: 32000 },
  { id: 'CTR-003', title: 'Office Supplies', vendorId: 'VND-002', procurementRequestId: 'REQ-003', amount: 45000, startDate: '2024-01-01', endDate: '2025-12-31', status: 'active' as const, terms: 'Quarterly supply contract', vendor: 'Office Plus', start: '2024-01-01', end: '2025-12-31', value: 45000 },
];

export const mockVendors = [
  { id: 'VND-001', name: 'TechCorp Solutions', contactPerson: 'John Smith', email: 'john@techcorp.com', phone: '555-0101', address: '123 Tech St', status: 'active' as const, category: 'IT Equipment', rating: 4.8, contracts: 12, totalValue: 245000 },
  { id: 'VND-002', name: 'Office Plus', contactPerson: 'Jane Doe', email: 'jane@officeplus.com', phone: '555-0102', address: '456 Office Ave', status: 'active' as const, category: 'Office Supplies', rating: 4.5, contracts: 8, totalValue: 89000 },
  { id: 'VND-003', name: 'Clean Masters', contactPerson: 'Bob Wilson', email: 'bob@cleanmasters.com', phone: '555-0103', address: '789 Clean Rd', status: 'active' as const, category: 'Services', rating: 4.2, contracts: 3, totalValue: 45000 },
];

export const mockProcurementMetrics = {
  totalSpend: 1245000,
  activeContracts: 34,
  pendingRequisitions: 12,
  costSavings: 89500,
  totalBudget: 850000,
  budgetUtilized: 485000,
  activePlans: 12,
  completionRate: 78
};
