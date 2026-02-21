import React from 'react';
import { Button } from './button';
import { Eye, Home, LogOut, Bell, Clock, User, CheckCircle, XCircle, Menu } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { visitorApiService } from '@/services/pythonbackendapi/visitorApi';
import { toast } from 'sonner';
import bgImage from '@/assets/bgimage.jpg';
import logo from '@/assets/logo.png';
import { UnifySidebar } from './UnifySidebar';
import { fetchEmployeeById } from '@/services/api';
import type { Employee } from '@/services/api';
import { fetchNotificationsByUserId, markNotificationAsRead, getUnreadNotificationCount, Notification } from '@/services/javabackendapi/systemApi';

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
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [approvalDialog, setApprovalDialog] = React.useState<{ open: boolean; visitorId: string; visitorName: string } | null>(null);

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

  // Load notifications
  React.useEffect(() => {
    if (user?.userId) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

  const loadNotifications = async () => {
    if (!user?.userId) return;
    try {
      const [notifs, count] = await Promise.all([
        fetchNotificationsByUserId(user.userId),
        getUnreadNotificationCount(user.userId)
      ]);
      setNotifications(notifs || []);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead && notification.id) {
      try {
        await markNotificationAsRead(notification.id);
        await loadNotifications();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Check if it's a visitor approval notification
    if (notification.title === 'Visitor Approval Required' && notification.message) {
      const visitorIdMatch = notification.message.match(/Visitor ID: (\S+)/);
      const visitorNameMatch = notification.message.match(/^(.+?) is waiting/);
      if (visitorIdMatch && visitorNameMatch) {
        setApprovalDialog({
          open: true,
          visitorId: visitorIdMatch[1],
          visitorName: visitorNameMatch[1]
        });
        setIsNotificationOpen(false);
      }
    }
  };

  const handleApprove = async () => {
    if (!approvalDialog) return;
    try {
      await visitorApiService.approveVisitor(approvalDialog.visitorId);
      toast.success(`Visitor ${approvalDialog.visitorName} approved`);
      setApprovalDialog(null);
      await loadNotifications();
    } catch (error) {
      toast.error('Failed to approve visitor');
    }
  };

  const handleReject = async () => {
    if (!approvalDialog) return;
    try {
      await visitorApiService.rejectVisitor(approvalDialog.visitorId, 'Host declined the visit');
      toast.success(`Visitor ${approvalDialog.visitorName} rejected`);
      setApprovalDialog(null);
      await loadNotifications();
    } catch (error) {
      toast.error('Failed to reject visitor');
    }
  };

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
            {/* Mobile sidebar toggle - always visible on small screens */}
            <button
              onClick={() => {
                // Dispatch custom event to toggle sidebar
                window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
              }}
              className="sm:hidden flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent transition-colors flex-shrink-0"
              aria-label="Toggle sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
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
              <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent h-8 w-8 sm:h-10 sm:w-10">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 font-semibold border-b">Notifications</div>
                  <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((notif, index) => (
                        <React.Fragment key={notif.id}>
                          <DropdownMenuItem
                            className={`flex flex-col items-start p-3 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-sm">{notif.title}</span>
                              {!notif.isRead && <Badge className="bg-blue-500 h-2 w-2 p-0 rounded-full" />}
                            </div>
                            <span className="text-xs text-gray-600 mt-1">{notif.message}</span>
                            <span className="text-xs text-gray-400 mt-1">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                            </span>
                          </DropdownMenuItem>
                          {index < notifications.length - 1 && <Separator />}
                        </React.Fragment>
                      ))
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
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
      <main className="relative z-10 pt-14 sm:pt-16 min-h-screen transition-all duration-300 ease-in-out ml-0 sm:ml-16">
        <div className="p-2 sm:p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Visitor Approval Dialog */}
      {approvalDialog && (
        <Dialog open={approvalDialog.open} onOpenChange={(open) => !open && setApprovalDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Visitor Approval Request</DialogTitle>
              <DialogDescription>
                {approvalDialog.visitorName} is waiting for your approval.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">Visitor ID: {approvalDialog.visitorId}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ModuleLayout;