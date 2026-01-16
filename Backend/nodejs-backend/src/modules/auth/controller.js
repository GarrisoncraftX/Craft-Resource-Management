const authService = require('./service');
const communicationService = require('../communication/service');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { biometric_type, raw_data, biometric_type_face, raw_data_face, biometric_type_fingerprint, raw_data_fingerprint, ...userData } = req.body;
    const user = await authService.register({ ...userData, biometric_type, raw_data, biometric_type_face, raw_data_face, biometric_type_fingerprint, raw_data_fingerprint });
    const { passwordHash, ...responseUserData } = user.toJSON();
    res.status(201).json(responseUserData);
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { employeeId, password, biometric_type, raw_data } = req.body; 
    const result = await authService.signin(employeeId, password, biometric_type, raw_data);
    res.json(result);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(401).json({ message: error.message, error: error.message });
  }
};

const logout = async (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await authService.getUserById(decoded.userId || decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newToken = authService.generateToken(user);
    res.json({ token: newToken, user });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId || req.user.id;

    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ error: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const defaultPassword = await authService.createPasswordResetToken(email);
    
    await communicationService.sendPasswordResetEmail(email, defaultPassword);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(400).json({ error: error.message });
  }
};

const confirmPasswordReset = async (req, res) => {
  res.status(404).json({ error: 'Not needed - password reset on request' });
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(400).json({ error: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const verificationToken = await authService.createEmailVerificationToken(userId);
    const user = await authService.getUserById(userId);
    
    await communicationService.sendVerificationEmail(user.email, verificationToken);
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(400).json({ error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await authService.getUserById(userId);
    const { passwordHash, ...userData } = user.toJSON();
    res.json(userData);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(400).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const updates = req.body;
    const updatedUser = await authService.updateUserProfile(userId, updates);
    const { passwordHash, ...userData } = updatedUser.toJSON();
    res.json(userData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message });
  }
};

const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const sessions = await authService.getUserSessions(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(400).json({ error: error.message });
  }
};

const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId || req.user.id;
    await authService.revokeSession(userId, sessionId);
    res.json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(400).json({ error: error.message });
  }
};

const revokeAllSessions = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    await authService.revokeAllSessions(userId);
    res.json({ success: true, message: 'All sessions revoked successfully' });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(400).json({ error: error.message });
  }
};

const hrCreateEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, departmentId, jobGradeId, roleId } = req.body;
    const hrUserId = req.user.userId || req.user.id;

    const employeeId = await authService.hrCreateEmployee(
      firstName,
      lastName,
      email,
      departmentId,
      jobGradeId,
      roleId,
      hrUserId
    );

    const defaultPassword = 'CRMSemp123!';
    await communicationService.sendEmployeeWelcomeEmail(
      email,
      firstName,
      lastName,
      employeeId,
      defaultPassword
    );

    res.status(201).json({
      success: true,
      employeeId,
      message: 'Employee created and email sent successfully'
    });
  } catch (error) {
    console.error('HR Create Employee Error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to create employee';
    res.status(statusCode).json({ error: message });
  }
};

const adminResetPassword = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminUserId = req.user.userId || req.user.id;

    const defaultPassword = await authService.adminResetPassword(adminUserId, userId);
    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      defaultPassword 
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  signin,
  logout,
  refreshToken,
  changePassword,
  requestPasswordReset,
  confirmPasswordReset,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  updateProfile,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  hrCreateEmployee,
  adminResetPassword,
};
