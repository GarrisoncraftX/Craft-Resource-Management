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


const AuthForm = lazy(() => import("@/components/AuthForm"));

const EmployeeAttendance = lazy(() => import("@/components/modules/EmployeeAttendance"));
//Finance Modules
const FinanceDashboard = lazy(() => import("@/components/modules/finance/FinanceDashboard").then(module => ({ default: module.FinanceDashboard })));
const ChartOfAccounts = lazy(() => import("@/components/modules/finance/ChartOfAccounts").then(module => ({ default: module.ChartOfAccounts })));
const JournalEntries = lazy(() => import("@/components/modules/finance/JournalEntries").then(module => ({ default: module.JournalEntries })));
const AccountsPayable = lazy(() => import("@/components/modules/finance/AccountsPayable").then(module => ({ default: module.AccountsPayable })));
const AccountsReceivable = lazy(() => import("@/components/modules/finance/AccountsReceivable").then(module => ({ default: module.AccountsReceivable })));
const BudgetManagement = lazy(() => import("@/components/modules/finance/BudgetManagement").then(module => ({ default: module.BudgetManagement })));
const HRDashboard = lazy(() => import("@/components/modules/hr/HRDashboard").then(module => ({ default: module.HRDashboard })));
const AssetDashboard = lazy(() => import("@/components/modules/assets/AssetDashboard").then(module => ({ default: module.AssetDashboard })));

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
const AssetRegister = lazy(() => import("@/components/modules/assets/AssetRegister").then(module => ({ default: module.AssetRegister })));
const AssetAcquisition = lazy(() => import("@/components/modules/assets/AssetAcquisition").then(module => ({ default: module.AssetAcquisition })));
const MaintenanceManagement = lazy(() => import("@/components/modules/assets/MaintenanceManagement").then(module => ({ default: module.MaintenanceManagement })));
const AssetDisposal = lazy(() => import("@/components/modules/assets/AssetDisposal").then(module => ({ default: module.AssetDisposal })));
const AssetValuation = lazy(() => import("@/components/modules/assets/AssetValuation").then(module => ({ default: module.AssetValuation })));

//Employee Modules
const EmployeeAccount = lazy(() => import("@/components/EmployeeAccount").then(module => ({ default: module.EmployeeAccount })));
const EmployeeInfoDisplay = lazy(() => import("@/components/EmployeeInfoDisplay"));
const EmployeeDashboard = lazy(() => import("@/components/EmployeeDashboard"));
const AttendanceKiosk = lazy(() => import("@/components/AttendanceKiosk").then(module => ({ default: module.AttendanceKiosk })));


//Security Modules
const SecurityDashboard = lazy(() => import("@/components/modules/security/SecurityDashboard").then(module => ({ default: module.SecurityDashboard })));
const SecurityManagement = lazy(() => import("@/components/modules/security/SecurityManagement").then(module => ({ default: module.SecurityManagement })));
const VisitorManagement = lazy(() => import("@/components/modules/security/VisitorManagement").then(module => ({ default: module.VisitorManagement })));
const VisitorKiosk = lazy(() => import("@/components/modules/security/VisitorKiosk").then(module => ({ default: module.VisitorKiosk })));
const AccessControl = lazy(() => import("@/components/modules/security/AccessControl").then(module => ({ default: module.AccessControl })));
const SecurityIncidents = lazy(() => import("@/components/modules/security/SecurityIncidents").then(module => ({ default: module.SecurityIncidents })));
const IdCardManagement = lazy(() => import("@/components/modules/security/IdCardManagement").then(module => ({ default: module.IdCardManagement })));

const ProcurementDashboard = lazy(() => import("@/components/modules/procurement/ProcurementDashboard").then(module => ({ default: module.ProcurementDashboard })));
const LegalDashboard = lazy(() => import("@/components/modules/legal/LegalDashboard").then(module => ({ default: module.LegalDashboard })));
const LegalManagement = lazy(() => import("@/components/modules/legal/LegalManagement").then(module => ({ default: module.LegalManagement })));
const LegalCases = lazy(() => import("@/components/modules/legal/LegalCases").then(module => ({ default: module.LegalCases })));
const ComplianceRecords = lazy(() => import("@/components/modules/legal/ComplianceMonitoring").then(module => ({ default: module.ComplianceMonitoring })));
const LegalDocuments = lazy(() => import("@/components/modules/legal/LegalDocuments").then(module => ({ default: module.LegalDocuments })));
const ContractReview = lazy(() => import("@/components/modules/legal/ContractReview").then(module => ({ default: module.ContractReview })));
const LegalOpinions = lazy(() => import("@/components/modules/legal/LegalOpinions").then(module => ({ default: module.LegalOpinions })));
const PublicRelationsDashboard = lazy(() => import("@/components/modules/public-relations/PublicRelationsDashboard").then(module => ({ default: module.PublicRelationsDashboard })));
const PlanningDashboard = lazy(() => import("@/components/modules/planning/PlanningDashboard").then(module => ({ default: module.PlanningDashboard })));


