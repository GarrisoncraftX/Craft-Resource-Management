import React from 'react';
import { Button } from './button';
import { Eye, Home, LogOut, Bell, Clock, User } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import bgImage from '@/assets/bgimage.jpg';
import logo from '@/assets/logo.png';
import { UnifySidebar } from './UnifySidebar';
import { fetchEmployeeById } from '@/services/api';
import type { Employee } from '@/services/api';

interface ModuleLayoutProps {
  title?: string;
  onViewDashboard: () => void;
  onLogout: () => void;
  isEmployeeDashboard?: boolean;
  showSidebar?: boolean;
  children: React.ReactNode;
}

const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  title,
  onViewDashboard,
  onLogout,
  isEmployeeDashboard,
  showSidebar = true,
  children
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [employeeData, setEmployeeData] = React.useState<Employee | null>(null);

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch employee data for profile picture
  React.useEffect(() => {
    if (user?.userId) {
      fetchEmployeeById(user.userId)
        .then(setEmployeeData)
        .catch(error => console.error('Failed to load employee data:', error));
    }
  }, [user?.userId]);

  const handleBackToAdmin = () => {
    navigate('/admin/dashboard');
  };

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Blurred overlay */}
      <div className="fixed inset-0 backdrop-blur-md bg-background/10 z-0" />
      
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-card/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
        <div className="h-full px-2 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-shrink">
            {/* Logo */}
            <div className="flex items-center gap-1 sm:gap-3 min-w-0">
              <img 
                src={logo} 
                alt="CRMS Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-full flex-shrink-0"
              />
              <div className="hidden md:block">
                <h1 className="text-sm lg:text-lg font-bold text-foreground leading-tight">
                  Craft Resource Management System
                </h1>
              </div>
              <div className="md:hidden">
                <h1 className="text-sm sm:text-base font-bold text-foreground">CRMS</h1>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Live Clock */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full text-white shadow-md">
              <Clock className="w-3 h-3" />
              <span className="font-mono text-xs font-medium">{formatTime(currentTime)}</span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-destructive rounded-full ring-1 sm:ring-2 ring-card" />
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {user?.roleCode === 'SUPER_ADMIN' && title !== 'Admin Dashboard' && !isEmployeeDashboard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToAdmin}
                  className="text-muted-foreground hover:text-foreground rounded-full text-xs px-2"
                >
                  <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xl:inline">Admin</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDashboard}
                className="text-muted-foreground hover:text-foreground rounded-full text-xs px-2"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xl:inline">{isEmployeeDashboard ? 'View Dashboard' : 'Employee Portal'}</span>
              </Button>

              {isEmployeeDashboard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/employee/info')}
                  className="text-muted-foreground hover:text-foreground rounded-full text-xs px-2"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xl:inline">Account</span>
                </Button>
              )}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 sm:h-10 gap-1 sm:gap-2 pl-1 pr-1 sm:pl-2 sm:pr-3 rounded-full hover:bg-accent">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-1 sm:ring-2 ring-primary/20">
                    {employeeData?.profilePictureUrl ? (
                      <AvatarImage src={employeeData.profilePictureUrl} alt={`${user?.firstName} ${user?.lastName}`} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm font-medium">
                        {userInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[100px] lg:max-w-none">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[10px] sm:text-xs text-emerald-500 flex items-center gap-1">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-xl">
                <div className="px-3 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                
                {/* Mobile-only items */}
                <div className="lg:hidden py-1">
                  {user?.roleCode === 'SUPER_ADMIN' && title !== 'Admin Dashboard' && !isEmployeeDashboard && (
                    <DropdownMenuItem onClick={handleBackToAdmin}>
                      <Home className="h-4 w-4 mr-2" />
                      Back to Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onViewDashboard}>
                    <Eye className="h-4 w-4 mr-2" />
                    {isEmployeeDashboard ? 'View Dashboard' : 'Employee Portal'}
                  </DropdownMenuItem>
                  {isEmployeeDashboard && (
                    <DropdownMenuItem onClick={() => navigate('/employee/info')}>
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem onClick={() => navigate('/employee/info')} className="py-2">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive py-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {showSidebar && <UnifySidebar />}

      {/* Main Content */}
      <main className={`relative z-10 pt-14 sm:pt-16 min-h-screen transition-all duration-300 ease-in-out sm:ml-16`}>
        <div className="p-2 sm:p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ModuleLayout;