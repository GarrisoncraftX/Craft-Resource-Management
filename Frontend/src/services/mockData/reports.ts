export const mockReports = [
  { id: 'RPT001', name: 'Monthly Financial Summary', type: 'Financial', generated: '2024-07-01', status: 'Generated', size: '2.4MB' },
  { id: 'RPT002', name: 'HR Performance Report', type: 'HR', generated: '2024-06-30', status: 'Generated', size: '1.8MB' },
  { id: 'RPT003', name: 'Security Incident Analysis', type: 'Security', generated: '2024-06-29', status: 'Generated', size: '3.2MB' },
  { id: 'RPT004', name: 'Procurement Efficiency Report', type: 'Procurement', generated: '2024-06-28', status: 'Failed', size: '0MB' },
  { id: 'RPT005', name: 'Asset Utilization Report', type: 'Assets', generated: '2024-06-27', status: 'Generated', size: '1.5MB' }
];

export const mockMonthlyTrends = [
  { month: 'Jan', revenue: 450000, expenses: 320000, employees: 245, incidents: 3 },
  { month: 'Feb', revenue: 480000, expenses: 335000, employees: 248, incidents: 2 },
  { month: 'Mar', revenue: 520000, expenses: 348000, employees: 252, incidents: 1 },
  { month: 'Apr', revenue: 490000, expenses: 342000, employees: 255, incidents: 4 },
  { month: 'May', revenue: 530000, expenses: 356000, employees: 258, incidents: 2 },
  { month: 'Jun', revenue: 560000, expenses: 365000, employees: 262, incidents: 1 }
];

export const mockAIInsights = [
  {
    id: 1,
    type: 'anomaly',
    severity: 'high',
    title: 'Unusual Spending Pattern Detected',
    description: 'Procurement expenses have increased 25% above normal baseline in the past week.',
    department: 'Procurement',
    confidence: 94,
    date: '2024-07-02'
  },
  {
    id: 2,
    type: 'prediction',
    severity: 'medium',
    title: 'Budget Overrun Forecast',
    description: 'HR department is projected to exceed quarterly budget by 8% based on current spending trends.',
    department: 'HR',
    confidence: 87,
    date: '2024-07-01'
  },
  {
    id: 3,
    type: 'optimization',
    severity: 'low',
    title: 'Efficiency Improvement Opportunity',
    description: 'Asset maintenance scheduling could be optimized to reduce costs by 12%.',
    department: 'Assets',
    confidence: 92,
    date: '2024-06-30'
  }
];

export const mockKPIs = {
  totalRevenue: { value: 560000, change: 5.8 },
  activeEmployees: { value: 262, change: 4 },
  reportsGenerated: { value: 47, period: 'This month' },
  systemEfficiency: { value: 94.2, change: 2.1 }
};
