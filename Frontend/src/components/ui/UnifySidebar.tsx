import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Calculator, Users, Package, ShoppingCart, Shield, Scale,
  Megaphone, Map, Receipt, Heart, Truck, BarChart3, ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from '@/contexts/AuthContext'

const modules = [
  {
    title: "Finance",
    url: "/finance",
    icon: Calculator,
    color: "from-blue-500 to-blue-600",
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
    title: "HR",
    url: "/hr",
    icon: Users,
    color: "from-rose-500 to-rose-600",
    subItems: [
      { title: "Employees Attendance", url: "/hr/attendance" },
      { title: "Employees", url: "/hr/employees" },
      { title: "Payroll Processing", url: "/hr/payroll" },
      { title: "Leave Management", url: "/hr/leave" },
      { title: "Training & Development", url: "/hr/training" },
      { title: "Performance", url: "/hr/performance" },
    ]
  },
  {
    title: "Assets",
    url: "/assets",
    icon: Package,
    color: "from-amber-500 to-amber-600",
    subItems: [
      { title: "Asset Register", url: "/assets/register" },
      { title: "Asset Acquisition", url: "/assets/acquisition" },
      { title: "Maintenance", url: "/assets/maintenance" },
      { title: "Asset Disposal", url: "/assets/disposal" },
      { title: "Asset Valuation", url: "/assets/valuation" },
    ]
  },
  {
    title: "Procurement",
    url: "/procurement",
    icon: ShoppingCart,
    color: "from-emerald-500 to-emerald-600",
    subItems: [
      { title: "Planning", url: "/procurement/planning" },
      { title: "Requisitioning", url: "/procurement/requisitioning" },
      { title: "Tendering", url: "/procurement/tendering" },
      { title: "Bid Evaluation", url: "/procurement/bid-evaluation" },
      { title: "Contracts", url: "/procurement/contracts" },
      { title: "Vendors", url: "/procurement/vendors" },
    ]
  },
  {
    title: "Security",
    url: "/security",
    icon: Shield,
    color: "from-violet-500 to-violet-600",
    subItems: [
      { title: "Management", url: "/security/management" },
      { title: "Employees Attendance", url: "/security/attendance" },
      { title: "Visitors", url: "/security/visitors" },
      { title: "Access Control", url: "/security/access-control" },
      { title: "Incidents", url: "/security/incidents" },
      { title: "ID Cards", url: "/security/id-cards" },
    ]
  },
  {
    title: "Legal",
    url: "/legal",
    icon: Scale,
    color: "from-slate-500 to-slate-600",
    subItems: [
      { title: "Management", url: "/legal/management" },
      { title: "Cases", url: "/legal/cases" },
      { title: "Contract Review", url: "/legal/contract-review" },
      { title: "Compliance", url: "/legal/compliance" },
      { title: "Documents", url: "/legal/documents" },
      { title: "Opinions", url: "/legal/opinions" },
    ]
  },
  {
    title: "PR",
    url: "/pr",
    icon: Megaphone,
    color: "from-pink-500 to-pink-600",
    subItems: [
      { title: "Press Releases", url: "/pr/press-releases" },
      { title: "Media Relations", url: "/pr/media-relations" },
      { title: "Social Media", url: "/pr/social-media" },
      { title: "Public Events", url: "/pr/events" },
    ]
  },
  {
    title: "Planning",
    url: "/planning",
    icon: Map,
    color: "from-cyan-500 to-cyan-600",
    subItems: [
      { title: "Urban Planning", url: "/planning/urban" },
      { title: "Projects", url: "/planning/projects" },
      { title: "Policies", url: "/planning/policies" },
      { title: "Strategic", url: "/planning/strategic" },
      { title: "Permits", url: "/planning/permits" },
    ]
  },
  {
    title: "Revenue",
    url: "/revenue",
    icon: Receipt,
    color: "from-orange-500 to-orange-600",
    subItems: [
      { title: "Tax Assessment", url: "/revenue/tax-assessment" },
      { title: "Tax Management", url: "/revenue/tax-management" },
      { title: "Tracking", url: "/revenue/tracking" },
      { title: "Collection", url: "/revenue/collection" },
      { title: "Property Tax", url: "/revenue/property-tax" },
      { title: "Business Permits", url: "/revenue/business-permits" },
    ]
  },
  {
    title: "Health",
    url: "/health-safety",
    icon: Heart,
    color: "from-red-500 to-red-600",
    subItems: [
      { title: "Inspections", url: "/health-safety/inspections" },
      { title: "Incidents", url: "/health-safety/incidents" },
      { title: "Training", url: "/health-safety/training" },
      { title: "Environmental", url: "/health-safety/environmental" },
    ]
  },
  {
    title: "Transport",
    url: "/transportation",
    icon: Truck,
    color: "from-indigo-500 to-indigo-600",
    subItems: [
      { title: "Fleet", url: "/transportation/fleet" },
      { title: "Maintenance", url: "/transportation/maintenance" },
      { title: "Drivers", url: "/transportation/drivers" },
      { title: "Routes", url: "/transportation/routes" },
      { title: "Fuel", url: "/transportation/fuel" },
    ]
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    color: "from-teal-500 to-teal-600",
    subItems: [
      { title: "Dashboard", url: "/reports/dashboard" },
      { title: "Custom Reports", url: "/reports/custom" },
      { title: "AI Insights", url: "/reports/ai-insights" },
      { title: "Analytics", url: "/reports/analytics" },
    ]
  }
]

