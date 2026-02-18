import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoadingSpinner } from "@/components/LoadingSpinner";
import { lazy, Suspense } from "react";
import NotFound from "./pages/NotFound";
import ModuleLayout from "@/components/ui/ModuleLayout";




//Finance Modules
const FinanceDashboard = lazy(() => import("@/components/modules/finance/FinanceDashboard").then(module => ({ default: module.FinanceDashboard })));
const ChartOfAccounts = lazy(() => import("@/components/modules/finance/ChartOfAccounts").then(module => ({ default: module.ChartOfAccounts })));
const JournalEntries = lazy(() => import("@/components/modules/finance/JournalEntries").then(module => ({ default: module.JournalEntries })));
const AccountsPayable = lazy(() => import("@/components/modules/finance/AccountsPayable").then(module => ({ default: module.AccountsPayable })));
const AccountsReceivable = lazy(() => import("@/components/modules/finance/AccountsReceivable").then(module => ({ default: module.AccountsReceivable })));
const BudgetManagement = lazy(() => import("@/components/modules/finance/BudgetManagement").then(module => ({ default: module.BudgetManagement })));
const FinancialReports = lazy(() => import("@/components/modules/finance/FinancialReports").then(module => ({ default: module.FinancialReports })));


//Admin Modules
const AdminDashboard = lazy(() => import("@/components/modules/admin/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const UserManagement = lazy(() => import("@/components/modules/admin/UserManagement").then(module => ({ default: module.UserManagement })));
const SystemSettings = lazy(() => import("@/components/modules/admin/SystemSettings").then(module => ({ default: module.SystemSettings })));
const Security = lazy(() => import("@/components/modules/admin/Security").then(module => ({ default: module.Security })));
const DatabaseManagement = lazy(() => import("@/components/modules/admin/DatabaseManagement").then(module => ({ default: module.DatabaseManagement })));
const SystemMonitoring = lazy(() => import("@/components/modules/admin/SystemMonitoring").then(module => ({ default: module.SystemMonitoring })));
const Notifications = lazy(() => import("@/components/modules/admin/Notifications").then(module => ({ default: module.Notifications })));
const AuditLogs = lazy(() => import("@/components/modules/admin/AuditLogs").then(module => ({ default: module.AuditLogs })));
const SupportTickets = lazy(() => import("@/components/modules/admin/SupportTickets").then(module => ({ default: module.SupportTickets })));

//Assets Modules
const AssetDashboard = lazy(() => import("@/components/modules/assets/AssetDashboard").then(module => ({ default: module.AssetDashboard })));
const AssetHardware = lazy(() => import("@/components/modules/assets/AssetHardware").then(module => ({ default: module.AssetHardware })));
const LicensesView = lazy(() => import("@/components/modules/assets/LicensesView").then(module => ({ default: module.LicensesView })));
const AccessoriesView = lazy(() => import("@/components/modules/assets/AccessoriesView").then(module => ({ default: module.AccessoriesView })));
const ComponentsView = lazy(() => import("@/components/modules/assets/ComponentsView").then(module => ({ default: module.ComponentsView })));
const ConsumablesView = lazy(() => import("@/components/modules/assets/ConsumablesView").then(module => ({ default: module.ConsumablesView })));
const PredefinedKitsView = lazy(() => import("@/components/modules/assets/PredefinedKitsView").then(module => ({ default: module.PredefinedKitsView })));
const RequestableItemsView = lazy(() => import("@/components/modules/assets/RequestableItemsView").then(module => ({ default: module.RequestableItemsView })));
const CustomFieldsView = lazy(() => import("@/components/modules/assets/CustomFieldsView").then(module => ({ default: module.CustomFieldsView })));
const StatusLabelsView = lazy(() => import("@/components/modules/assets/StatusLabelsView").then(module => ({ default: module.StatusLabelsView })));
const CategoriesView = lazy(() => import("@/components/modules/assets/CategoriesView").then(module => ({ default: module.CategoriesView })));
const DepreciationView = lazy(() => import("@/components/modules/assets/DepreciationView").then(module => ({ default: module.DepreciationView })));
const ModelsView = lazy(() => import("@/components/modules/assets/ModelsView").then(module => ({ default: module.ModelsView })));
const ManufacturersView = lazy(() => import("@/components/modules/assets/ManufacturersView").then(module => ({ default: module.ManufacturersView })));
const SuppliersView = lazy(() => import("@/components/modules/assets/SuppliersView").then(module => ({ default: module.SuppliersView })));
const LocationsView = lazy(() => import("@/components/modules/assets/LocationsView").then(module => ({ default: module.LocationsView })));
const CompaniesView = lazy(() => import("@/components/modules/assets/CompaniesView").then(module => ({ default: module.CompaniesView })));
const DepartmentsView = lazy(() => import("@/components/modules/assets/DepartmentsView").then(module => ({ default: module.DepartmentsView })));
const AssetFormPage = lazy(() => import("@/components/modules/assets/AssetFormPage").then(module => ({ default: module.AssetFormPage })));

//Employee & Visitors Modules
const EmployeeAccount = lazy(() => import("@/components/EmployeeAccount").then(module => ({ default: module.EmployeeAccount })));
const EmployeeInfoDisplay = lazy(() => import("@/components/EmployeeInfoDisplay"));
const EmployeeDashboard = lazy(() => import("@/components/EmployeeDashboard"));
const AttendanceKiosk = lazy(() => import("@/components/AttendanceKiosk").then(module => ({ default: module.AttendanceKiosk })));
const VisitorCheckIn = lazy(() => import("@/pages/VisitorCheckIn").then(module => ({ default: module.VisitorCheckIn })));
const AuthForm = lazy(() => import("@/components/AuthForm"));
const EmployeeAttendance = lazy(() => import("@/components/modules/EmployeeAttendance"));

//Security Modules
const SecurityDashboard = lazy(() => import("@/components/modules/security/SecurityDashboard").then(module => ({ default: module.SecurityDashboard })));
const SecurityManagement = lazy(() => import("@/components/modules/security/SecurityManagement").then(module => ({ default: module.SecurityManagement })));
const VisitorManagement = lazy(() => import("@/components/modules/security/VisitorManagement").then(module => ({ default: module.VisitorManagement })));
const VisitorKiosk = lazy(() => import("@/components/modules/security/VisitorKiosk").then(module => ({ default: module.VisitorKiosk })));
const AccessControl = lazy(() => import("@/components/modules/security/AccessControl").then(module => ({ default: module.AccessControl })));
const SecurityIncidents = lazy(() => import("@/components/modules/security/SecurityIncidents").then(module => ({ default: module.SecurityIncidents })));
const IdCardManagement = lazy(() => import("@/components/modules/security/IdCardManagement").then(module => ({ default: module.IdCardManagement })));



// HR Modules
const HRDashboard = lazy(() => import("@/components/modules/hr/HRDashboard").then(module => ({ default: module.HRDashboard })));
const EmployeeProfiles = lazy(() => import("@/components/modules/hr/EmployeeProfiles").then(module => ({ default: module.EmployeeProfiles })));
const PayrollProcessing = lazy(() => import("@/components/modules/hr/PayrollProcessing").then(module => ({ default: module.PayrollProcessing })));
const BenefitsAdministration = lazy(() => import("@/components/modules/hr/BenefitsAdministration").then(module => ({ default: module.BenefitsAdministration })));
const LeaveManagement = lazy(() => import("@/components/modules/hr/LeaveManagement").then(module => ({ default: module.LeaveManagement })));
const TrainingDevelopment = lazy(() => import("@/components/modules/hr/TrainingDevelopment").then(module => ({ default: module.TrainingDevelopment })));
const PerformanceManagement = lazy(() => import("@/components/modules/hr/PerformanceManagement").then(module => ({ default: module.PerformanceManagement })));
const RecruitmentOnboarding = lazy(() => import("@/components/modules/hr/RecruitmentOnboarding").then(module => ({ default: module.RecruitmentOnboarding })));
const EmployeeOffboarding = lazy(() => import("@/components/modules/hr/EmployeeOffboarding").then(module => ({ default: module.EmployeeOffboarding })));


//Procurement Modules
const ProcurementDashboard = lazy(() => import("@/components/modules/procurement/ProcurementDashboard").then(module => ({ default: module.ProcurementDashboard })));
const ProcurementPlanning = lazy(() => import("@/components/modules/procurement/ProcurementPlanning").then(module => ({ default: module.ProcurementPlanning })));
const Requisitioning = lazy(() => import("@/components/modules/procurement/Requisitioning").then(module => ({ default: module.Requisitioning })));
const Tendering = lazy(() => import("@/components/modules/procurement/Tendering").then(module => ({ default: module.Tendering })));
const BidEvaluation = lazy(() => import("@/components/modules/procurement/BidEvaluation").then(module => ({ default: module.BidEvaluation })));
const ContractManagement = lazy(() => import("@/components/modules/procurement/ContractManagement").then(module => ({ default: module.ContractManagement })));
const VendorManagement = lazy(() => import("@/components/modules/procurement/VendorManagement").then(module => ({ default: module.VendorManagement })));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const sessionToken = urlParams.get('session_token');
  if (location.pathname === '/kiosk-interface' && sessionToken) {
    return <>{children}</>;
  }
  const signinUrl = sessionToken ? `/signin?session_token=${sessionToken}` : '/signin';
  return isAuthenticated ? <>{children}</> : <Navigate to={signinUrl} replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log('PublicRoute - isAuthenticated:', isAuthenticated);
  const pendingToken = sessionStorage.getItem('pending_qr_session_token');
  console.log('PublicRoute - pendingToken:', pendingToken);
  if (pendingToken && isAuthenticated) {
    console.log('PublicRoute - Not redirecting due to pending token');
    // Don't redirect if there's a pending QR token to process
    return <>{children}</>;
  }
  return !isAuthenticated ? <>{children}</> : <Navigate to="/employee-dashboard" replace />;
};

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoadingSpinner />}>
    {children}
  </Suspense>
);

