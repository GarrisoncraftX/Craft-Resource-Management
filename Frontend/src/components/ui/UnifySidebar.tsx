import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Calculator, Users, Package, ShoppingCart, Shield, Scale, Megaphone, Map, Receipt, Heart, Truck, BarChart3, ChevronDown } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuth } from '@/contexts/AuthContext'

const modules = [
  {
    title: "Finance Management",
    url: "/finance",
    icon: Calculator,
    subItems: [
      { title: "Chart of Accounts", url: "/finance/accounts" },
      { title: "Budget Management", url: "/finance/budget" },
      { title: "Journal Entries", url: "/finance/journal" },
      { title: "Accounts Payable", url: "/finance/payable" },
      { title: "Accounts Receivable", url: "/finance/receivable" },
      { title: "Financial Reports", url: "/finance/reports" },
    ]
  },
  {
    title: "HR Management",
    url: "/hr",
    icon: Users,
    subItems: [
      { title: "Employee Profiles", url: "/hr/employees" },
      { title: "Payroll Processing", url: "/hr/payroll" },
      { title: "Leave Management", url: "/hr/leave" },
      { title: "Training & Development", url: "/hr/training" },
      { title: "Performance Management", url: "/hr/performance" },
    ]
  },
  {
    title: "Asset Management",
    url: "/assets",
    icon: Package,
    subItems: [
      { title: "Asset Register", url: "/assets/register" },
      { title: "Asset Acquisition", url: "/assets/acquisition" },
      { title: "Maintenance Management", url: "/assets/maintenance" },
      { title: "Asset Disposal", url: "/assets/disposal" },
      { title: "Asset Valuation", url: "/assets/valuation" },
    ]
  },
  {
    title: "Procurement",
    url: "/procurement",
    icon: ShoppingCart,
    subItems: [
      { title: "Procurement Planning", url: "/procurement/planning" },
      { title: "Requisitioning", url: "/procurement/requisitioning" },
      { title: "Tendering", url: "/procurement/tendering" },
      { title: "Bid Evaluation", url: "/procurement/bid-evaluation" },
      { title: "Contract Management", url: "/procurement/contracts" },
      { title: "Vendor Management", url: "/procurement/vendors" },
    ]
  },
  {
    title: "Security",
    url: "/security",
    icon: Shield,
    subItems: [
      { title: "Security Management", url: "/security/management" },
      { title: "Visitor Management", url: "/security/visitors" },
      { title: "Access Control", url: "/security/access-control" },
      { title: "Security Incidents", url: "/security/incidents" },
      { title: "ID Card Management", url: "/security/id-cards" },
    ]
  },
  {
    title: "Legal Affairs",
    url: "/legal",
    icon: Scale,
    subItems: [
      { title: "Legal Management", url: "/legal/management" },
      { title: "Legal Cases", url: "/legal/cases" },
      { title: "Contract Review", url: "/legal/contract-review" },
      { title: "Compliance Monitoring", url: "/legal/compliance" },
      { title: "Legal Documents", url: "/legal/documents" },
      { title: "Legal Opinions", url: "/legal/opinions" },
    ]
  },
  {
    title: "Public Relations",
    url: "/pr",
    icon: Megaphone,
    subItems: [
      { title: "Press Releases", url: "/pr/press-releases" },
      { title: "Media Relations", url: "/pr/media-relations" },
      { title: "Social Media", url: "/pr/social-media" },
      { title: "Public Events", url: "/pr/events" },
    ]
  },
  {
    title: "Planning & Development",
    url: "/planning",
    icon: Map,
    subItems: [
      { title: "Urban Planning", url: "/planning/urban" },
      { title: "Project Management", url: "/planning/projects" },
      { title: "Policy Development", url: "/planning/policies" },
      { title: "Strategic Planning", url: "/planning/strategic" },
      { title: "Development Permits", url: "/planning/permits" },
    ]
  },
  {
    title: "Revenue & Tax",
    url: "/revenue",
    icon: Receipt,
    subItems: [
      { title: "Tax Assessment", url: "/revenue/tax-assessment" },
      { title: "Tax Management", url: "/revenue/tax-management" },
      { title: "Revenue Tracking", url: "/revenue/tracking" },
      { title: "Revenue Collection", url: "/revenue/collection" },
      { title: "Property Tax", url: "/revenue/property-tax" },
      { title: "Business Permits", url: "/revenue/business-permits" },
    ]
  },
  {
    title: "Health & Safety",
    url: "/health-safety",
    icon: Heart,
    subItems: [
      { title: "Safety Inspections", url: "/health-safety/inspections" },
      { title: "Incident Reporting", url: "/health-safety/incidents" },
      { title: "Safety Training", url: "/health-safety/training" },
      { title: "Environmental Health", url: "/health-safety/environmental" },
    ]
  },
  {
    title: "Transportation",
    url: "/transportation",
    icon: Truck,
    subItems: [
      { title: "Fleet Management", url: "/transportation/fleet" },
      { title: "Vehicle Maintenance", url: "/transportation/maintenance" },
      { title: "Driver Management", url: "/transportation/drivers" },
      { title: "Route Planning", url: "/transportation/routes" },
      { title: "Fuel Management", url: "/transportation/fuel" },
    ]
  },
  {
    title: "Reports & Analytics",
    url: "/reports",
    icon: BarChart3,
    subItems: [
      { title: "Dashboard", url: "/reports/dashboard" },
      { title: "Custom Reports", url: "/reports/custom" },
      { title: "AI Insights", url: "/reports/ai-insights" },
      { title: "Data Analytics", url: "/reports/analytics" },
    ]
  }
]

