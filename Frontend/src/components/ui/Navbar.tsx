import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, LogOut, Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  title: string;
  onViewDashboard: () => void;
  onLogout: () => void;
  toggleSidebar: () => void;
  isEmployeeDashboard?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ title, onViewDashboard, onLogout, toggleSidebar, isEmployeeDashboard }) => {
  const navigate = useNavigate();

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
                <DropdownMenuItem onClick={onViewDashboard}>
                  <Eye className="h-4 w-4 mr-2" />
                  {isEmployeeDashboard ? 'View System' : 'View Dashboard'}
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
