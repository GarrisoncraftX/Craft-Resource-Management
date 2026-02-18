import React, { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {Calculator,Users,Package,ShoppingCart,Shield,ChevronRight,Lock,ListFilter,Tag,FolderTree,TrendingDown,Boxes,Factory,Store,Building2,MapPin,Menu,Circle,X,Check,AlertCircle,Clock,Crown,Briefcase,} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { assetApiService, hrApiService } from "@/services/api"

const assetSettingsItems = [
  { title: "Custom Fields", url: "/assets/settings/custom-fields", icon: ListFilter },
  { title: "Status Labels", url: "/assets/settings/labels", icon: Tag },
  { title: "Categories", url: "/assets/settings/categories", icon: FolderTree },
  { title: "Depreciation", url: "/assets/settings/depreciation", icon: TrendingDown },
  { title: "Models", url: "/assets/settings/models", icon: Boxes },
  { title: "Manufacturers", url: "/assets/settings/manufacturers", icon: Factory },
  { title: "Suppliers", url: "/assets/settings/suppliers", icon: Store },
  { title: "Departments", url: "/assets/settings/departments", icon: Building2 },
  { title: "Locations", url: "/assets/settings/locations", icon: MapPin },
  { title: "Companies", url: "/assets/settings/companies", icon: Briefcase },
]

const assetHardwareFilters = [
  { label: "List All", icon: Circle },
  { label: "Deployed", icon: Circle },
  { label: "Ready to Deploy", icon: Circle },
  { label: "Pending", icon: Circle },
  { label: "Un-deployable", icon: X },
  { label: "BYOD", icon: X },
  { label: "Archived", icon: X },
  { label: "Requestable", icon: Check },
  { label: "Due for Audit", icon: AlertCircle },
  { label: "Due for Checkin", icon: Clock },
]

const assetPeopleFilters = [
  { label: "List All", icon: Circle },
  { label: "Admin Users", icon: Crown },
  { label: "Asset Personel", icon: Crown },
  { label: "Deleted Users", icon: X },
]

const modules = [
  {
    title: "Admin",
    url: "/admin",
    icon: Lock,
    color: "from-red-500 to-red-600",
    subItems: [
      { title: "Dashboard", url: "/admin/dashboard" },
      { title: "User Management", url: "/admin/users" },
      { title: "Audit Logs", url: "/admin/audit-logs" },
      { title: "Security", url: "/admin/security" },
      { title: "System Settings", url: "/admin/settings" },
      { title: "Database", url: "/admin/database" },
      { title: "Monitoring", url: "/admin/monitoring" },
      { title: "Notifications", url: "/admin/notifications" },
      { title: "Support Tickets", url: "/admin/support" },
    ],
  },
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
    ],
  },
  {
    title: "HR",
    url: "/hr",
    icon: Users,
    color: "from-rose-500 to-rose-600",
    subItems: [
      { title: "Dashboard", url: "/hr/dashboard" },
      { title: "Attendance", url: "/hr/attendance" },
      { title: "Employees", url: "/hr/employees" },
      { title: "Onboarding", url: "/hr/onboarding" },
      { title: "Offboarding", url: "/hr/offboarding" },
      { title: "Payroll Processing", url: "/hr/payroll" },
      { title: "Leave Management", url: "/hr/leave" },
      { title: "Training & Development", url: "/hr/training" },
      { title: "Performance", url: "/hr/performance" },
    ],
  },
  {
    title: "Assets Management",
    url: "/assets",
    icon: Package,
    color: "from-amber-500 to-amber-600",
    subItems: [
      { title: "Dashboard", url: "/assets/dashboard" },
      { title: "Assets", url: "/assets/hardware", hasSubFlyout: true },
      { title: "Licenses", url: "/assets/licenses" },
      { title: "Accessories", url: "/assets/accessories" },
      { title: "Consumables", url: "/assets/consumables" },
      { title: "Components", url: "/assets/components" },
      { title: "Predefined Kits", url: "/assets/kits" },
      { title: "People", url: "/assets/people", hasSubFlyout: true },
      { title: "Reports", url: "/assets/reports" },
      { title: "Requestable Items", url: "/assets/requestable" },
      { title: "Settings", url: "/assets/settings", hasSubFlyout: true },
    ],
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
    ],
  },
  {
    title: "Security",
    url: "/security",
    icon: Shield,
    color: "from-violet-500 to-violet-600",
    subItems: [
      { title: "Management", url: "/security/management" },
      { title: "Attendance", url: "/security/attendance" },
      { title: "Visitors", url: "/security/visitors" },
      { title: "Access Control", url: "/security/access-control" },
      { title: "Incidents", url: "/security/incidents" },
      { title: "ID Cards", url: "/security/id-cards" },
    ],
  },
] as const

