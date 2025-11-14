import { apiClient } from '../utils/apiClient';

// Types for Lookup API
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  parentDepartment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  hierarchyLevel: number;
  departmentSpecific: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  module: string;
  action: string;
  resource: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LookupData {
  departments: Department[];
  roles: Role[];
  permissions: Permission[];
}

class LookupApiService {
  // Departments
  async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    return apiClient.post('/api/lookup/departments', department);
  }

  async getDepartmentById(id: string): Promise<Department> {
    return apiClient.get(`/api/lookup/departments/${id}`);
  }

  async getDepartments(): Promise<Department[]> {
    return apiClient.get('/api/lookup/departments');
  }

  async updateDepartment(id: string, department: Partial<Department>): Promise<Department> {
    return apiClient.put(`/api/lookup/departments/${id}`, department);
  }

  async deleteDepartment(id: string): Promise<void> {
    return apiClient.delete(`/api/lookup/departments/${id}`);
  }

  async activateDepartment(id: string): Promise<Department> {
    return apiClient.post(`/api/lookup/departments/${id}/activate`, {});
  }

  async deactivateDepartment(id: string): Promise<Department> {
    return apiClient.post(`/api/lookup/departments/${id}/deactivate`, {});
  }

  // Roles
  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    return apiClient.post('/api/lookup/roles', role);
  }

  async getRoleById(id: string): Promise<Role> {
    return apiClient.get(`/api/lookup/roles/${id}`);
  }

  async getRoles(): Promise<Role[]> {
    return apiClient.get('/api/lookup/roles');
  }

  async updateRole(id: string, role: Partial<Role>): Promise<Role> {
    return apiClient.put(`/api/lookup/roles/${id}`, role);
  }

  async deleteRole(id: string): Promise<void> {
    return apiClient.delete(`/api/lookup/roles/${id}`);
  }

  async activateRole(id: string): Promise<Role> {
    return apiClient.post(`/api/lookup/roles/${id}/activate`, {});
  }

  async deactivateRole(id: string): Promise<Role> {
    return apiClient.post(`/api/lookup/roles/${id}/deactivate`, {});
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role> {
    return apiClient.post(`/api/lookup/roles/${roleId}/permissions`, { permissionIds });
  }

  async removePermissionsFromRole(roleId: string): Promise<Role> {
    return apiClient.delete(`/api/lookup/roles/${roleId}/permissions`);
  }

  // Permissions
  async createPermission(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    return apiClient.post('/api/lookup/permissions', permission);
  }

  async getPermissionById(id: string): Promise<Permission> {
    return apiClient.get(`/api/lookup/permissions/${id}`);
  }

  async getPermissions(): Promise<Permission[]> {
    return apiClient.get('/api/lookup/permissions');
  }

  async updatePermission(id: string, permission: Partial<Permission>): Promise<Permission> {
    return apiClient.put(`/api/lookup/permissions/${id}`, permission);
  }

  async deletePermission(id: string): Promise<void> {
    return apiClient.delete(`/api/lookup/permissions/${id}`);
  }

  async activatePermission(id: string): Promise<Permission> {
    return apiClient.post(`/api/lookup/permissions/${id}/activate`, {});
  }

  async deactivatePermission(id: string): Promise<Permission> {
    return apiClient.post(`/api/lookup/permissions/${id}/deactivate`, {});
  }

  // Bulk Operations
  async getAllLookupData(): Promise<LookupData> {
    return apiClient.get('/api/lookup/all');
  }

  async bulkCreateDepartments(departments: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Department[]> {
    return apiClient.post('/api/lookup/departments/bulk', { departments });
  }

  async bulkCreateRoles(roles: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Role[]> {
    return apiClient.post('/api/lookup/roles/bulk', { roles });
  }

  async bulkCreatePermissions(permissions: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Permission[]> {
    return apiClient.post('/api/lookup/permissions/bulk', { permissions });
  }

  // Search and Filter
  async searchDepartments(query: string): Promise<Department[]> {
    return apiClient.get(`/api/lookup/departments/search?q=${encodeURIComponent(query)}`);
  }

  async searchRoles(query: string): Promise<Role[]> {
    return apiClient.get(`/api/lookup/roles/search?q=${encodeURIComponent(query)}`);
  }

  async searchPermissions(query: string): Promise<Permission[]> {
    return apiClient.get(`/api/lookup/permissions/search?q=${encodeURIComponent(query)}`);
  }

  async getRolesByDepartment(departmentId: string): Promise<Role[]> {
    return apiClient.get(`/api/lookup/departments/${departmentId}/roles`);
  }

  async getPermissionsByRole(roleId: string): Promise<Permission[]> {
    return apiClient.get(`/api/lookup/roles/${roleId}/permissions`);
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return apiClient.get(`/api/lookup/permissions/module/${module}`);
  }
}

export const lookupApiService = new LookupApiService();
