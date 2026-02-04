export interface LegalCase {
  id?: number;
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
  id?: number;
  entity: string;
  regulation: string;
  complianceDate: string;
  status: string;
  notes?: string;
}

export interface LegalOpinion {
  id: string;
  subject: string;
  author: string;
  date: string;
  category: string;
  status: string;
}

export interface ComplianceFormProps {
  isOpen: boolean;
  onClose: () => void;
  record?: ComplianceRecord;
  onSubmit: (data: Partial<ComplianceRecord>) => void;
}

export interface LegalCaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  legalCase?: LegalCase;
  onSubmit: (data: Partial<LegalCase>) => void;
}
