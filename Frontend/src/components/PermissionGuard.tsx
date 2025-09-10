
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: string;
  requiredDepartment?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  requiredDepartment,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

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
    const hasAllPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );
    if (!hasAllPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