const RevenueDashboard = lazy(() => import("@/components/modules/revenue/RevenueDashboard").then(module => ({ default: module.RevenueDashboard })));
const UrbanPlanning = lazy(() => import("@/components/modules/planning/UrbanPlanning").then(module => ({ default: module.UrbanPlanning })));
const ProjectManagement = lazy(() => import("@/components/modules/planning/ProjectManagement").then(module => ({ default: module.ProjectManagement })));
const PressReleases = lazy(() => import("@/components/modules/public-relations/PressReleases").then(module => ({ default: module.PressReleases })));
const MediaRelations = lazy(() => import("@/components/modules/public-relations/MediaRelations").then(module => ({ default: module.MediaRelations })));
const PublicEvents = lazy(() => import("@/components/modules/public-relations/PublicEvents").then(module => ({ default: module.PublicEvents })));
const SocialMedia = lazy(() => import("@/components/modules/public-relations/SocialMedia").then(module => ({ default: module.SocialMedia })));
const TaxAssessment = lazy(() => import("@/components/modules/revenue/TaxAssessment").then(module => ({ default: module.TaxAssessment })));
const ReportAnalytics = lazy(() => import("@/components/modules/reports/ReportAnalytics").then(module => ({ default: module.ReportAnalytics })));
const CustomReportBuilder = lazy(() => import("@/components/modules/reports/CustomReportBuilder").then(module => ({ default: module.CustomReportBuilder })));
const HealthSafetyDashboard = lazy(() => import("@/components/modules/health-safety/HealthSafetyDashboard").then(module => ({ default: module.HealthSafetyDashboard })));
const IncidentReporting = lazy(() => import("@/components/modules/health-safety/IncidentReporting").then(module => ({ default: module.IncidentReporting })));
const SafetyInspections = lazy(() => import("@/components/modules/health-safety/SafetyInspections").then(module => ({ default: module.SafetyInspections })));
const SafetyTraining = lazy(() => import("@/components/modules/health-safety/SafetyTraining").then(module => ({ default: module.SafetyTraining })));
const EnvironmentalHealth = lazy(() => import("@/components/modules/health-safety/EnvironmentalHealth").then(module => ({ default: module.EnvironmentalHealth })));
const TransportationDashboard = lazy(() => import("@/components/modules/transportation/TransportationDashboard").then(module => ({ default: module.TransportationDashboard })));
const FleetManagement = lazy(() => import("@/components/modules/transportation/FleetManagement").then(module => ({ default: module.FleetManagement })));
const DriverManagement = lazy(() => import("@/components/modules/transportation/DriverManagement").then(module => ({ default: module.DriverManagement })));
const VehicleMaintenance = lazy(() => import("@/components/modules/transportation/VehicleMaintenance").then(module => ({ default: module.VehicleMaintenance })));
const FuelManagement = lazy(() => import("@/components/modules/transportation/FuelManagement").then(module => ({ default: module.FuelManagement })));
const RouteManagement = lazy(() => import("@/components/modules/transportation/RouteManagement").then(module => ({ default: module.RouteManagement })));
const ReportsDashboard = lazy(() => import("@/components/modules/reports/ReportsDashboard").then(module => ({ default: module.ReportsDashboard })));
const FinancialReports = lazy(() => import("@/components/modules/finance/FinancialReports").then(module => ({ default: module.FinancialReports })));

const EmployeeProfiles = lazy(() => import("@/components/modules/hr/EmployeeProfiles").then(module => ({ default: module.EmployeeProfiles })));
const PayrollProcessing = lazy(() => import("@/components/modules/hr/PayrollProcessing").then(module => ({ default: module.PayrollProcessing })));
const BenefitsAdministration = lazy(() => import("@/components/modules/hr/BenefitsAdministration").then(module => ({ default: module.BenefitsAdministration })));
const LeaveManagement = lazy(() => import("@/components/modules/hr/LeaveManagement").then(module => ({ default: module.LeaveManagement })));
const TrainingDevelopment = lazy(() => import("@/components/modules/hr/TrainingDevelopment").then(module => ({ default: module.TrainingDevelopment })));
const PerformanceManagement = lazy(() => import("@/components/modules/hr/PerformanceManagement").then(module => ({ default: module.PerformanceManagement })));
const RecruitmentOnboarding = lazy(() => import("@/components/modules/hr/RecruitmentOnboarding").then(module => ({ default: module.RecruitmentOnboarding })));
const EmployeeOffboarding = lazy(() => import("@/components/modules/hr/EmployeeOffboarding").then(module => ({ default: module.EmployeeOffboarding })));




