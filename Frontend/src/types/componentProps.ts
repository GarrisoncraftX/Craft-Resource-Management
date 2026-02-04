import type { ButtonProps } from '@/components/ui/button';
import type { DialogProps } from '@radix-ui/react-dialog';

// Common component props
export interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
}

export interface AccessibleFormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}

export interface ClockInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  clockInTime: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { employeeId: string; notes: string }) => void;
}

export interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export interface ExtendedPermissionGuardProps extends PermissionGuardProps {
  requiredPermission: string;
  requiredPermissions: string[];
}

export interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
}

export interface EmployeeAttendanceProps {
  employeeId: string;
}

export interface ModuleLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export interface NavbarProps {
  title: string;
  onViewDashboard?: () => void;
  onLogout: () => void;
  toggleSidebar: () => void;
  isEmployeeDashboard: boolean;
}

export interface SidebarToggleButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export type CommandDialogProps = DialogProps;
