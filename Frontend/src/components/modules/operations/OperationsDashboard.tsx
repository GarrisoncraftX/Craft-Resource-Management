import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Wrench, 
  ShoppingCart, 
  Shield, 
  Truck, 
  BarChart3, 
  Users, 
  ClipboardCheck,
  Package
} from "lucide-react";

export const OperationsDashboard = () => {
  const navigate = useNavigate();

  const operationalModules = [
    {
      title: "Facilities Management",
      description: "Manage assets and facilities",
      icon: Building2,
      path: "/assets/dashboard",
      color: "text-blue-600"
    },
    {
      title: "Maintenance Management",
      description: "Track and schedule maintenance",
      icon: Wrench,
      path: "/assets/maintenance",
      color: "text-orange-600"
    },
    {
      title: "Procurement Operations",
      description: "Manage procurement processes",
      icon: ShoppingCart,
      path: "/procurement/dashboard",
      color: "text-green-600"
    },
    {
      title: "Vendor Management",
      description: "Manage vendor relationships",
      icon: Users,
      path: "/procurement/vendors",
      color: "text-purple-600"
    },
    {
      title: "Health & Safety",
      description: "Monitor health and safety compliance",
      icon: Shield,
      path: "/health-safety/dashboard",
      color: "text-red-600"
    },
    {
      title: "Transportation",
      description: "Manage transportation operations",
      icon: Truck,
      path: "/transportation",
      color: "text-indigo-600"
    },
    {
      title: "Performance Analytics",
      description: "View operational reports and analytics",
      icon: BarChart3,
      path: "/reports/analytics",
      color: "text-cyan-600"
    },
    {
      title: "Quality Control",
      description: "Monitor quality standards",
      icon: ClipboardCheck,
      path: "/reports/dashboard",
      color: "text-teal-600"
    },
    {
      title: "Inventory Management",
      description: "Track inventory and stock levels",
      icon: Package,
      path: "/assets/register",
      color: "text-amber-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Centralized access to all operational management functions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operationalModules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.path} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(module.path)}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100 ${module.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(module.path);
                  }}
                >
                  Access Module
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
