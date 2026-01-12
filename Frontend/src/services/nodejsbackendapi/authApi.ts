import { apiClient } from '@/utils/apiClient';
import type {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  VerifyEmailRequest,
  Session
} from '@/types/nodejsbackendapi/authTypes';

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

  async confirmPasswordReset(confirmData: ConfirmResetPasswordRequest): Promise<void> {
    return apiClient.post('/api/auth/confirm-password-reset', confirmData);
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