const AppRoutes = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewDashboard = () => {
    if (location.pathname === '/employee-dashboard') {
      const departmentRoutes: Record<string, string> = {
        'ADMIN': '/admin/dashboard',
        'FINANCE': '/finance/dashboard',
        'HR': '/hr',
        'PROCUREMENT': '/procurement/dashboard',
        'SECURITY': '/security',
        'ASSETS': '/assets/dashboard',
      };
      
      const departmentRoute = user?.departmentCode ? departmentRoutes[user.departmentCode] : null;
      if (departmentRoute) {
        navigate(departmentRoute);
      }
    } else {
      navigate('/employee-dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

   return (
    <Routes>
      <Route path="/" element={<Navigate to="/employee-dashboard" replace />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AdminDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AuditLogs /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AdminDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/database" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><DatabaseManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/monitoring" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SystemMonitoring /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><Notifications /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/security" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><Security /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SystemSettings /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/support" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SupportTickets /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Admin" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><UserManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

      {/* Asset Management Routes */}
      <Route path="/assets/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AssetDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/hardware" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AssetHardware /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/requestable" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><RequestableItemsView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/licenses" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><LicensesView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/accessories" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AccessoriesView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/components" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ComponentsView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/consumables" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ConsumablesView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/kits" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><PredefinedKitsView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      
      {/* Asset Settings Routes */}
      <Route path="/assets/settings/custom-fields" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><CustomFieldsView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/labels" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><StatusLabelsView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/categories" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><CategoriesView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/depreciation" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><DepreciationView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/models" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ModelsView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/manufacturers" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ManufacturersView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/suppliers" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SuppliersView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/departments" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><DepartmentsView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/locations" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><LocationsView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/settings/companies" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Settings" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><CompaniesView /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/create" element={<ProtectedRoute><SuspenseWrapper><AssetFormPage /></SuspenseWrapper></ProtectedRoute>} />

      {/* Authentication Routes */}
      <Route path="/register" element={<PublicRoute><SuspenseWrapper><AuthForm /></SuspenseWrapper></PublicRoute>} />
      <Route path="/signin" element={<PublicRoute><SuspenseWrapper><AuthForm /></SuspenseWrapper></PublicRoute>} />

      {/* Visitor Check-in Route (Public) */}
      <Route path="/visitor-checkin" element={<SuspenseWrapper><VisitorCheckIn /></SuspenseWrapper>} />

      {/* Employee Routes */}
      <Route path="/employee-dashboard" element={<ProtectedRoute><SuspenseWrapper><EmployeeDashboard /></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute><SuspenseWrapper><EmployeeAccount /></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/employee/info" element={<ProtectedRoute><SuspenseWrapper><EmployeeInfoDisplay /></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/kiosk-interface" element={<ProtectedRoute><SuspenseWrapper><AttendanceKiosk /></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/reception-desk" element={<ProtectedRoute><SuspenseWrapper><AttendanceKiosk /></SuspenseWrapper></ProtectedRoute>} />

      {/* Finance Routes */}
      <Route path="/finance/accounts" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Finance Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ChartOfAccounts /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/finance/budget" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Finance Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><BudgetManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/finance/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Finance Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><FinanceDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/finance/journal" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Finance Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><JournalEntries /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/finance/payable" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Finance Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AccountsPayable /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/finance/receivable" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Finance Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AccountsReceivable /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/finance/reports" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Finance Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><FinancialReports /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />


      {/* HR Routes */}
      <Route path="/hr/benefits" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><BenefitsAdministration /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><HRDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/attendance" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><EmployeeAttendance moduleType="hr" /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/employees" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><EmployeeProfiles /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/onboarding" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><RecruitmentOnboarding /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/offboarding" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><EmployeeOffboarding /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/leave" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><LeaveManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/payroll" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><PayrollProcessing /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/performance" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><PerformanceManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/hr/training" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="HR Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><TrainingDevelopment /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />


   
      {/* Procurement Routes */}
      <Route path="/procurement/bid-evaluation" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><BidEvaluation /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/contracts" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ContractManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ProcurementDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/planning" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ProcurementPlanning /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/requisitioning" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><Requisitioning /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/tendering" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><Tendering /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/vendors" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><VendorManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />



      {/* Security Routes */}
      <Route path="/security" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Security" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SecurityDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/attendance" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Security Attendance" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><EmployeeAttendance moduleType="security" /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/access-control" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Access Control" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AccessControl /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/incidents" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Security Incidents" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SecurityIncidents /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/id-cards" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="ID Card Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><IdCardManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/management" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Security Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SecurityManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/visitors" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Visitor Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><VisitorManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/visitor-kiosk" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Visitor Kiosk" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><VisitorKiosk /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />



      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
