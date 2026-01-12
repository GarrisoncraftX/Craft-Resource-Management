export const mockTaxAssessments = [
  { id: 'TA-001', propertyAddress: '123 Main Street', ownerName: 'John Smith', propertyType: 'Residential', landValue: 150000, improvementValue: 300000, totalValue: 450000, taxRate: 1.2, annualTax: 5400, status: 'Current' },
  { id: 'TA-002', propertyAddress: '456 Business Ave', ownerName: 'ABC Corporation', propertyType: 'Commercial', landValue: 500000, improvementValue: 700000, totalValue: 1200000, taxRate: 2.5, annualTax: 30000, status: 'Under Review' },
  { id: 'TA-003', propertyAddress: '789 Industrial Road', ownerName: 'Manufacturing Inc', propertyType: 'Industrial', landValue: 300000, improvementValue: 500000, totalValue: 800000, taxRate: 2.0, annualTax: 16000, status: 'Approved' },
  { id: 'TA-004', propertyAddress: '321 Residential Lane', ownerName: 'Jane Doe', propertyType: 'Residential', landValue: 120000, improvementValue: 280000, totalValue: 400000, taxRate: 1.2, annualTax: 4800, status: 'Appeal Filed' },
];

export const mockRevenueCollections = [
  { id: 'RC-001', taxpayerId: 'TAX001', taxpayerName: 'John Smith', taxType: 'Property Tax', amount: 5400, dueDate: '2024-03-15', status: 'Paid', paymentDate: '2024-03-10', paymentMethod: 'Bank Transfer' },
  { id: 'RC-002', taxpayerId: 'TAX002', taxpayerName: 'ABC Corporation', taxType: 'Business Tax', amount: 12500, dueDate: '2024-04-15', status: 'Overdue', paymentDate: null, paymentMethod: null },
  { id: 'RC-003', taxpayerId: 'TAX003', taxpayerName: 'Smith Enterprises', taxType: 'Income Tax', amount: 11250, dueDate: '2024-02-28', status: 'Pending', paymentDate: null, paymentMethod: null },
];

export const mockRevenueStreams = [
  { id: 1, source: 'Property Tax', budgeted: 850000, actual: 782000, variance: -68000, percentageComplete: 92, lastUpdated: '2024-01-15', status: 'On Track' },
  { id: 2, source: 'Business Permits', budgeted: 125000, actual: 142000, variance: 17000, percentageComplete: 114, lastUpdated: '2024-01-14', status: 'Ahead' },
  { id: 3, source: 'Utility Fees', budgeted: 320000, actual: 298000, variance: -22000, percentageComplete: 93, lastUpdated: '2024-01-16', status: 'On Track' },
  { id: 4, source: 'Development Fees', budgeted: 180000, actual: 156000, variance: -24000, percentageComplete: 87, lastUpdated: '2024-01-13', status: 'Behind' },
];

export const mockBusinessPermits = [
  { id: 'BP-001', business: 'Coffee Shop', owner: 'Jane Cafe', type: 'Food Service', fee: 250, status: 'Active', expiry: '2024-12-31' },
  { id: 'BP-002', business: 'Tech Startup', owner: 'Innovation Ltd', type: 'Professional Services', fee: 500, status: 'Renewal Due', expiry: '2024-02-28' },
  { id: 'BP-003', business: 'Retail Store', owner: 'Shopping Co', type: 'Retail', fee: 300, status: 'Active', expiry: '2024-06-30' },
];
