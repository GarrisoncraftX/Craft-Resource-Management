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