export function UnifySidebar() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  const [manuallyOpenedModule, setManuallyOpenedModule] = useState<string | null>(null)
  const [preventHover, setPreventHover] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const getActiveModule = () => {
    for (const module of modules) {
      if (location.pathname.startsWith(module.url)) {
        return module
      }
    }
    return null
  }

  const activeModule = getActiveModule()

  const filteredModules = React.useMemo(() => {
    if (!user) return []

    const departmentModuleMap: Record<string, string> = {
      'FINANCE': 'Finance',
      'HR': 'HR',
      'PROCUREMENT': 'Procurement',
      'LEGAL': 'Legal',
      'PLANNING': 'Planning',
      'TRANSPORTATION': 'Transport',
      'HEALTH_SAFETY': 'Health',
      'PUBLIC_RELATIONS': 'PR',
      'REVENUE_TAX': 'Revenue',
      'SECURITY': 'Security',
      'ASSETS': 'Assets',
    }

    const adminRoles = ['ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN']

    if (adminRoles.includes(user.roleCode)) {
      return modules
    }

    const moduleTitle = departmentModuleMap[user.departmentCode]
    if (moduleTitle) {
      return modules.filter(m => m.title === moduleTitle)
    }

    return modules.filter(m => m.title === 'Reports')
  }, [user])

  const currentHoveredOrActive = hoveredModule
    ? modules.find(m => m.title === hoveredModule)
    : manuallyOpenedModule
    ? modules.find(m => m.title === manuallyOpenedModule)
    : null

  const hoveredOrManualIndex = filteredModules.findIndex(m => m.title === hoveredModule || m.title === manuallyOpenedModule)

  return (
    <div 
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex"
      onMouseLeave={() => setHoveredModule(null)}
    >
      {/* Icon Strip - Always visible */}
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-1 relative overflow-y-auto">
        {filteredModules.map((module) => {
          const isActive = activeModule?.title === module.title
          const isHovered = hoveredModule === module.title

          return (
            <div
              key={module.title}
              className="relative group"
              onMouseEnter={() => {
                if (!preventHover) {
                  setHoveredModule(module.title)
                }
              }}
            >
              <button
                className={cn(
                  "w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ease-out",
                  isActive || isHovered
                    ? `bg-gradient-to-br ${module.color} text-white shadow-lg scale-105`
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <module.icon className="w-5 h-5" />
              </button>

              {/* Module name below active or hovered icon */}
              {(isActive || isHovered) && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 text-center">
                  <span className="text-[10px] font-medium text-primary truncate block">
                    {module.title}
                  </span>
                </div>
              )}
            </div>
          )
        })}

        {/* Collapse Button */}
        <button
          onClick={() => {
            if (hoveredModule || manuallyOpenedModule) {
              setHoveredModule(null)
              setManuallyOpenedModule(null)
            } else if (activeModule) {
              setManuallyOpenedModule(activeModule.title)
            }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ease-out text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Flyout Panel - Shows on hover */}
      <div
        className={cn(
          "bg-card border-r border-border shadow-xl transition-all duration-300 ease-out overflow-hidden relative",
          currentHoveredOrActive ? "w-56 opacity-100" : "w-0 opacity-0"
        )}
      >
        {/* Arrow pointing to hovered or manually opened icon */}
        {(hoveredModule || manuallyOpenedModule) && hoveredOrManualIndex >= 0 && (
          <div
            className="absolute left-0 top-0 w-4 h-4 bg-card border-l border-t border-border transform rotate-45 -translate-x-2 z-10"
            style={{
              top: `${16 + hoveredOrManualIndex * 52 + 24 - 8}px`,
            }}
          />
        )}
          {currentHoveredOrActive && (
            <div className="w-56 h-full flex flex-col animate-in fade-in slide-in-from-left-4 duration-200">
              {/* Module Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  {currentHoveredOrActive.title}
                </h3>
                <button
                  onClick={() => {
                    setHoveredModule(null)
                    setManuallyOpenedModule(null)
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* Submenu Items */}
              <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
                {currentHoveredOrActive.subItems.map((subItem) => {
                  const isSubActive = location.pathname === subItem.url

                  return (
                    <NavLink
                      key={subItem.title}
                      to={subItem.url}
                      onClick={() => {
                        setHoveredModule(null)
                        setManuallyOpenedModule(null)
                      }}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mb-1",
                        isSubActive
                          ? "bg-primary/10 text-primary font-medium border-l-4 border-primary pl-2"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {subItem.title}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
    </div>
  )
}

// Export function to get breadcrumb data
export function useBreadcrumb() {
  const location = useLocation()
  
  const getBreadcrumbs = () => {
    const breadcrumbs: { label: string; path: string }[] = [
      { label: "CRM", path: "/" }
    ]

    for (const module of modules) {
      if (location.pathname.startsWith(module.url)) {
        breadcrumbs.push({ label: module.title, path: module.url })
        
        for (const subItem of module.subItems) {
          if (location.pathname === subItem.url) {
            breadcrumbs.push({ label: subItem.title, path: subItem.url })
            break
          }
        }
        break
      }
    }

    return breadcrumbs
  }

  return { breadcrumbs: getBreadcrumbs() }
}