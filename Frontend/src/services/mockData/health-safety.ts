import type {
  IncidentReport,
  SafetyInspection,
  TrainingSession,
  EnvironmentalMonitoring
} from '@/types/pythonbackendapi/healthSafetyTypes';

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

export const mockIncidents: IncidentReport[] = [
  {
    id: 'INC-001',
    title: 'Slip and Fall Incident',
    type: 'Injury',
    severity: 'Minor',
    location: 'Manufacturing Floor',
    reportedBy: 'John Smith',
    reportedDate: '2024-01-15',
    status: 'Under Investigation',
    assignedTo: 'Safety Officer',
    description: 'Employee slipped on wet floor near workstation 5'
  },
  {
    id: 'INC-002',
    title: 'Chemical Spill',
    type: 'Environmental',
    severity: 'Major',
    location: 'Laboratory',
    reportedBy: 'Lisa Chen',
    reportedDate: '2024-01-12',
    status: 'Resolved',
    assignedTo: 'Environmental Team',
    description: 'Small chemical spill contained and cleaned'
  },
  {
    id: 'INC-003',
    title: 'Equipment Malfunction',
    type: 'Equipment',
    severity: 'Critical',
    location: 'Production Line A',
    reportedBy: 'Mike Davis',
    reportedDate: '2024-01-18',
    status: 'Open',
    assignedTo: 'Maintenance Team',
    description: 'Press machine safety guard failure'
  }
];

export const mockInspections: SafetyInspection[] = [
  {
    id: 'INS-001',
    type: 'Fire Safety',
    location: 'Building A - Floor 3',
    inspector: 'John Smith',
    scheduledDate: '2024-01-15',
    status: 'Completed',
    score: 95,
    findings: '2 minor issues',
    nextDue: '2024-04-15'
  },
  {
    id: 'INS-002',
    type: 'Electrical Safety',
    location: 'Manufacturing Floor',
    inspector: 'Sarah Johnson',
    scheduledDate: '2024-01-20',
    status: 'In Progress',
    score: null,
    findings: 'Pending',
    nextDue: '2024-05-20'
  },
  {
    id: 'INS-003',
    type: 'Chemical Safety',
    location: 'Laboratory',
    inspector: 'Lisa Chen',
    scheduledDate: '2024-01-12',
    status: 'Failed',
    score: 65,
    findings: '3 critical issues',
    nextDue: '2024-02-12'
  }
];

export const mockTrainingSessions: TrainingSession[] = [
  {
    id: 'ST-001',
    title: 'Fire Safety & Evacuation',
    instructor: 'John Smith',
    type: 'Mandatory',
    duration: '2 hours',
    scheduledDate: '2024-01-25',
    capacity: 30,
    enrolled: 28,
    status: 'Scheduled',
    completionRate: 0,
    location: 'Training Room A'
  },
  {
    id: 'ST-002',
    title: 'First Aid & CPR',
    instructor: 'Sarah Johnson',
    type: 'Certification',
    duration: '4 hours',
    scheduledDate: '2024-01-20',
    capacity: 20,
    enrolled: 20,
    status: 'In Progress',
    completionRate: 60,
    location: 'Medical Center'
  },
  {
    id: 'ST-003',
    title: 'Chemical Handling Safety',
    instructor: 'Dr. Lisa Chen',
    type: 'Mandatory',
    duration: '3 hours',
    scheduledDate: '2024-01-15',
    capacity: 25,
    enrolled: 25,
    status: 'Completed',
    completionRate: 100,
    location: 'Laboratory'
  }
];

export const mockEnvironmentalData: EnvironmentalMonitoring[] = [
  {
    id: 'ENV-001',
    parameter: 'Air Quality Index',
    location: 'Manufacturing Floor',
    currentValue: 45,
    unit: 'AQI',
    threshold: 50,
    status: 'Good',
    lastChecked: '2024-01-22 09:30',
    trend: 'stable'
  },
  {
    id: 'ENV-002',
    parameter: 'Noise Level',
    location: 'Production Area',
    currentValue: 78,
    unit: 'dB',
    threshold: 85,
    status: 'Normal',
    lastChecked: '2024-01-22 10:15',
    trend: 'decreasing'
  },
  {
    id: 'ENV-003',
    parameter: 'Temperature',
    location: 'Server Room',
    currentValue: 24.5,
    unit: '°C',
    threshold: 25,
    status: 'Normal',
    lastChecked: '2024-01-22 10:00',
    trend: 'stable'
  },
  {
    id: 'ENV-004',
    parameter: 'Humidity',
    location: 'Storage Area',
    currentValue: 68,
    unit: '%',
    threshold: 70,
    status: 'Warning',
    lastChecked: '2024-01-22 09:45',
    trend: 'increasing'
  }
];
