// Mock data for Planning module

export const mockPlanningReport = {
  totalUrbanPlans: 12,
  activeProjects: 18,
  approvedPolicies: 24,
  activeGoals: 8,
  permitsIssued: 156,
  permitsPending: 24
};

export const mockUrbanPlans = [
  {
    id: '1',
    title: 'Downtown Revitalization Master Plan',
    description: 'Comprehensive plan for downtown area redevelopment',
    planType: 'master' as const,
    status: 'approved' as const,
    jurisdiction: 'Central District',
    planningPeriod: { startDate: '2024-01-01', endDate: '2029-12-31' },
    objectives: ['Economic growth', 'Infrastructure improvement', 'Community engagement'],
    stakeholders: ['City Council', 'Business Association', 'Residents'],
    documents: ['master-plan.pdf', 'zoning-map.pdf'],
    createdAt: '2023-06-15',
    updatedAt: '2024-01-10'
  },
  {
    id: '2',
    title: 'Green Spaces Development Plan',
    description: 'Strategic plan for parks and recreational areas',
    planType: 'sectoral' as const,
    status: 'review' as const,
    jurisdiction: 'City-wide',
    planningPeriod: { startDate: '2024-03-01', endDate: '2027-12-31' },
    objectives: ['Environmental sustainability', 'Public health', 'Recreation'],
    stakeholders: ['Parks Department', 'Environmental Groups'],
    documents: ['green-plan.pdf'],
    createdAt: '2023-11-20',
    updatedAt: '2024-01-15'
  }
];

export const mockProjects = [
  {
    id: '1',
    name: 'Downtown Revitalization',
    description: 'Major infrastructure and commercial development project',
    projectType: 'infrastructure' as const,
    status: 'in_progress' as const,
    budget: 2500000,
    estimatedCompletion: '2025-06-30',
    location: 'Downtown District',
    responsibleDepartment: 'Planning & Development',
    stakeholders: ['City Council', 'Contractors', 'Business Owners'],
    milestones: [
      { id: '1', title: 'Site Preparation', description: 'Clear and prepare construction site', dueDate: '2024-03-31', status: 'completed' as const, dependencies: [] },
      { id: '2', title: 'Foundation Work', description: 'Complete foundation and underground utilities', dueDate: '2024-06-30', status: 'in_progress' as const, dependencies: ['1'] }
    ],
    createdAt: '2023-09-01',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    name: 'Green Park Expansion',
    description: 'Expansion of city park with new facilities',
    projectType: 'environmental' as const,
    status: 'planning' as const,
    budget: 800000,
    estimatedCompletion: '2024-12-31',
    location: 'North District',
    responsibleDepartment: 'Parks & Recreation',
    stakeholders: ['Community Groups', 'Environmental NGOs'],
    milestones: [
      { id: '1', title: 'Design Phase', description: 'Complete park design and planning', dueDate: '2024-04-30', status: 'in_progress' as const, dependencies: [] }
    ],
    createdAt: '2023-12-01',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    name: 'Residential Complex A',
    description: 'New residential development with 200 units',
    projectType: 'residential' as const,
    status: 'approved' as const,
    budget: 5200000,
    estimatedCompletion: '2025-12-31',
    location: 'East District',
    responsibleDepartment: 'Housing Development',
    stakeholders: ['Developers', 'Future Residents'],
    milestones: [],
    createdAt: '2023-08-15',
    updatedAt: '2024-01-12'
  }
];

export const mockPolicies = [
  {
    id: '1',
    title: 'Sustainable Building Standards',
    description: 'Requirements for energy-efficient construction',
    category: 'environmental' as const,
    status: 'implemented' as const,
    effectiveDate: '2024-01-01',
    implementingAuthority: 'Building Department',
    relatedDocuments: ['building-code-2024.pdf'],
    createdAt: '2023-10-01',
    updatedAt: '2023-12-15'
  },
  {
    id: '2',
    title: 'Mixed-Use Zoning Policy',
    description: 'Guidelines for mixed residential-commercial zones',
    category: 'zoning' as const,
    status: 'approved' as const,
    effectiveDate: '2024-03-01',
    implementingAuthority: 'Planning Commission',
    relatedDocuments: ['zoning-policy.pdf'],
    createdAt: '2023-11-10',
    updatedAt: '2024-01-05'
  }
];

