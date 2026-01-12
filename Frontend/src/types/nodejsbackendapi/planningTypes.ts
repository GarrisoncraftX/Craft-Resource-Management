export interface UrbanPlan {
  id?: string;
  title: string;
  description: string;
  planType: 'master' | 'sectoral' | 'neighborhood' | 'special';
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'archived';
  jurisdiction: string;
  planningPeriod: {
    startDate: string;
    endDate: string;
  };
  objectives: string[];
  stakeholders: string[];
  documents: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  projectType: 'infrastructure' | 'residential' | 'commercial' | 'public' | 'environmental';
  status: 'proposed' | 'planning' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  budget: number;
  estimatedCompletion: string;
  location: string;
  responsibleDepartment: string;
  stakeholders: string[];
  milestones: ProjectMilestone[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMilestone {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  dependencies: string[];
}

export interface Policy {
  id?: string;
  title: string;
  description: string;
  category: 'land_use' | 'zoning' | 'environmental' | 'transportation' | 'housing' | 'economic';
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'repealed';
  effectiveDate?: string;
  expiryDate?: string;
  implementingAuthority: string;
  relatedDocuments: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StrategicGoal {
  id?: string;
  title: string;
  description: string;
  category: 'economic' | 'social' | 'environmental' | 'infrastructure';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'achieved' | 'cancelled';
  targetDate: string;
  kpis: string[];
  responsibleParties: string[];
  progress: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DevelopmentPermit {
  id?: string;
  applicationNumber: string;
  applicantId: string;
  projectType: string;
  location: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'issued';
  submissionDate: string;
  approvalDate?: string;
  expiryDate?: string;
  conditions: string[];
  documents: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanningReport {
  totalUrbanPlans: number;
  activeProjects: number;
  approvedPolicies: number;
  activeGoals: number;
  permitsIssued: number;
  permitsPending: number;
}
