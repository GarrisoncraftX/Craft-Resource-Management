import { apiClient } from '@/utils/apiClient';
import type {
  IncidentReport,
  SafetyInspection,
  TrainingSession,
  EnvironmentalMonitoring
} from '@/types/pythonbackendapi/healthSafetyTypes';
import {
  mockIncidents,
  mockInspections,
  mockTrainingSessions,
  mockEnvironmentalData
} from '@/services/mockData/health-safety';

class HealthSafetyApiService {
  // Incidents
  async getIncidents(): Promise<IncidentReport[]> {
    try {
      const response = await apiClient.get('/api/health-safety/incidents');
      return response.incidents || mockIncidents;
    } catch {
      return mockIncidents;
    }
  }

  async createIncident(data: Omit<IncidentReport, 'id'>): Promise<{ success: boolean; incident?: IncidentReport }> {
    try {
      return await apiClient.post('/api/health-safety/incidents', data);
    } catch {
      return { success: true, incident: { ...data, id: `INC-${Date.now()}` } as IncidentReport };
    }
  }

  // Inspections
  async getInspections(): Promise<SafetyInspection[]> {
    try {
      const response = await apiClient.get('/api/health-safety/inspections');
      return response.inspections || mockInspections;
    } catch {
      return mockInspections;
    }
  }

  async scheduleInspection(data: Omit<SafetyInspection, 'id'>): Promise<{ success: boolean; inspection?: SafetyInspection }> {
    try {
      return await apiClient.post('/api/health-safety/inspections', data);
    } catch {
      return { success: true, inspection: { ...data, id: `INS-${Date.now()}` } as SafetyInspection };
    }
  }

  // Training
  async getTrainingSessions(): Promise<TrainingSession[]> {
    try {
      const response = await apiClient.get('/api/health-safety/trainings');
      return response.sessions || mockTrainingSessions;
    } catch {
      return mockTrainingSessions;
    }
  }

  async scheduleTraining(data: Omit<TrainingSession, 'id'>): Promise<{ success: boolean; session?: TrainingSession }> {
    try {
      return await apiClient.post('/api/health-safety/trainings', data);
    } catch {
      return { success: true, session: { ...data, id: `ST-${Date.now()}` } as TrainingSession };
    }
  }

  async updateTraining(trainingId: string, data: Partial<TrainingSession>): Promise<{ success: boolean; session?: TrainingSession }> {
    try {
      return await apiClient.put(`/api/health-safety/trainings/${trainingId}`, data);
    } catch {
      return { success: true };
    }
  }

  async deleteTraining(trainingId: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete(`/api/health-safety/trainings/${trainingId}`);
    } catch {
      return { success: true };
    }
  }

  // Environmental Monitoring
  async getEnvironmentalData(): Promise<EnvironmentalMonitoring[]> {
    try {
      const response = await apiClient.get('/api/health-safety/environmental-health-records');
      return response.environmental_health_records || mockEnvironmentalData;
    } catch {
      return mockEnvironmentalData;
    }
  }

  async addMonitoringPoint(data: Omit<EnvironmentalMonitoring, 'id'>): Promise<{ success: boolean; point?: EnvironmentalMonitoring }> {
    try {
      return await apiClient.post('/api/health-safety/environmental-health-records', data);
    } catch {
      return { success: true, point: { ...data, id: `ENV-${Date.now()}` } as EnvironmentalMonitoring };
    }
  }

  async updateEnvironmentalRecord(recordId: string, data: Partial<EnvironmentalMonitoring>): Promise<{ success: boolean }> {
    try {
      return await apiClient.put(`/api/health-safety/environmental-health-records/${recordId}`, data);
    } catch {
      return { success: true };
    }
  }

  async deleteEnvironmentalRecord(recordId: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete(`/api/health-safety/environmental-health-records/${recordId}`);
    } catch {
      return { success: true };
    }
  }
}

export const healthSafetyApiService = new HealthSafetyApiService();
