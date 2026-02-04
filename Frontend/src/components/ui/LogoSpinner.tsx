import logo from '@/assets/logo.png';

interface LogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LogoSpinner: React.FC<LogoSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logo} 
        alt="Loading..." 
        className={`${sizeClasses[size]} animate-spin rounded-full`}
      />
    </div>
  );
};
