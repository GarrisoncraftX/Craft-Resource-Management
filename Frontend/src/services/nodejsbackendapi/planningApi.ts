import { apiClient } from '../utils/apiClient';

// Types for Planning API
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

class PlanningApiService {
  // Urban Plans
  async createUrbanPlan(plan: Omit<UrbanPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<UrbanPlan> {
    return apiClient.post('/api/planning/urban-plans', plan);
  }

  async getUrbanPlanById(id: string): Promise<UrbanPlan> {
    return apiClient.get(`/api/planning/urban-plans/${id}`);
  }

  async getUrbanPlans(): Promise<UrbanPlan[]> {
    return apiClient.get('/api/planning/urban-plans');
  }

  async updateUrbanPlan(id: string, plan: Partial<UrbanPlan>): Promise<UrbanPlan> {
    return apiClient.put(`/api/planning/urban-plans/${id}`, plan);
  }

  async approveUrbanPlan(id: string): Promise<UrbanPlan> {
    return apiClient.post(`/api/planning/urban-plans/${id}/approve`, {});
  }

  async archiveUrbanPlan(id: string): Promise<UrbanPlan> {
    return apiClient.post(`/api/planning/urban-plans/${id}/archive`, {});
  }

  // Projects
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return apiClient.post('/api/planning/projects', project);
  }

  async getProjectById(id: string): Promise<Project> {
    return apiClient.get(`/api/planning/projects/${id}`);
  }

  async getProjects(): Promise<Project[]> {
    return apiClient.get('/api/planning/projects');
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return apiClient.put(`/api/planning/projects/${id}`, project);
  }

  async addProjectMilestone(projectId: string, milestone: Omit<ProjectMilestone, 'id'>): Promise<Project> {
    return apiClient.post(`/api/planning/projects/${projectId}/milestones`, milestone);
  }

  async updateProjectMilestone(projectId: string, milestoneId: string, milestone: Partial<ProjectMilestone>): Promise<Project> {
    return apiClient.put(`/api/planning/projects/${projectId}/milestones/${milestoneId}`, milestone);
  }

  async completeProject(id: string): Promise<Project> {
    return apiClient.post(`/api/planning/projects/${id}/complete`, {});
  }

  async cancelProject(id: string): Promise<Project> {
    return apiClient.post(`/api/planning/projects/${id}/cancel`, {});
  }

  // Policies
  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Policy> {
    return apiClient.post('/api/planning/policies', policy);
  }

  async getPolicyById(id: string): Promise<Policy> {
    return apiClient.get(`/api/planning/policies/${id}`);
  }

  async getPolicies(): Promise<Policy[]> {
    return apiClient.get('/api/planning/policies');
  }

  async updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy> {
    return apiClient.put(`/api/planning/policies/${id}`, policy);
  }

  async approvePolicy(id: string): Promise<Policy> {
    return apiClient.post(`/api/planning/policies/${id}/approve`, {});
  }

  async repealPolicy(id: string): Promise<Policy> {
    return apiClient.post(`/api/planning/policies/${id}/repeal`, {});
  }

  // Strategic Goals
  async createStrategicGoal(goal: Omit<StrategicGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<StrategicGoal> {
    return apiClient.post('/api/planning/strategic-goals', goal);
  }

  async getStrategicGoalById(id: string): Promise<StrategicGoal> {
    return apiClient.get(`/api/planning/strategic-goals/${id}`);
  }

  async getStrategicGoals(): Promise<StrategicGoal[]> {
    return apiClient.get('/api/planning/strategic-goals');
  }

  async updateStrategicGoal(id: string, goal: Partial<StrategicGoal>): Promise<StrategicGoal> {
    return apiClient.put(`/api/planning/strategic-goals/${id}`, goal);
  }

  async updateGoalProgress(id: string, progress: number): Promise<StrategicGoal> {
    return apiClient.post(`/api/planning/strategic-goals/${id}/progress`, { progress });
  }

  async achieveStrategicGoal(id: string): Promise<StrategicGoal> {
    return apiClient.post(`/api/planning/strategic-goals/${id}/achieve`, {});
  }

  // Development Permits
  async createDevelopmentPermit(permit: Omit<DevelopmentPermit, 'id' | 'createdAt' | 'updatedAt'>): Promise<DevelopmentPermit> {
    return apiClient.post('/api/planning/development-permits', permit);
  }

  async getDevelopmentPermitById(id: string): Promise<DevelopmentPermit> {
    return apiClient.get(`/api/planning/development-permits/${id}`);
  }

  async getDevelopmentPermits(): Promise<DevelopmentPermit[]> {
    return apiClient.get('/api/planning/development-permits');
  }

  async updateDevelopmentPermit(id: string, permit: Partial<DevelopmentPermit>): Promise<DevelopmentPermit> {
    return apiClient.put(`/api/planning/development-permits/${id}`, permit);
  }

  async approveDevelopmentPermit(id: string, conditions?: string[]): Promise<DevelopmentPermit> {
    return apiClient.post(`/api/planning/development-permits/${id}/approve`, { conditions });
  }

  async rejectDevelopmentPermit(id: string, reason: string): Promise<DevelopmentPermit> {
    return apiClient.post(`/api/planning/development-permits/${id}/reject`, { reason });
  }

  async issueDevelopmentPermit(id: string): Promise<DevelopmentPermit> {
    return apiClient.post(`/api/planning/development-permits/${id}/issue`, {});
  }

  // Reports and Analytics
  async getPlanningReport(): Promise<PlanningReport> {
    return apiClient.get('/api/planning/reports/overview');
  }

  async getProjectProgressAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/planning/analytics/project-progress');
  }

  async getPermitProcessingAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/planning/analytics/permit-processing');
  }

  async getGoalAchievementMetrics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/planning/analytics/goal-achievement');
  }
}

export const planningApiService = new PlanningApiService();
