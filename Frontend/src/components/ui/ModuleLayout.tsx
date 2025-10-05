import React from 'react';
import { Button } from './button';
import { Eye, Home, LogOut, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UnifySidebar } from './UnifySidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ModuleLayoutProps {
  title: string;
  onViewDashboard: () => void;
  onLogout: () => void;
  isEmployeeDashboard?: boolean;
  children: React.ReactNode;
}

const ModuleLayout: React.FC<ModuleLayoutProps> = ({ title, onViewDashboard, onLogout, isEmployeeDashboard, children, }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  
  const handleBackToAdmin = () => {
    navigate('/admin/dashboard');
  };
        

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-dashboard">
        <UnifySidebar />
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-blue-900">{title}</h1>
                </div>
                <div className="hidden md:flex items-center space-x-4">
             {/* Back to Admin button for SUPER_ADMIN users */}
                      {user?.roleCode === 'SUPER_ADMIN' && title !== 'Admin Dashboard' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToAdmin}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Back to Admin
                        </Button>
                      )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewDashboard}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isEmployeeDashboard ? 'View System' : 'View Dashboard'}
                  </Button>
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
                        {/* Back to Admin button for SUPER_ADMIN users in mobile menu */}
                      {user?.roleCode === 'SUPER_ADMIN' && title !== 'Admin Dashboard' && (
                        <DropdownMenuItem onClick={handleBackToAdmin}>
                          <Home className="h-4 w-4 mr-2" />
                          Back to Admin
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={onViewDashboard}>
                        <Eye className="h-4 w-4 mr-2" />
                        {isEmployeeDashboard ? 'View System' : 'View Dashboard'}
                      </DropdownMenuItem>
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
          <main className="flex-1 p-6 mt-16 bg-background overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ModuleLayout;