type FlyoutName = "Settings" | "Assets" | "People"

export function UnifySidebar() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null)

  // Collapsed mode flyouts (stable hover + close delay)
  const [activeFlyout, setActiveFlyout] = useState<FlyoutName | null>(null)
  const flyoutCloseTimer = React.useRef<number | null>(null)

  // Expanded mode nested dropdown
  const [expandedSubDropdown, setExpandedSubDropdown] = useState<string | null>(null)

  const [assetCounts, setAssetCounts] = useState<Record<string, number>>({})
  const [peopleCounts, setPeopleCounts] = useState<Record<string, number>>({})

  const location = useLocation()
  const { user } = useAuth()

  React.useEffect(() => {
    const fetchAssetCounts = async () => {
      try {
        const counts = await assetApiService.getAssetCounts()
        setAssetCounts(counts)
      } catch (err) {
        console.error("Failed to fetch asset counts", err)
      }
    }
    fetchAssetCounts()
  }, [])

  React.useEffect(() => {
    const fetchPeopleCounts = async () => {
      try {
        const counts = await hrApiService.getPeopleCounts()
        setPeopleCounts(counts)
      } catch (err) {
        console.error("Failed to fetch people counts", err)
      }
    }
    fetchPeopleCounts()
  }, [])

  React.useEffect(() => {
    return () => {
      if (flyoutCloseTimer.current) globalThis.clearTimeout(flyoutCloseTimer.current)
    }
  }, [])

  const openFlyout = (name: FlyoutName) => {
    if (flyoutCloseTimer.current) globalThis.clearTimeout(flyoutCloseTimer.current)
    setActiveFlyout(name)
  }

  const closeFlyoutSoon = () => {
    if (flyoutCloseTimer.current) globalThis.clearTimeout(flyoutCloseTimer.current)
    flyoutCloseTimer.current = globalThis.setTimeout(() => setActiveFlyout(null), 180)
  }

  const keepFlyoutOpen = () => {
    if (flyoutCloseTimer.current) globalThis.clearTimeout(flyoutCloseTimer.current)
  }

  const subKey = (moduleTitle: string, itemTitle: string) => `${moduleTitle}::${itemTitle}`
  const toggleSubDropdown = (key: string) => {
    setExpandedSubDropdown((prev) => (prev === key ? null : key))
  }

  const getActiveModule = () => {
    for (const module of modules) {
      if (location.pathname.startsWith(module.url)) return module
    }
    return null
  }

  const activeModule = getActiveModule()

  const filteredModules = React.useMemo(() => {
    if (!user) return []
    const departmentModuleMap: Record<string, string> = {
      ADMIN: "Admin",
      FINANCE: "Finance",
      HR: "HR",
      PROCUREMENT: "Procurement",
      SECURITY: "Security",
      ASSETS: "Assets",
    }
    const adminRoles = ["ADMIN", "SYSTEM_ADMIN", "SUPER_ADMIN"]
    if (adminRoles.includes(user.roleCode)) return modules
    const moduleTitle = departmentModuleMap[user.departmentCode]
    if (moduleTitle) return modules.filter((m) => m.title === moduleTitle)
    return modules.filter((m) => m.title === "Reports")
  }, [user])

  const currentHoveredOrActive = hoveredModule ? modules.find((m) => m.title === hoveredModule) : null

  return (
      <div
        className={cn(
          "fixed left-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] z-40 flex transition-all duration-300",
          !isMobileSidebarOpen && "-translate-x-full sm:translate-x-0"
        )}
        onMouseLeave={() => {
          if (!isExpanded) {
            setHoveredModule(null)
            closeFlyoutSoon()
          }
        }}
      >
        <div
          className={cn(
            "bg-card border-r border-border flex flex-col py-4 relative overflow-y-auto transition-all duration-300",
            isExpanded ? "w-[210px]" : "w-16"
          )}
        >
          <button
            onClick={() => {
              setIsExpanded((prev) => !prev)
              setExpandedDropdown(null)
              setExpandedSubDropdown(null)
              setActiveFlyout(null)
            }}
            className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {filteredModules.map((module) => {
            const isActive = activeModule?.title === module.title
            const isHovered = hoveredModule === module.title
            const isDropdownOpen = expandedDropdown === module.title

            return (
              <div key={module.title} className="relative">
                {isExpanded ? (
                  <div className="px-2 mb-1">
                    <button
                      onClick={() => {
                        const next = isDropdownOpen ? null : module.title
                        setExpandedDropdown(next)
                        setExpandedSubDropdown(null)
                      }}
                      className={cn(
                        "w-full h-10 px-3 rounded-lg flex items-center gap-3 transition-all",
                        isActive
                          ? `bg-gradient-to-br ${module.color} text-white shadow-md`
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <module.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{module.title}</span>
                      <ChevronRight
                        className={cn("w-4 h-4 ml-auto transition-transform", isDropdownOpen && "rotate-90")}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="mt-1 ml-4 space-y-0.5">
                        {module.subItems.map((item) => {
                          const key = subKey(module.title, item.title)
                          const isSubOpen = expandedSubDropdown === key

                          if (!item.hasSubFlyout) {
                            return (
                              <NavLink
                                key={item.url}
                                to={item.url}
                                className={({ isActive }) =>
                                  cn(
                                    "block px-3 py-2 text-xs rounded-md transition-colors",
                                    isActive
                                      ? "bg-accent text-accent-foreground font-medium"
                                      : "text-muted-foreground hover:bg-accent/50"
                                  )
                                }
                              >
                                {item.title}
                              </NavLink>
                            )
                          }

                          return (
                            <div key={item.url} className="relative">
                              <button
                                type="button"
                                onClick={() => toggleSubDropdown(key)}
                                className={cn(
                                  "w-full px-3 py-2 text-xs rounded-md flex items-center gap-2 transition-colors",
                                  "text-muted-foreground hover:bg-accent/50"
                                )}
                              >
                                <span className="truncate">{item.title}</span>
                                <ChevronRight
                                  className={cn(
                                    "w-3.5 h-3.5 ml-auto transition-transform",
                                    isSubOpen && "rotate-90"
                                  )}
                                />
                              </button>

                              {isSubOpen && (
                                <div className="mt-1 ml-3 space-y-0.5">
                                  {item.title === "Settings" &&
                                    assetSettingsItems.map((settingItem) => (
                                      <NavLink
                                        key={settingItem.url}
                                        to={settingItem.url}
                                        className={({ isActive }) =>
                                          cn(
                                            "flex items-center gap-2 px-2 py-2 rounded text-xs transition-colors",
                                            isActive
                                              ? "bg-accent text-accent-foreground font-medium"
                                              : "text-muted-foreground hover:bg-accent/50"
                                          )
                                        }
                                      >
                                        <settingItem.icon className="w-4 h-4" />
                                        <span className="flex-1 truncate">{settingItem.title}</span>
                                      </NavLink>
                                    ))}

                                  {item.title === "People" &&
                                    assetPeopleFilters.map((filter) => {
                                      const filterKey = filter.label.toLowerCase().replace(/\s+/g, "-")
                                      const count = peopleCounts[filterKey] ?? 0
                                      return (
                                        <NavLink
                                          key={filter.label}
                                          to={`/assets/people?filter=${filterKey}`}
                                          className="flex items-center gap-2 px-2 py-2 rounded text-xs transition-colors text-muted-foreground hover:bg-accent/50"
                                        >
                                          <filter.icon className="w-3.5 h-3.5" />
                                          <span className="flex-1 truncate">{filter.label}</span>
                                          <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-medium">
                                            {count}
                                          </span>
                                        </NavLink>
                                      )
                                    })}

                                  {item.title === "Assets" &&
                                    assetHardwareFilters.map((filter) => {
                                      const filterKey = filter.label.toLowerCase().replace(/\s+/g, "-")
                                      const count = assetCounts[filterKey] ?? 0
                                      return (
                                        <NavLink
                                          key={filter.label}
                                          to={`/assets/hardware?filter=${filterKey}`}
                                          className="flex items-center gap-2 px-2 py-2 rounded text-xs transition-colors text-muted-foreground hover:bg-accent/50"
                                        >
                                          <filter.icon className="w-3.5 h-3.5" />
                                          <span className="flex-1 truncate">{filter.label}</span>
                                          <span className="px-2 py-0.5 bg-red text-red-500 rounded text-[10px] font-medium">
                                            {count}
                                          </span>
                                        </NavLink>
                                      )
                                    })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center mb-1" onMouseEnter={() => setHoveredModule(module.title)}>
                    <button
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        isActive || isHovered
                          ? `bg-gradient-to-br ${module.color} text-white shadow-lg scale-105`
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <module.icon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* COLLAPSED MODE FLYOUT PANEL */}
        {!isExpanded && currentHoveredOrActive && (
          <div className="w-48 bg-card border-r border-border shadow-xl overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <currentHoveredOrActive.icon className="w-4 h-4" />
                {currentHoveredOrActive.title}
              </h3>

              <nav className="space-y-0.5">
                {currentHoveredOrActive.subItems.map((item) => (
                  <div key={item.url} className="relative">
                    {item.hasSubFlyout ? (
                      <div
                        className="relative"
                        onMouseEnter={() => openFlyout(item.title as FlyoutName)}
                        onMouseLeave={closeFlyoutSoon}
                      >
                        <div className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-accent/50 cursor-pointer flex items-center">
                          <span className="flex-1">{item.title}</span>
                          <ChevronRight className="w-4 h-4 opacity-70" />
                        </div>

                        {/* SETTINGS */}
                        {item.title === "Settings" && activeFlyout === "Settings" && (
                          <div
                            className="fixed left-64 top-16 w-48 bg-card border border-border rounded-lg shadow-xl z-[100]"
                            onMouseEnter={keepFlyoutOpen}
                            onMouseLeave={closeFlyoutSoon}
                          >
                            <div className="p-2 grid grid-cols-1 gap-2">
                              {assetSettingsItems.map((settingItem) => (
                                <NavLink
                                  key={settingItem.url}
                                  to={settingItem.url}
                                  className={({ isActive }) =>
                                    cn(
                                      "flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors",
                                      isActive
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "text-muted-foreground hover:bg-accent/50"
                                    )
                                  }
                                >
                                  <settingItem.icon className="w-4 h-4" />
                                  <span className="truncate">{settingItem.title}</span>
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PEOPLE */}
                        {item.title === "People" && activeFlyout === "People" && (
                          <div
                            className="fixed left-64 top-48 w-64 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-[100]"
                            onMouseEnter={keepFlyoutOpen}
                            onMouseLeave={closeFlyoutSoon}
                          >
                            <div className="p-3 space-y-1">
                              {assetPeopleFilters.map((filter) => {
                                const filterKey = filter.label.toLowerCase().replace(/\s+/g, "-")
                                const count = peopleCounts[filterKey] ?? 0
                                return (
                                  <NavLink
                                    key={filter.label}
                                    to={`/assets/people?filter=${filterKey}`}
                                    className="flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors hover:bg-accent"
                                  >
                                    <filter.icon className="w-4 h-4" />
                                    <span className="flex-1">{filter.label}</span>
                                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-medium">
                                      {count}
                                    </span>
                                  </NavLink>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* ASSETS */}
                        {item.title === "Assets" && activeFlyout === "Assets" && (
                          <div
                            className="fixed left-64 top-16 w-64 bg-card rounded-lg shadow-xl border border-border z-[100] overflow-hidden"
                            onMouseEnter={keepFlyoutOpen}
                            onMouseLeave={closeFlyoutSoon}
                          >
                            <div className="p-3 space-y-1">
                              {assetHardwareFilters.map((filter) => {
                                const filterKey = filter.label.toLowerCase().replace(/\s+/g, "-")
                                const count = assetCounts[filterKey] ?? 0
                                return (
                                  <NavLink
                                    key={filter.label}
                                    to={`/assets/hardware?filter=${filterKey}`}
                                    className="flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors hover:bg-accent"
                                  >
                                    <filter.icon className="w-4 h-4" />
                                    <span className="flex-1">{filter.label}</span>
                                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-medium">
                                      {count}
                                    </span>
                                  </NavLink>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent/50"
                          )
                        }
                      >
                        {item.title}
                      </NavLink>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
  )
}
