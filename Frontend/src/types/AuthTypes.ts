export interface User {
  userId: string;
  employeeId: string;
  departmentId: string;
  departmentCode: string;
  roleCode: string;
  roleId: string;
  permissions: string[];
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  token: string | null;
}
