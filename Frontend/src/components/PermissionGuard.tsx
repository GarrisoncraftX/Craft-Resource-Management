
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PermissionGuardProps } from '@/types/componentProps';

interface ExtendedPermissionGuardProps extends PermissionGuardProps {
  requiredPermissions?: string[];
  requiredRole?: string;
  requiredDepartment?: string;
}

export const PermissionGuard: React.FC<ExtendedPermissionGuardProps> = ({
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
