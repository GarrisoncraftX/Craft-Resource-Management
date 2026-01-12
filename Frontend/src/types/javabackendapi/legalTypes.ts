export interface LegalCase {
  id?: number;
  caseNumber: string;
  title: string;
  description: string;
  status: string;
  assignedLawyer: string;
  filingDate: string;
  resolutionDate?: string;
}

export interface ComplianceRecord {
  id?: number;
  entity: string;
  regulation: string;
  complianceDate: string;
  status: string;
  notes?: string;
}
