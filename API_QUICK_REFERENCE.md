# API Quick Reference Guide

## Where to Find Each Endpoint

### Java Backend (Port 5002)

#### HR & Payroll → `javabackendapi/hrApi.ts`
```typescript
import { hrApiService } from '@/services/javabackendapi/hrApi';

// Employees
hrApiService.registerEmployee(user)
hrApiService.listEmployees()
hrApiService.getEmployeeById(id)
hrApiService.updateEmployee(id, request)
hrApiService.updateProfilePicture(id, file)
hrApiService.getProvisionedEmployees()

// Payroll
hrApiService.getAllPayrollRuns()
hrApiService.createPayrollRun(payrollRun)
hrApiService.getAllPayslips()
hrApiService.getPayslipsByUser(userId)
hrApiService.getAllBenefitPlans()
hrApiService.getAllTrainingCourses()
hrApiService.getAllPerformanceReviews()
```

#### Finance & Budgets → `javabackendapi/financeApi.ts`
```typescript
import { financeApiService } from '@/services/javabackendapi/financeApi';

// Budgets
financeApiService.getAllBudgets()
financeApiService.createBudget(budget)
financeApiService.updateBudget(id, budget)
financeApiService.deleteBudget(id)

// Chart of Accounts
financeApiService.getAllChartOfAccounts()
financeApiService.createChartOfAccount(coa)

// Journal Entries
financeApiService.getAllJournalEntries()
financeApiService.createJournalEntry(entry)

// Payables & Receivables
financeApiService.getAllAccountPayables()
financeApiService.getAllAccountReceivables()
```

#### Assets → `javabackendapi/assetApi.ts`
```typescript
import { assetApiService } from '@/services/javabackendapi/assetApi';

// Assets
assetApiService.getAllAssets()
assetApiService.getAssetById(id)
assetApiService.createAsset(asset)
assetApiService.updateAsset(id, asset)
assetApiService.deleteAsset(id)

// Maintenance
assetApiService.getAllMaintenanceRecords()
assetApiService.createMaintenanceRecord(record)

// Disposal
assetApiService.getAllDisposalRecords()
assetApiService.createDisposalRecord(record)

// Acquisition
assetApiService.getAcquisitionRequests()
assetApiService.submitAcquisitionRequest(request)

// Statistics
assetApiService.getAssetStats()
assetApiService.getAssetsByCategory()
assetApiService.getAssetTrends()
```

#### Legal & Compliance → `javabackendapi/legalApi.ts`
```typescript
import { legalApiService } from '@/services/javabackendapi/legalApi';

// Legal Cases
legalApiService.getAllLegalCases()
legalApiService.createLegalCase(legalCase)
legalApiService.updateLegalCase(id, legalCase)
legalApiService.deleteLegalCase(id)

// Compliance
legalApiService.getAllComplianceRecords()
legalApiService.createComplianceRecord(record)
legalApiService.updateComplianceRecord(id, record)
```

#### Revenue & Tax → `javabackendapi/revenueApi.ts`
```typescript
import { revenueApiService } from '@/services/javabackendapi/revenueApi';

// Tax Assessments
revenueApiService.getAllTaxAssessments()
revenueApiService.createTaxAssessment(assessment)
revenueApiService.updateTaxAssessment(id, assessment)

// Revenue Collections
revenueApiService.getAllRevenueCollections()
revenueApiService.createRevenueCollection(collection)
revenueApiService.updateRevenueCollection(id, collection)
```

#### System Config & Audit → `javabackendapi/systemApi.ts`
```typescript
import { systemApiService } from '@/services/javabackendapi/systemApi';

// System Config
systemApiService.getAllSystemConfigs()
systemApiService.createSystemConfig(config)
systemApiService.updateSystemConfig(id, config)

// Audit Logs
systemApiService.getAllAuditLogs()
systemApiService.createAuditLog(log)
systemApiService.getRecentAuditLogsForUser(performedBy)
```

---

### Node.js Backend (Port 5001)

#### Authentication → `nodejsbackendapi/authApi.ts`
```typescript
import { authApiService } from '@/services/nodejsbackendapi/authApi';

authApiService.login(credentials)
authApiService.register(userData)
authApiService.logout()
authApiService.refreshToken()
authApiService.changePassword(data)
authApiService.getCurrentUser()
authApiService.updateProfile(data)
```

#### Lookups → `nodejsbackendapi/lookupApi.ts`
```typescript
import { lookupApiService } from '@/services/nodejsbackendapi/lookupApi';

// Departments
lookupApiService.getDepartments()
lookupApiService.createDepartment(department)
lookupApiService.updateDepartment(id, department)
lookupApiService.searchDepartments(query)

// Roles
lookupApiService.getRoles()
lookupApiService.createRole(role)
lookupApiService.updateRole(id, role)
lookupApiService.assignPermissionsToRole(roleId, permissionIds)

// Permissions
lookupApiService.getPermissions()
lookupApiService.createPermission(permission)
lookupApiService.getPermissionsByModule(module)
```

