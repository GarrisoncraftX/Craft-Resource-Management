export interface IncidentReport {
  id: string;
  title: string;
  type: 'Injury' | 'Environmental' | 'Equipment' | 'Near Miss' | 'Security';
  severity: 'Minor' | 'Major' | 'Critical';
  location: string;
  reportedBy: string;
  reportedDate: string;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';
  assignedTo: string;
  description: string;
}

export interface SafetyInspection {
  id: string;
  type: string;
  location: string;
  inspector: string;
  scheduledDate: string;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Failed';
  score: number | null;
  findings: string;
  nextDue: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  instructor: string;
  type: 'Mandatory' | 'Certification' | 'Optional';
  duration: string;
  scheduledDate: string;
  capacity: number;
  enrolled: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Open';
  completionRate: number;
  location: string;
}

export interface EnvironmentalMonitoring {
  id: string;
  parameter: string;
  location: string;
  currentValue: number;
  unit: string;
  threshold: number;
  status: 'Good' | 'Normal' | 'Warning' | 'Critical';
  lastChecked: string;
  trend: 'stable' | 'increasing' | 'decreasing';
}
