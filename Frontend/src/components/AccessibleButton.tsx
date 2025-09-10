
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  ariaLabel,
  ariaDescribedBy,
  loading = false,
  loadingText = 'Loading...',
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={cn(
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'transition-all duration-200',
        className
      )}
    >
      {loading ? loadingText : children}
    </Button>
  );
};
