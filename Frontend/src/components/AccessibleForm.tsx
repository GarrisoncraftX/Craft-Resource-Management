
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AccessibleFormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  'aria-describedby'?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className,
  autoComplete,
  'aria-describedby': ariaDescribedBy,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ');

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={id}
        className={cn(
          'text-sm font-medium',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500",
          error && 'text-red-700'
        )}
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className={cn(
          'transition-colors',
          error && 'border-red-500 focus-visible:ring-red-500',
          'focus-visible:ring-2 focus-visible:ring-offset-2'
        )}
      />
      {error && (
        <p 
          id={errorId}
          role="alert"
          className="text-sm text-red-600"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};
