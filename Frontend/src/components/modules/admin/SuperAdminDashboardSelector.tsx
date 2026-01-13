import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  Users,
  Package,
  ShoppingCart,
  Shield,
  Scale,
  Megaphone,
  Map,
  Receipt,
  Heart,
  Truck,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const departmentModules = [
  {
    title: "Finance Management",
    url: "/finance/dashboard",
    icon: Calculator,
    description: "Financial operations, budgeting, and reporting",
    color: "bg-green-500",
    subModules: ["Chart of Accounts", "Budget Management", "Financial Reports"]
  },
  {
    title: "HR Management",
    url: "/hr",
    icon: Users,
    description: "Employee management and HR operations",
    color: "bg-blue-500",
    subModules: ["Employee Profiles", "Payroll Processing", "Leave Management"]
  },
  {
    title: "Asset Management",
    url: "/assets/dashboard",
    icon: Package,
    description: "Asset tracking and maintenance",
    color: "bg-purple-500",
    subModules: ["Asset Register", "Maintenance Management", "Asset Valuation"]
  },
  {
    title: "Procurement",
    url: "/procurement/dashboard",
    icon: ShoppingCart,
    description: "Procurement planning and vendor management",
    color: "bg-orange-500",
    subModules: ["Requisitioning", "Tendering", "Contract Management"]
  },
  {
    title: "Security",
    url: "/security/dashboard",
    icon: Shield,
    description: "Security management and access control",
    color: "bg-red-500",
    subModules: ["Visitor Management", "Access Control", "Security Incidents"]
  },
  {
    title: "Legal Affairs",
    url: "/legal/dashboard",
    icon: Scale,
    description: "Legal case management and compliance",
    color: "bg-indigo-500",
    subModules: ["Legal Cases", "Contract Review", "Compliance Monitoring"]
  },
  {
    title: "Public Relations",
    url: "/pr/dashboard",
    icon: Megaphone,
    description: "Media relations and public communications",
    color: "bg-pink-500",
    subModules: ["Press Releases", "Media Relations", "Public Events"]
  },
  {
    title: "Planning & Development",
    url: "/planning/dashboard",
    icon: Map,
    description: "Urban planning and project management",
    color: "bg-teal-500",
    subModules: ["Urban Planning", "Project Management", "Strategic Planning"]
  },
  {
    title: "Revenue & Tax",
    url: "/revenue/dashboard",
    icon: Receipt,
    description: "Tax assessment and revenue collection",
    color: "bg-yellow-500",
    subModules: ["Tax Assessment", "Revenue Tracking", "Property Tax"]
  },
  {
    title: "Health & Safety",
    url: "/health-safety/dashboard",
    icon: Heart,
    description: "Safety inspections and incident reporting",
    color: "bg-rose-500",
    subModules: ["Safety Inspections", "Incident Reporting", "Safety Training"]
  },
  {
    title: "Transportation",
    url: "/transportation/dashboard",
    icon: Truck,
    description: "Fleet management and vehicle maintenance",
    color: "bg-cyan-500",
    subModules: ["Fleet Management", "Vehicle Maintenance", "Driver Management"]
  },
  {
    title: "Reports & Analytics",
    url: "/reports/dashboard",
    icon: BarChart3,
    description: "Data analytics and custom reports",
    color: "bg-gray-500",
    subModules: ["Dashboard", "Custom Reports", "AI Insights"]
  }
];

export const SuperAdminDashboardSelector: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleModuleSelect = (url: string) => {
    navigate(url);
  };


  if (!user || user.roleCode !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Select a department module to access</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Department Module Access
              </CardTitle>
              <CardDescription className="text-blue-100">
                As a Super Admin, you have access to all department modules and their sub-menus
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentModules.map((module) => (
            <Card key={module.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${module.color} text-white mr-3`}>
                      <module.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </div>
                  <Badge variant="secondary">Access</Badge>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {module.subModules.map((subModule, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subModule}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => handleModuleSelect(module.url)}
                  className="w-full"
                  variant="default"
                >
                  Access {module.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Access</CardTitle>
              <CardDescription>
                Frequently accessed modules for Super Admin operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => handleModuleSelect('/hr')}
                  variant="outline"
                  className="flex flex-col h-20"
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">HR Module</span>
                </Button>
                <Button
                  onClick={() => handleModuleSelect('/finance/dashboard')}
                  variant="outline"
                  className="flex flex-col h-20"
                >
                  <Calculator className="h-6 w-6 mb-2" />
                  <span className="text-sm">Finance Module</span>
                </Button>
                <Button
                  onClick={() => handleModuleSelect('/assets/dashboard')}
                  variant="outline"
                  className="flex flex-col h-20"
                >
                  <Package className="h-6 w-6 mb-2" />
                  <span className="text-sm">Assets Module</span>
                </Button>
                <Button
                  onClick={() => handleModuleSelect('/reports/dashboard')}
                  variant="outline"
                  className="flex flex-col h-20"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Reports Module</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
