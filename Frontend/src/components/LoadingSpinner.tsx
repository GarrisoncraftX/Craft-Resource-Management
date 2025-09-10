
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div 
      className={cn('flex flex-col items-center justify-center p-8', className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 
        className={cn('animate-spin text-blue-600', sizeClasses[size])} 
        aria-hidden="true"
      />
      <span className="mt-2 text-sm text-gray-600" aria-label={text}>
        {text}
      </span>
    </div>
  );
};

export const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading page..." />
  </div>
);
