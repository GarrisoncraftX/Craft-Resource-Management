import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, LogOut, Menu, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { fetchNotificationsByUserId, markNotificationAsRead, getUnreadNotificationCount, Notification } from '@/services/javabackendapi/systemApi';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface NavbarProps {
  title: string;
  onViewDashboard: () => void;
  onLogout: () => void;
  toggleSidebar: () => void;
  isEmployeeDashboard?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ title, onViewDashboard, onLogout, toggleSidebar, isEmployeeDashboard }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
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
  };

  const handleAccountClick = () => {
    navigate('/employee/info');
  };

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
              {title}
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
              {isEmployeeDashboard && (
                <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
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
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDashboard}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                {title === 'Employee Account' || title === 'Employee Profile' ? 'Back to Dashboard' : (isEmployeeDashboard ? 'View System' : 'View Dashboard')}
              </Button>

            {isEmployeeDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAccountClick}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isEmployeeDashboard && (
                  <DropdownMenuItem onClick={() => setIsNotificationOpen(true)}>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onViewDashboard}>
                  <Eye className="h-4 w-4 mr-2" />
                {title === 'Employee Account' || title === 'Employee Profile' ? 'Back to Dashboard' : (isEmployeeDashboard ? 'View System' : 'View Dashboard')}
                </DropdownMenuItem>
                {isEmployeeDashboard && (
                  <DropdownMenuItem onClick={handleAccountClick}>
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
