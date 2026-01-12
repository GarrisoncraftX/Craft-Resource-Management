import { apiClient } from '@/utils/apiClient';
import type {
  Vehicle,
  Driver,
  Trip,
  MaintenanceRecord,
  FuelRecord,
  TransportationReport
} from '@/types/nodejsbackendapi/transportationTypes';

class TransportationApiService {
  // Vehicles
  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    return apiClient.post('/api/transportation/vehicles', vehicle);
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    return apiClient.get(`/api/transportation/vehicles/${id}`);
  }

  async getVehicles(): Promise<Vehicle[]> {
    return apiClient.get('/api/transportation/vehicles');
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return apiClient.put(`/api/transportation/vehicles/${id}`, vehicle);
  }

  async assignDriver(vehicleId: string, driverId: string): Promise<Vehicle> {
    return apiClient.post(`/api/transportation/vehicles/${vehicleId}/assign-driver`, { driverId });
  }

  async unassignDriver(vehicleId: string): Promise<Vehicle> {
    return apiClient.post(`/api/transportation/vehicles/${vehicleId}/unassign-driver`, {});
  }

  async scheduleMaintenance(vehicleId: string, maintenanceDate: string): Promise<Vehicle> {
    return apiClient.post(`/api/transportation/vehicles/${vehicleId}/schedule-maintenance`, { maintenanceDate });
  }

  async retireVehicle(id: string): Promise<Vehicle> {
    return apiClient.post(`/api/transportation/vehicles/${id}/retire`, {});
  }

  // Drivers
  async createDriver(driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> {
    return apiClient.post('/api/transportation/drivers', driver);
  }

  async getDriverById(id: string): Promise<Driver> {
    return apiClient.get(`/api/transportation/drivers/${id}`);
  }

  async getDrivers(): Promise<Driver[]> {
    return apiClient.get('/api/transportation/drivers');
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    return apiClient.put(`/api/transportation/drivers/${id}`, driver);
  }

  async assignVehicle(driverId: string, vehicleId: string): Promise<Driver> {
    return apiClient.post(`/api/transportation/drivers/${driverId}/assign-vehicle`, { vehicleId });
  }

  async unassignVehicle(driverId: string): Promise<Driver> {
    return apiClient.post(`/api/transportation/drivers/${driverId}/unassign-vehicle`, {});
  }

  async suspendDriver(id: string, reason: string): Promise<Driver> {
    return apiClient.post(`/api/transportation/drivers/${id}/suspend`, { reason });
  }

  async reactivateDriver(id: string): Promise<Driver> {
    return apiClient.post(`/api/transportation/drivers/${id}/reactivate`, {});
  }

  // Trips
  async createTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    return apiClient.post('/api/transportation/trips', trip);
  }

  async getTripById(id: string): Promise<Trip> {
    return apiClient.get(`/api/transportation/trips/${id}`);
  }

  async getTrips(): Promise<Trip[]> {
    return apiClient.get('/api/transportation/trips');
  }

  async updateTrip(id: string, trip: Partial<Trip>): Promise<Trip> {
    return apiClient.put(`/api/transportation/trips/${id}`, trip);
  }

  async startTrip(id: string): Promise<Trip> {
    return apiClient.post(`/api/transportation/trips/${id}/start`, {});
  }

  async completeTrip(id: string, fuelConsumed?: number, notes?: string): Promise<Trip> {
    return apiClient.post(`/api/transportation/trips/${id}/complete`, { fuelConsumed, notes });
  }

  async cancelTrip(id: string, reason: string): Promise<Trip> {
    return apiClient.post(`/api/transportation/trips/${id}/cancel`, { reason });
  }

  // Maintenance Records
  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> {
    return apiClient.post('/api/transportation/maintenance-records', record);
  }

  async getMaintenanceRecordById(id: string): Promise<MaintenanceRecord> {
    return apiClient.get(`/api/transportation/maintenance-records/${id}`);
  }

  async getMaintenanceRecords(vehicleId?: string): Promise<MaintenanceRecord[]> {
    const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
    return apiClient.get(`/api/transportation/maintenance-records${query}`);
  }

  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return apiClient.put(`/api/transportation/maintenance-records/${id}`, record);
  }

  // Fuel Records
  async createFuelRecord(record: Omit<FuelRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FuelRecord> {
    return apiClient.post('/api/transportation/fuel-records', record);
  }

  async getFuelRecordById(id: string): Promise<FuelRecord> {
    return apiClient.get(`/api/transportation/fuel-records/${id}`);
  }

  async getFuelRecords(vehicleId?: string): Promise<FuelRecord[]> {
    const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
    return apiClient.get(`/api/transportation/fuel-records${query}`);
  }

  async updateFuelRecord(id: string, record: Partial<FuelRecord>): Promise<FuelRecord> {
    return apiClient.put(`/api/transportation/fuel-records/${id}`, record);
  }

  // Reports and Analytics
  async getTransportationReport(): Promise<TransportationReport> {
    return apiClient.get('/api/transportation/reports/overview');
  }

  async getVehicleUtilizationAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/transportation/analytics/vehicle-utilization');
  }

  async getFuelConsumptionAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/transportation/analytics/fuel-consumption');
  }

  async getMaintenanceCostAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/transportation/analytics/maintenance-cost');
  }

  async getTripAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/transportation/analytics/trips');
  }

  async getDriverPerformanceAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/transportation/analytics/driver-performance');
  }

  async getMaintenanceScheduleAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/transportation/analytics/maintenance-schedule');
  }

  async getFuelEfficiencyAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/transportation/analytics/fuel-efficiency');
  }

  async getRouteEfficiencyAnalytics(): Promise<Record<string, unknown>[]> {
    return apiClient.get('/api/transportation/analytics/route-efficiency');
  }
}

export const transportationApiService = new TransportationApiService();