const ProcurementPlanning = lazy(() => import("@/components/modules/procurement/ProcurementPlanning").then(module => ({ default: module.ProcurementPlanning })));
const Requisitioning = lazy(() => import("@/components/modules/procurement/Requisitioning").then(module => ({ default: module.Requisitioning })));
const TaxManagement = lazy(() => import("@/components/modules/revenue/TaxManagement").then(module => ({ default: module.TaxManagement })));
const Tendering = lazy(() => import("@/components/modules/procurement/Tendering").then(module => ({ default: module.Tendering })));
const BidEvaluation = lazy(() => import("@/components/modules/procurement/BidEvaluation").then(module => ({ default: module.BidEvaluation })));
const ContractManagement = lazy(() => import("@/components/modules/procurement/ContractManagement").then(module => ({ default: module.ContractManagement })));
const VendorManagement = lazy(() => import("@/components/modules/procurement/VendorManagement").then(module => ({ default: module.VendorManagement })));
const VisitorCheckIn = lazy(() => import("@/pages/VisitorCheckIn").then(module => ({ default: module.VisitorCheckIn })));

//Operations Modules
const OperationsDashboard = lazy(() => import("@/components/modules/operations/OperationsDashboard").then(module => ({ default: module.OperationsDashboard })));

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
        'LEGAL': '/legal/dashboard',
        'PLANNING': '/planning/dashboard',
        'TRANSPORTATION': '/transportation',
        'HEALTH_SAFETY': '/health-safety/dashboard',
        'PUBLIC_RELATIONS': '/public-relations',
        'REVENUE_TAX': '/revenue',
        'SECURITY': '/security',
        'ASSETS': '/assets/dashboard',
        'OPERATIONS': '/operations/dashboard',
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
      <Route path="/assets/acquisition" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AssetAcquisition /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AssetDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/disposal" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AssetDisposal /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/maintenance" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><MaintenanceManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/register" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AssetRegister /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/assets/valuation" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Asset Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AssetValuation /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

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

      {/* Health & Safety Routes */}
      <Route path="/health-safety/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Health & Safety" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><HealthSafetyDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/health-safety/incidents" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Health & Safety" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><IncidentReporting /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/health-safety/inspections" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Health & Safety" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SafetyInspections /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/health-safety/training" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Health & Safety" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SafetyTraining /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/health-safety/environmental" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Health & Safety" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><EnvironmentalHealth /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

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

      {/* Legal Routes */}
      <Route path="/legal/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Legal Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><LegalDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/legal/management" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Legal Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><LegalManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/legal/cases" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Legal Cases" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><LegalCases /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/legal/compliance" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Compliance Monitoring" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ComplianceRecords /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/legal/documents" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Legal Documents" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><LegalDocuments /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/legal/contracts" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Contract Review" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ContractReview /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/legal/opinions" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Legal Opinions" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><LegalOpinions /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

      {/* Operations Routes */}
      <Route path="/operations" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Operations Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><OperationsDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/operations/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Operations Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><OperationsDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
     
      {/* Planning & Development Routes */}
      <Route path="/planning/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Planning Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><PlanningDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/planning/projects" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Planning" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ProjectManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/planning/urban" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Planning" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><UrbanPlanning /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

      {/* Procurement Routes */}
      <Route path="/procurement/bid-evaluation" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><BidEvaluation /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/contracts" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ContractManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement Dashboard" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ProcurementDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/planning" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ProcurementPlanning /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/requisitioning" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><Requisitioning /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/tendering" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><Tendering /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/procurement/vendors" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Procurement" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><VendorManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

      {/* Public Relations Routes */}
      <Route path="/pr/releases" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Public Relations" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><PressReleases /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/pr/media" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Public Relations" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><MediaRelations /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/pr/events" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Public Relations" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><PublicEvents /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/pr/social" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Public Relations" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SocialMedia /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/public-relations" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Public Relations" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><PublicRelationsDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

      {/* Reports Routes */}
      <Route path="/reports/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Reports" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ReportsDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/reports/analytics" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Reports" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><ReportAnalytics /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/reports/custom" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Reports" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><CustomReportBuilder /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

      {/* Revenue & Tax Routes */}
      <Route path="/revenue" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Revenue" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><RevenueDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/revenue/tax-assessment" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Tax Assessment" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><TaxAssessment /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/revenue/tax-management" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Tax Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><TaxManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      

      {/* Security Routes */}
      <Route path="/security" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Security" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SecurityDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/attendance" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Security Attendance" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><EmployeeAttendance moduleType="security" /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/access-control" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Access Control" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><AccessControl /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/incidents" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Security Incidents" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SecurityIncidents /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/id-cards" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="ID Card Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><IdCardManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/management" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Security Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><SecurityManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/visitors" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Visitor Management" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><VisitorManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/security/visitor-kiosk" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Visitor Kiosk" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><VisitorKiosk /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />


      {/* Transportation Routes */}
      <Route path="/transportation" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Transportation" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><TransportationDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/transportation/dashboard" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Transportation" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><TransportationDashboard /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/transportation/fleet" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Transportation" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><FleetManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/transportation/drivers" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Transportation" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><DriverManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/transportation/maintenance" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Transportation" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><VehicleMaintenance /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/transportation/fuel" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Transportation" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><FuelManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />
      <Route path="/transportation/routes" element={<ProtectedRoute><SuspenseWrapper><ModuleLayout title="Transportation" onViewDashboard={handleViewDashboard} onLogout={handleLogout}><RouteManagement /></ModuleLayout></SuspenseWrapper></ProtectedRoute>} />

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