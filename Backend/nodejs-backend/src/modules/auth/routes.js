const express = require('express');
const authController = require('./controller');
const { validateToken } = require('../../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/signin', authController.signin);
router.post('/login', authController.signin);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/change-password', validateToken, authController.changePassword);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/confirm-password-reset', authController.confirmPasswordReset);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', validateToken, authController.resendVerification);
router.get('/me', validateToken, authController.getCurrentUser);
router.put('/profile', validateToken, authController.updateProfile);
router.get('/sessions', validateToken, authController.getActiveSessions);
router.delete('/sessions/:sessionId', validateToken, authController.revokeSession);
router.post('/sessions/revoke-all', validateToken, authController.revokeAllSessions);
router.post('/hr/create-employee', validateToken, authController.hrCreateEmployee);
router.post('/admin/reset-password', validateToken, authController.adminResetPassword);

module.exports = router;
