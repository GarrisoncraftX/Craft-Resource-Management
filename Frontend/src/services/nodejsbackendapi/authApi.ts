import { apiClient } from '@/utils/apiClient';

// Types for Auth API
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
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
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

export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
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

class AuthApiService {
  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/api/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post('/api/auth/register', userData);
  }

  async logout(): Promise<void> {
    return apiClient.post('/api/auth/logout', {});
  }

  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<AuthResponse> {
    return apiClient.post('/api/auth/refresh-token', refreshTokenData);
  }

  // Password Management
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    return apiClient.post('/api/auth/change-password', passwordData);
  }

  async requestPasswordReset(resetData: ResetPasswordRequest): Promise<void> {
    return apiClient.post('/api/auth/request-password-reset', resetData);
  }

  async confirmPasswordReset(resetData: ConfirmResetPasswordRequest): Promise<void> {
    return apiClient.post('/api/auth/confirm-password-reset', resetData);
  }

  // Email Verification
  async verifyEmail(verificationData: VerifyEmailRequest): Promise<void> {
    return apiClient.post('/api/auth/verify-email', verificationData);
  }

  async resendVerificationEmail(): Promise<void> {
    return apiClient.post('/api/auth/resend-verification', {});
  }

  // User Profile
  async getCurrentUser(): Promise<User> {
    return apiClient.get('/api/auth/me');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return apiClient.put('/api/auth/profile', userData);
  }

  // Session Management
  async getActiveSessions(): Promise<Session[]> {
    return apiClient.get('/api/auth/sessions');
  }

  async revokeSession(sessionId: string): Promise<void> {
    return apiClient.delete(`/api/auth/sessions/${sessionId}`);
  }

  async revokeAllSessions(): Promise<void> {
    return apiClient.post('/api/auth/sessions/revoke-all', {});
  }
}

export const authApiService = new AuthApiService();