export function UnifySidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/")

  // Check if a module or any of its sub-items are active to control the collapsible state
  const isExpanded = (module: typeof modules[0]) =>
    module.subItems.some(item => isActive(item.url)) || isActive(module.url)

  const { user } = useAuth()

  const filteredModules = React.useMemo(() => {
    if (!user) return []

    const departmentModuleMap: Record<string, string> = {
      'FINANCE': 'Finance Management',
      'HR': 'HR Management',
      'PROCUREMENT': 'Procurement',
      'LEGAL': 'Legal Affairs',
      'PLANNING': 'Planning & Development',
      'TRANSPORTATION': 'Transportation',
      'HEALTH_SAFETY': 'Health & Safety',
      'PUBLIC_RELATIONS': 'Public Relations',
      'REVENUE_TAX': 'Revenue & Tax',
      'SECURITY': 'Security',
      'ASSETS': 'Asset Management',
    }

    const adminRoles = ['ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN']

    if (adminRoles.includes(user.roleCode)) {
      return modules
    }

    const moduleTitle = departmentModuleMap[user.departmentCode]
    if (moduleTitle) {
      return modules.filter(m => m.title === moduleTitle)
    }

    return modules.filter(m => m.title === 'Dashboard')
  }, [user])

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-70"} mt-16`} collapsible="icon">
      <SidebarContent className="p-2 mt-15">
        <SidebarGroup>
          <SidebarMenu>
            {filteredModules.map((module) => (
              <SidebarMenuItem key={module.title}>
                {module.subItems.length > 0 ? (
                  <Collapsible defaultOpen={isExpanded(module)}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={`w-full justify-between transition-all duration-200 ${
                          module.subItems.some(item => location.pathname.startsWith(item.url))
                            ? "bg-blue-600 text-white shadow-md border-l-4 border-blue-300"
                            : "hover:bg-blue-100 hover:text-blue-700"
                        }`}
                      >
                        <div className="flex items-center">
                          <module.icon className="w-4 h-4 mr-3" />
                          {!isCollapsed && <span>{module.title}</span>}
                        </div>
                        {!isCollapsed && <ChevronDown className="w-4 h-4" />}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!isCollapsed && (
                      <CollapsibleContent className="ml-4 mt-1 space-y-1">
                        {module.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.title}
                            to={subItem.url}
                            className={({ isActive }) =>
                              `block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? "bg-blue-300 text-white shadow-md border-l-4 border-blue-300 transform scale-[1.02]"
                                  : "text-muted-foreground hover:bg-blue-100 hover:text-blue-700 hover:border-l-2 hover:border-blue-200"
                              }`
                            }
                          >
                            {subItem.title}
                          </NavLink>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={module.url}
                      className={({ isActive }) =>
                        `flex items-center w-full px-3 py-2 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md border-l-4 border-blue-300"
                            : "hover:bg-blue-100 hover:text-blue-700"
                        }`
                      }
                    >
                      <module.icon className="w-4 h-4 mr-3" />
                      {!isCollapsed && <span>{module.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
          <div className="flex items-center justify-between p-4 border-b">
        <div className={`font-bold text-lg text-blue-600 transition-opacity ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
        </div>
        <SidebarTrigger />
      </div>

      </SidebarContent>
    </Sidebar>
  )
}
