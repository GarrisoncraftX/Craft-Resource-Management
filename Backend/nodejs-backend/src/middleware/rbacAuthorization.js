/**
 * UNILAK RBAC Authorization Middleware
 * Enforces role-based access control with permission checking
 * Supports correlation ID for audit logging
 */

const rbacAuthorization = (requiredPermissions = []) => {
  return (req, res, next) => {
    const correlationId = req.headers['x-correlation-id'];
    
    if (!req.user) {
      console.error(`[${correlationId}] RBAC: User not authenticated`);
      return res.status(401).json({ 
        error: 'User not authenticated',
        correlationId 
      });
    }

    const userPermissions = req.user.permissions || [];
    const userId = req.user.userId;
    const roleId = req.user.roleId;
    
    // Admin role (roleId = 1) has full access
    if (roleId === 1) {
      console.log(`[${correlationId}] RBAC: Admin access granted for user ${userId}`);
      return next();
    }

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      const missingPermissions = requiredPermissions.filter(
        permission => !userPermissions.includes(permission)
      );
      
      console.warn(
        `[${correlationId}] RBAC: Access denied for user ${userId}. ` +
        `Missing permissions: ${missingPermissions.join(', ')}`
      );
      
      return res.status(403).json({ 
        error: 'Forbidden: insufficient permissions',
        missingPermissions,
        correlationId
      });
    }

    console.log(`[${correlationId}] RBAC: Access granted for user ${userId}`);
    next();
  };
};

module.exports = rbacAuthorization;