export const mockStrategicGoals = [
  {
    id: '1',
    title: 'Increase Affordable Housing by 20%',
    description: 'Develop 500 new affordable housing units by 2026',
    category: 'social' as const,
    priority: 'high' as const,
    status: 'active' as const,
    targetDate: '2026-12-31',
    kpis: ['Units completed', 'Budget utilization', 'Occupancy rate'],
    responsibleParties: ['Housing Department', 'Finance'],
    progress: 35,
    createdAt: '2023-07-01',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    title: 'Reduce Carbon Emissions by 30%',
    description: 'City-wide carbon reduction initiative',
    category: 'environmental' as const,
    priority: 'high' as const,
    status: 'active' as const,
    targetDate: '2027-12-31',
    kpis: ['Emission levels', 'Green energy adoption', 'Public transport usage'],
    responsibleParties: ['Environmental Department', 'Transportation'],
    progress: 22,
    createdAt: '2023-06-15',
    updatedAt: '2024-01-18'
  }
];

export const mockDevelopmentPermits = [
  {
    id: '1',
    applicationNumber: 'PER-001',
    applicantId: 'ABC Construction',
    projectType: 'Building Permit',
    location: 'Downtown District',
    status: 'under_review' as const,
    submissionDate: '2024-01-15',
    conditions: [],
    documents: ['application.pdf', 'site-plan.pdf'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    applicationNumber: 'PER-002',
    applicantId: 'Green Developers',
    projectType: 'Zoning Variance',
    location: 'North District',
    status: 'approved' as const,
    submissionDate: '2024-01-10',
    approvalDate: '2024-01-18',
    conditions: ['Maintain green space ratio', 'Traffic impact study required'],
    documents: ['variance-request.pdf'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    applicationNumber: 'PER-003',
    applicantId: 'City Infrastructure',
    projectType: 'Development Permit',
    location: 'East District',
    status: 'submitted' as const,
    submissionDate: '2024-01-12',
    conditions: [],
    documents: ['permit-application.pdf'],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12'
  }
];

export const mockProjectProgressAnalytics = [
  { name: 'Jan', completed: 2, inProgress: 5, planned: 3 },
  { name: 'Feb', completed: 3, inProgress: 6, planned: 2 },
  { name: 'Mar', completed: 4, inProgress: 7, planned: 4 },
  { name: 'Apr', completed: 5, inProgress: 8, planned: 3 },
  { name: 'May', completed: 6, inProgress: 9, planned: 5 },
  { name: 'Jun', completed: 7, inProgress: 10, planned: 4 }
];

export const mockPermitProcessingAnalytics = [
  { name: 'Week 1', submitted: 12, approved: 8, rejected: 2 },
  { name: 'Week 2', submitted: 15, approved: 10, rejected: 3 },
  { name: 'Week 3', submitted: 18, approved: 12, rejected: 4 },
  { name: 'Week 4', submitted: 14, approved: 9, rejected: 2 }
];

export const mockGoalAchievementMetrics = [
  { goal: 'Housing', target: 100, achieved: 35 },
  { goal: 'Environment', target: 100, achieved: 22 },
  { goal: 'Infrastructure', target: 100, achieved: 58 },
  { goal: 'Economic', target: 100, achieved: 45 }
];

export const mockBudgetAllocation = [
  { name: 'Infrastructure', value: 45 },
  { name: 'Housing', value: 25 },
  { name: 'Environment', value: 15 },
  { name: 'Public Spaces', value: 15 }
];
