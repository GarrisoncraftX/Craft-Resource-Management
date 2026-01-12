export interface Vehicle {
  id?: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: 'car' | 'truck' | 'bus' | 'motorcycle' | 'van';
  capacity: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  status: 'active' | 'maintenance' | 'out_of_service' | 'retired';
  mileage: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  assignedDriver?: string;
  department: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id?: string;
  employeeId: string;
  licenseNumber: string;
  licenseType: 'A' | 'B' | 'C' | 'D' | 'E';
  licenseExpiryDate: string;
  status: 'active' | 'suspended' | 'expired' | 'terminated';
  experienceYears: number;
  assignedVehicle?: string;
  contactNumber: string;
  emergencyContact: string;
  certifications: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Trip {
  id?: string;
  vehicleId: string;
  driverId: string;
  requesterId: string;
  purpose: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  passengers?: string[];
  fuelConsumed?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceRecord {
  id?: string;
  vehicleId: string;
  maintenanceType: 'routine' | 'repair' | 'emergency' | 'inspection';
  description: string;
  date: string;
  cost: number;
  mileage: number;
  performedBy: string;
  nextMaintenanceDate?: string;
  partsReplaced: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FuelRecord {
  id?: string;
  vehicleId: string;
  driverId: string;
  date: string;
  fuelType: string;
  quantity: number;
  cost: number;
  mileage: number;
  station: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransportationReport {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  totalTrips: number;
  completedTrips: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
}