#### Leave Management → `nodejsbackendapi/leaveApi.ts`
```typescript
import { leaveApiService } from '@/services/nodejsbackendapi/leaveApi';

// Leave Types
leaveApiService.getLeaveTypes()
leaveApiService.createLeaveType(type)

// Leave Requests
leaveApiService.getLeaveRequests()
leaveApiService.createLeaveRequest(request)
leaveApiService.approveLeaveRequest(id)
leaveApiService.rejectLeaveRequest(id)

// Leave Balances
leaveApiService.getLeaveBalances()
leaveApiService.getUserLeaveBalance(userId)
```

#### Procurement → `nodejsbackendapi/procurementApi.ts`
```typescript
import { procurementApiService } from '@/services/nodejsbackendapi/procurementApi';

// Requests
procurementApiService.getProcurementRequests()
procurementApiService.createProcurementRequest(request)
procurementApiService.submitProcurementRequest(id)
procurementApiService.approveProcurementRequest(id)

// Vendors
procurementApiService.getVendors()
procurementApiService.createVendor(vendor)

// Tenders & Bids
procurementApiService.getTenders()
procurementApiService.publishTender(id)
procurementApiService.getBids()
```

#### Recent Activities → `nodejsbackendapi/systemApi.ts`
```typescript
import { systemApiService } from '@/services/nodejsbackendapi/systemApi';

systemApiService.getRecentActivities(userId)
```

---

### Python Backend (Port 5000)

#### Biometric & Attendance → `pythonbackendapi/attendanceApi.ts`
```typescript
import { attendanceApiService } from '@/services/pythonbackendapi/attendanceApi';

// QR Code
attendanceApiService.generateQRToken()
attendanceApiService.scanQRCode(token)

// Clock In/Out
attendanceApiService.clockIn(payload)
attendanceApiService.clockOut(payload)

// Records
attendanceApiService.getAttendanceRecords(params)
attendanceApiService.getAttendanceStatus(userId)
attendanceApiService.getCheckedInEmployees()

// Statistics
attendanceApiService.getAttendanceStats(date, department)
attendanceApiService.getAttendanceMethodStatistics()

// Manual & Audit
attendanceApiService.getManualFallbackAttendances()
attendanceApiService.flagAttendanceForAudit(id, notes)
attendanceApiService.getBuddyPunchReport()
```

#### Visitor Management → `pythonbackendapi/visitorApi.ts`
```typescript
import { visitorApiService } from '@/services/pythonbackendapi/visitorApi';

visitorApiService.generateToken(data)
visitorApiService.validateToken(token)
visitorApiService.checkIn(data)
visitorApiService.checkOut(data)
visitorApiService.getActiveVisitors()
visitorApiService.getAllVisitors()
```

#### Health & Safety → `pythonbackendapi/healthSafetyApi.ts`
```typescript
import { healthSafetyApiService } from '@/services/pythonbackendapi/healthSafetyApi';

// Incidents
healthSafetyApiService.getIncidents()
healthSafetyApiService.createIncident(incident)

// Inspections
healthSafetyApiService.getInspections()
healthSafetyApiService.createInspection(inspection)

// Trainings
healthSafetyApiService.getTrainings()
healthSafetyApiService.createTraining(training)

// Environmental
healthSafetyApiService.getEnvironmentalRecords()
healthSafetyApiService.createEnvironmentalRecord(record)
```

#### Reports & Analytics → `pythonbackendapi/reportsApi.ts`
```typescript
import { reportsApiService } from '@/services/pythonbackendapi/reportsApi';

// Reports
reportsApiService.getReports()
reportsApiService.generateReport(config)
reportsApiService.downloadReport(id)

// Analytics
reportsApiService.getMonthlyTrends()
reportsApiService.getAIInsights()
reportsApiService.getKPIs()
reportsApiService.getAttendanceAnalytics()
reportsApiService.getFinancialAnalytics()
```

---

## Import Patterns

### Pattern 1: Direct Service Import (Recommended)
```typescript
import { hrApiService } from '@/services/javabackendapi/hrApi';
const employees = await hrApiService.listEmployees();
```

### Pattern 2: Wrapper Function Import
```typescript
import { fetchEmployees } from '@/services/javabackendapi/hrApi';
const employees = await fetchEmployees();
```

### Pattern 3: Legacy Unified Import (Backward Compatible)
```typescript
import { fetchEmployees } from '@/services/api';
const employees = await fetchEmployees();
```

---

## Common Operations

### Get All Employees
```typescript
import { hrApiService } from '@/services/javabackendapi/hrApi';
const employees = await hrApiService.listEmployees();
```

### Get All Budgets
```typescript
import { financeApiService } from '@/services/javabackendapi/financeApi';
const budgets = await financeApiService.getAllBudgets();
```

### Get Attendance Records
```typescript
import { attendanceApiService } from '@/services/pythonbackendapi/attendanceApi';
const records = await attendanceApiService.getAttendanceRecords({ user_id: userId });
```

### Get Departments
```typescript
import { lookupApiService } from '@/services/nodejsbackendapi/lookupApi';
const departments = await lookupApiService.getDepartments();
```

### Get Assets
```typescript
import { assetApiService } from '@/services/javabackendapi/assetApi';
const assets = await assetApiService.getAllAssets();
```

---

## Tips

1. **Use Direct Imports** for better tree-shaking and clearer dependencies
2. **Check Type Definitions** in each backend API file for request/response types
3. **Wrapper Functions** are available for backward compatibility
4. **Service Classes** provide the most direct access to API methods
5. **Utility Functions** (like mappers) are in the same file as their related endpoints
