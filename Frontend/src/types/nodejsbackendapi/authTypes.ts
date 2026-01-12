export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  department?: string;
}

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
  profilePictureUrl?: string;
  defaultPasswordChanged?: boolean;
  profileCompleted?: boolean;
  hiredDate?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  token: string | null;
}


export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AdminResetPasswordRequest {
  userId: string;
}

export interface AdminResetPasswordResponse {
  success: boolean;
  message: string;
  defaultPassword: string;
}

export interface Session {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}
