export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedLawyer: string;
  filingDate: string;
  resolutionDate?: string;
  stage: string;
  counsel: string;
  nextDate?: string;
}

export interface ComplianceRecord {
  id: string;
  entity: string;
  regulation: string;
  complianceDate: string;
  status: string;
  notes?: string;
  area: string;
  lastAudit: string;
  nextReview: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  owner: string;
  createdDate: string;
  updatedDate: string;
}

export interface Contract {
  id: string;
  title: string;
  party: string;
  value: number;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
}

export const mockLegalCases: LegalCase[] = [
  {
    id: 'LEG-001',
    caseNumber: 'CASE-2024-001',
    title: 'Contract Dispute - Vendor ABC',
    description: 'Dispute over contract terms with Vendor ABC',
    status: 'Active',
    priority: 'High',
    assignedLawyer: 'John Smith',
    filingDate: '2024-01-15',
    stage: 'Discovery',
    counsel: 'A&B Law Firm',
    nextDate: '2024-03-20'
  },
  {
    id: 'LEG-002',
    caseNumber: 'CASE-2024-002',
    title: 'Employment Law Review',
    description: 'Review of employment policies',
    status: 'Pending',
    priority: 'Medium',
    assignedLawyer: 'Jane Doe',
    filingDate: '2024-02-01',
    stage: 'Investigation',
    counsel: 'CDE Legal',
    nextDate: '2024-03-15'
  },
  {
    id: 'LEG-003',
    caseNumber: 'CASE-2024-003',
    title: 'Compliance Audit',
    description: 'Annual compliance audit',
    status: 'Completed',
    priority: 'Low',
    assignedLawyer: 'Mike Johnson',
    filingDate: '2023-12-01',
    resolutionDate: '2024-01-30',
    stage: 'Closed',
    counsel: 'Internal Legal',
    nextDate: '2024-12-01'
  }
];

export const mockComplianceRecords: ComplianceRecord[] = [
  {
    id: 'CMP-001',
    entity: 'Finance Department',
    regulation: 'Data Protection Act',
    complianceDate: '2024-01-15',
    status: 'Compliant',
    notes: 'All requirements met',
    area: 'Data Privacy',
    lastAudit: '2024-01-15',
    nextReview: '2024-07-15'
  },
  {
    id: 'CMP-002',
    entity: 'HR Department',
    regulation: 'Employment Standards',
    complianceDate: '2023-12-01',
    status: 'Review Required',
    notes: 'Policy update needed',
    area: 'Employment Law',
    lastAudit: '2023-12-01',
    nextReview: '2024-06-01'
  },
  {
    id: 'CMP-003',
    entity: 'Procurement',
    regulation: 'Procurement Policy',
    complianceDate: '2024-01-10',
    status: 'Compliant',
    notes: 'Audit passed',
    area: 'Procurement Policy',
    lastAudit: '2024-01-10',
    nextReview: '2024-07-10'
  }
];

export const mockLegalDocuments: LegalDocument[] = [
  {
    id: 'DOC-001',
    title: 'Data Protection Policy',
    type: 'Policy',
    status: 'Active',
    owner: 'Legal Department',
    createdDate: '2023-01-10',
    updatedDate: '2024-01-10'
  },
  {
    id: 'DOC-002',
    title: 'Vendor NDA Template',
    type: 'Template',
    status: 'Active',
    owner: 'Legal Department',
    createdDate: '2023-06-15',
    updatedDate: '2024-01-05'
  },
  {
    id: 'DOC-003',
    title: 'Employment Contract Template',
    type: 'Template',
    status: 'Active',
    owner: 'HR & Legal',
    createdDate: '2023-03-20',
    updatedDate: '2023-12-15'
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'CNT-001',
    title: 'IT Services Agreement',
    party: 'Tech Solutions Inc.',
    value: 250000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Active',
    type: 'Service Agreement'
  },
  {
    id: 'CNT-002',
    title: 'Office Lease Agreement',
    party: 'Property Management Co.',
    value: 500000,
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    status: 'Active',
    type: 'Lease'
  },
  {
    id: 'CNT-003',
    title: 'Consulting Services',
    party: 'Business Advisors Ltd.',
    value: 75000,
    startDate: '2024-02-01',
    endDate: '2024-05-31',
    status: 'Under Review',
    type: 'Consulting'
  }
];
