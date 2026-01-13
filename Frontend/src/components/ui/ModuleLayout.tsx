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
import bgImage from '../../../assets/bgimage.jpg';
import logo from '../../../assets/logo.png';
import { UnifySidebar } from './UnifySidebar';

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

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      <header className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="CRMS Logo" 
                className="h-10 w-10 object-contain rounded-full"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground leading-tight">
                  Craft Resource Management System
                </h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-foreground">CRMS</h1>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full text-white shadow-md">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm font-medium">{formatTime(currentTime)}</span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-card" />
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {user?.roleCode === 'SUPER_ADMIN' && title !== 'Admin Dashboard' && !isEmployeeDashboard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToAdmin}
                  className="text-muted-foreground hover:text-foreground rounded-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDashboard}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isEmployeeDashboard ? 'View Dashboard' : 'Employee Portal'}
              </Button>

              {isEmployeeDashboard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/employee/info')}
                  className="text-muted-foreground hover:text-foreground rounded-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              )}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 gap-3 pl-2 pr-4 rounded-full hover:bg-accent">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                <div className="md:hidden py-1">
                  {user?.roleCode === 'SUPER_ADMIN' && title !== 'Admin Dashboard' && !isEmployeeDashboard && (
                    <DropdownMenuItem onClick={handleBackToAdmin}>
                      <Home className="h-4 w-4 mr-2" />
                      Back to Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onViewDashboard}>
                    <Eye className="h-4 w-4 mr-2" />
                    {isEmployeeDashboard ? 'View System' : 'View Dashboard'}
                  </DropdownMenuItem>
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
      <main className={`relative z-10 pt-16 min-h-screen transition-all duration-300 ease-in-out ${showSidebar ? 'ml-16' : ''}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ModuleLayout;