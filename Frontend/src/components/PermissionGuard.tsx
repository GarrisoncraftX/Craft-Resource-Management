import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PermissionGuardProps } from '@/types/componentProps';

interface ExtendedPermissionGuardProps extends PermissionGuardProps {
  requiredPermissions?: string[];
  requiredRole?: string;
  requiredDepartment?: string;
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
}

/**
 * UNILAK Permission Guard Component
 * Enforces role-based access control on frontend components
 * Supports:
 * - Permission-based access (module.action format)
 * - Role-based access
 * - Department-based access
 * - Admin bypass (roleId = 1 has full access)
 */
export const PermissionGuard: React.FC<ExtendedPermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  requiredDepartment,
  requireAll = true,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  // Admin bypass: roleId = 1 (Admin) has full access
  if (user.roleId === 1 || user.roleId === '1') {
    return <>{children}</>;
  }

  // Check department requirement
  if (requiredDepartment && user.departmentId !== requiredDepartment) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole && user.roleId !== requiredRole) {
    return <>{fallback}</>;
  }

  // Check permissions requirement
  if (requiredPermissions.length > 0) {
    const userPermissions = user.permissions || [];
    
    const hasPermission = requireAll
      ? requiredPermissions.every(permission => userPermissions.includes(permission))
      : requiredPermissions.some(permission => userPermissions.includes(permission));
    
    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
