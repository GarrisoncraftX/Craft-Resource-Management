# Complete API Endpoint Reference

## API Gateway Configuration
**Base URL:** `http://localhost:5003`

All frontend requests go through the API Gateway, which routes them to the appropriate backend service.

---

## Python Backend (Port 5000)

### Biometric & Attendance
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/biometric/enroll` | POST | Enroll biometric data | attendanceApi.ts |
| `/api/biometric/verify` | POST | Verify biometric | attendanceApi.ts |
| `/api/biometric/identify` | POST | Identify person | attendanceApi.ts |
| `/api/biometric/attendance/clock-in` | POST | Clock in | attendanceApi.ts |
| `/api/biometric/attendance/clock-out` | POST | Clock out | attendanceApi.ts |
| `/api/biometric/attendance/qr-display` | GET | Generate QR for kiosk | attendanceApi.ts |
| `/api/biometric/attendance/qr-scan` | POST | Scan QR code | attendanceApi.ts |
| `/api/biometric/attendance/status` | GET | Get attendance status | attendanceApi.ts |
| `/api/biometric/attendance/records` | GET | Get attendance records | attendanceApi.ts |
| `/api/attendance/records` | GET | Get attendance records | attendanceApi.ts |
| `/api/attendance/stats` | GET | Get attendance statistics | attendanceApi.ts |
| `/api/attendance/checked-in` | GET | Get checked-in employees | attendanceApi.ts |
| `/api/attendance/manual-fallbacks` | GET | Get manual fallback records | attendanceApi.ts |
| `/api/attendance/by-method/{method}` | GET | Get by method | attendanceApi.ts |
| `/api/attendance/{id}/flag-audit` | POST | Flag for audit | attendanceApi.ts |
| `/api/attendance/buddy-punch-report` | GET | Get buddy punch report | attendanceApi.ts |
| `/api/attendance/method-statistics` | GET | Get method statistics | attendanceApi.ts |

### Visitors
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/visitors/generate-token` | POST | Generate QR token | visitorApi.ts |
| `/api/visitors/validate-token` | POST | Validate QR token | visitorApi.ts |
| `/api/visitors/checkin` | POST | Check in visitor | visitorApi.ts |
| `/api/visitors/checkout` | POST | Check out visitor | visitorApi.ts |
| `/api/visitors/entry-pass` | POST | Generate entry pass | visitorApi.ts |
| `/api/visitors/active` | GET | Get active visitors | visitorApi.ts |
| `/api/visitors/list` | GET | Get all visitors | visitorApi.ts |
| `/api/visitors/search` | GET | Search visitors | visitorApi.ts |

### Health & Safety
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/health-safety/incidents` | GET/POST | Manage incidents | healthSafetyApi.ts |
| `/api/health-safety/inspections` | GET/POST | Manage inspections | healthSafetyApi.ts |
| `/api/health-safety/trainings` | GET/POST | Manage trainings | healthSafetyApi.ts |
| `/api/health-safety/trainings/{id}` | PUT/DELETE | Update/delete training | healthSafetyApi.ts |
| `/api/health-safety/environmental-health-records` | GET/POST | Manage environmental records | healthSafetyApi.ts |
| `/api/health-safety/environmental-health-records/{id}` | PUT/DELETE | Update/delete record | healthSafetyApi.ts |

### Reports & Analytics
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/reports` | GET/POST | List/generate reports | reportsApi.ts |
| `/api/reports/{id}` | GET/DELETE | Get/delete report | reportsApi.ts |
| `/api/reports/{id}/download` | GET | Download report | reportsApi.ts |
| `/api/analytics/monthly-trends` | GET | Get monthly trends | reportsApi.ts |
| `/api/analytics/ai-insights` | GET | Get AI insights | reportsApi.ts |
| `/api/analytics/kpis` | GET | Get KPIs | reportsApi.ts |
| `/api/analytics/attendance` | GET | Get attendance analytics | reportsApi.ts |
| `/api/analytics/financial` | GET | Get financial analytics | reportsApi.ts |
| `/api/analytics/performance` | GET | Get performance analytics | reportsApi.ts |

### Dashboard
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/dashboard/*` | GET | Dashboard data | dashboardApi.ts |

---

## Node.js Backend (Port 5001)

### Authentication
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/auth/login` | POST | User login | authApi.ts |
| `/api/auth/register` | POST | User registration | authApi.ts |
| `/api/auth/logout` | POST | User logout | authApi.ts |
| `/api/auth/refresh-token` | POST | Refresh token | authApi.ts |
| `/api/auth/change-password` | POST | Change password | authApi.ts |
| `/api/auth/me` | GET | Get current user | authApi.ts |
| `/api/auth/profile` | PUT | Update profile | authApi.ts |
| `/api/auth/sessions` | GET | Get active sessions | authApi.ts |

### Leave Management
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/leave/types` | GET/POST | Manage leave types | leaveApi.ts |
| `/api/leave/requests` | GET/POST | Manage leave requests | leaveApi.ts |
| `/api/leave/requests/{id}` | GET | Get leave request | leaveApi.ts |
| `/api/leave/requests/{id}/status` | PUT | Update status | leaveApi.ts |
| `/api/leave/requests/{id}/approve` | POST | Approve request | leaveApi.ts |
| `/api/leave/requests/{id}/reject` | POST | Reject request | leaveApi.ts |
| `/api/leave/balances` | GET | Get all balances | leaveApi.ts |
| `/api/leave/balances/{userId}` | GET | Get user balances | leaveApi.ts |
| `/api/leave/statistics` | GET | Get statistics | leaveApi.ts |

### Procurement
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/procurement/requests` | GET/POST | Manage procurement requests | procurementApi.ts |
| `/api/procurement/requests/{id}` | GET | Get request | procurementApi.ts |
| `/api/procurement/requests/{id}/status` | PUT | Update status | procurementApi.ts |
| `/api/procurement/requests/{id}/submit` | POST | Submit request | procurementApi.ts |
| `/api/procurement/requests/{id}/approve` | POST | Approve request | procurementApi.ts |
| `/api/procurement/vendors` | GET/POST | Manage vendors | procurementApi.ts |
| `/api/procurement/vendors/{id}` | GET | Get vendor | procurementApi.ts |
| `/api/procurement/tenders` | GET/POST | Manage tenders | procurementApi.ts |
| `/api/procurement/tenders/{id}/publish` | POST | Publish tender | procurementApi.ts |
| `/api/procurement/bids` | GET/POST | Manage bids | procurementApi.ts |
| `/api/procurement/contracts` | GET/POST | Manage contracts | procurementApi.ts |

### Lookup
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/lookup/departments` | GET | Get departments | lookupApi.ts |
| `/api/lookup/roles` | GET | Get roles | lookupApi.ts |

### Public Relations
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/public-relations/*` | Various | PR management | publicRelationsApi.ts |

### Planning & Development
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/planning/*` | Various | Planning management | planningApi.ts |

### Transportation
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/transportation/*` | Various | Transport management | transportationApi.ts |

### Payroll (Node.js)
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/payroll` | GET/POST | Manage payroll records | payrollApi.ts |
| `/api/payroll/{id}` | GET/PUT/DELETE | Manage record | payrollApi.ts |
| `/api/payroll/user/{userId}` | GET | Get user payroll | payrollApi.ts |

### Communication
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/api/communication/*` | Various | Communication management | communicationApi.ts |

---

## Java Backend (Port 5002)

### HR - Employees
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/hr/employees/register` | POST | Register employee | hrApi.ts |
| `/hr/employees/list` | GET | List all employees | hrApi.ts |
| `/hr/employees/provisioned` | GET | Get provisioned employees | hrApi.ts |
| `/hr/employees/id/{id}` | GET/PUT | Get/update employee | hrApi.ts |
| `/hr/employees/id/{id}/profile-picture` | PUT | Update profile picture | hrApi.ts |

### HR - Payroll (Java)
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/hr/payroll/runs` | GET/POST | Manage payroll runs | hrApi.ts |
| `/hr/payroll/runs/{id}` | GET/PUT/DELETE | Manage run | hrApi.ts |
| `/hr/payroll/payslips` | GET/POST | Manage payslips | hrApi.ts |
| `/hr/payroll/payslips/{id}` | GET/PUT/DELETE | Manage payslip | hrApi.ts |
| `/hr/payroll/payslips/user/{userId}` | GET | Get user payslips | hrApi.ts |
| `/hr/payroll/benefit-plans` | GET/POST | Manage benefit plans | hrApi.ts |
| `/hr/payroll/benefit-plans/{id}` | GET/PUT/DELETE | Manage benefit plan | hrApi.ts |
| `/hr/payroll/employee-benefits` | GET/POST | Manage employee benefits | hrApi.ts |
| `/hr/payroll/employee-benefits/{id}` | GET/PUT/DELETE | Manage employee benefit | hrApi.ts |
| `/hr/payroll/training-courses` | GET/POST | Manage training courses | hrApi.ts |
| `/hr/payroll/training-courses/{id}` | GET/PUT/DELETE | Manage training course | hrApi.ts |
| `/hr/payroll/employee-trainings` | GET/POST | Manage employee trainings | hrApi.ts |
| `/hr/payroll/employee-trainings/{id}` | GET/PUT/DELETE | Manage employee training | hrApi.ts |
| `/hr/payroll/performance-reviews` | GET/POST | Manage performance reviews | hrApi.ts |
| `/hr/payroll/performance-reviews/{id}` | GET/PUT/DELETE | Manage performance review | hrApi.ts |

### Assets
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/assets` | GET/POST | List/create assets | assetApi.ts |
| `/assets/{id}` | GET/PUT/DELETE | Manage asset | assetApi.ts |
| `/assets/maintenance-records` | GET/POST | Manage maintenance | assetApi.ts |
| `/assets/maintenance-records/{id}` | GET/PUT/DELETE | Manage record | assetApi.ts |
| `/assets/disposal-records` | GET/POST | Manage disposals | assetApi.ts |
| `/assets/disposal-records/{id}` | GET/PUT/DELETE | Manage record | assetApi.ts |
| `/assets/acquisition-requests` | GET/POST | Manage acquisitions | assetApi.ts |

### Finance
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/finance/accounts` | GET/POST | Manage chart of accounts | financeApi.ts |
| `/finance/accounts/{id}` | GET/PUT/DELETE | Manage account | financeApi.ts |
| `/finance/budgets` | GET/POST | Manage budgets | financeApi.ts |
| `/finance/budgets/{id}` | GET/PUT/DELETE | Manage budget | financeApi.ts |
| `/finance/budget-requests` | GET/POST | Manage budget requests | financeApi.ts |
| `/finance/budget-requests/{id}` | GET/PUT/DELETE | Manage budget request | financeApi.ts |
| `/finance/journal-entries` | GET/POST | Manage journal entries | financeApi.ts |
| `/finance/journal-entries/{id}` | GET/PUT/DELETE | Manage journal entry | financeApi.ts |
| `/finance/account-payables` | GET/POST | Manage payables | financeApi.ts |
| `/finance/account-payables/{id}` | GET/PUT/DELETE | Manage payable | financeApi.ts |
| `/finance/account-receivables` | GET/POST | Manage receivables | financeApi.ts |
| `/finance/account-receivables/{id}` | GET/PUT/DELETE | Manage receivable | financeApi.ts |

### Legal
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/legal/cases` | GET/POST | Manage legal cases | legalApi.ts |
| `/legal/cases/{id}` | GET/PUT/DELETE | Manage case | legalApi.ts |
| `/legal/compliance` | GET/POST | Manage compliance records | legalApi.ts |
| `/legal/compliance/{id}` | GET/PUT/DELETE | Manage record | legalApi.ts |

### Revenue
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/revenue/tax-assessments` | GET/POST | Manage tax assessments | revenueApi.ts |
| `/revenue/tax-assessments/{id}` | GET/PUT/DELETE | Manage assessment | revenueApi.ts |
| `/revenue/collections` | GET/POST | Manage revenue collections | revenueApi.ts |
| `/revenue/collections/{id}` | GET/PUT/DELETE | Manage collection | revenueApi.ts |

### System Configuration & Security
| Endpoint | Method | Description | Frontend Service |
|----------|--------|-------------|------------------|
| `/system/configs` | GET/POST | Manage system configs | systemApi.ts |
| `/system/configs/{id}` | GET/PUT/DELETE | Manage config | systemApi.ts |
| `/system/audit-logs` | GET/POST | Manage audit logs | systemApi.ts |
| `/system/audit-logs/{id}` | GET/PUT/DELETE | Manage audit log | systemApi.ts |
| `/system/audit-logs/user/{performedBy}/recent` | GET | Get recent user activities | systemApi.ts |
| `/system/security/access-rules` | GET/POST | Manage access rules | securityApi.ts |
| `/system/security/guard-posts` | GET/POST | Manage guard posts | securityApi.ts |
| `/system/security/sops` | GET/POST | Manage SOPs | securityApi.ts |
| `/system/security/incidents` | GET/POST | Manage security incidents | securityApi.ts |

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5003
```

### API Gateway (.env)
```env
PORT=5003
FRONTEND_URL=http://localhost:5173
JAVA_BACKEND_URL=http://localhost:5002
NODE_BACKEND_URL=http://localhost:5001
PYTHON_BACKEND_URL=http://localhost:5000
JWT_SECRET=your_jwt_secret
```

---

## Quick Reference: Which Backend Handles What?

### Python Backend (Port 5000)
- ✅ Biometric authentication
- ✅ Attendance tracking
- ✅ Visitor management
- ✅ Health & safety
- ✅ Reports & analytics
- ✅ Dashboard data

### Node.js Backend (Port 5001)
- ✅ User authentication
- ✅ Leave management
- ✅ Procurement
- ✅ Public relations
- ✅ Planning & development
- ✅ Transportation
- ✅ Communication
- ✅ Lookup data (departments, roles)
- ✅ Payroll (simple version)

### Java Backend (Port 5002)
- ✅ HR & employee management
- ✅ Payroll (comprehensive)
- ✅ Asset management
- ✅ Finance & budgets
- ✅ Legal & compliance
- ✅ Revenue & tax
- ✅ System configuration
- ✅ Security management (guard posts, SOPs, access rules, incidents)
- ✅ Audit logs

---

## API Service Organization

### Frontend Service Structure
```
Frontend/src/services/
├── javabackendapi/
│   ├── hrApi.ts              (HR & Payroll - all employee and payroll endpoints)
│   ├── financeApi.ts         (Finance & Budgets - all finance endpoints)
│   ├── assetApi.ts           (Asset Management - all asset endpoints)
│   ├── legalApi.ts           (Legal & Compliance - all legal endpoints)
│   ├── revenueApi.ts         (Revenue & Tax - all revenue endpoints)
│   ├── systemApi.ts          (System Config & Audit - all system endpoints)
│   ├── securityApi.ts        (Security Management - all security endpoints)
│   ├── adminApi.ts           (Admin operations)
│   └── journalApi.ts         (Journal entries)
├── nodejsbackendapi/
│   ├── authApi.ts            (Authentication - all auth endpoints)
│   ├── leaveApi.ts           (Leave Management - all leave endpoints)
│   ├── procurementApi.ts     (Procurement - all procurement endpoints)
│   ├── publicRelationsApi.ts (Public Relations - all PR endpoints)
│   ├── planningApi.ts        (Planning & Development - all planning endpoints)
│   ├── transportationApi.ts  (Transportation - all transport endpoints)
│   ├── payrollApi.ts         (Simple Payroll - Node.js payroll endpoints)
│   ├── lookupApi.ts          (Lookups - departments, roles, permissions)
│   └── systemApi.ts          (Audit Activities - recent activities)
├── pythonbackendapi/
│   ├── attendanceApi.ts      (Biometric & Attendance - all attendance endpoints)
│   ├── visitorApi.ts         (Visitor Management - all visitor endpoints)
│   ├── healthSafetyApi.ts    (Health & Safety - all H&S endpoints)
│   └── reportsApi.ts         (Reports & Analytics - all reporting endpoints)
└── api.ts                    (Unified exports - re-exports all services)
```

### How to Import

**Recommended (Direct Import):**
```typescript
// Import specific service for better tree-shaking
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { attendanceApiService } from '@/services/pythonbackendapi/attendanceApi';

// Use the service
const employees = await hrApiService.listEmployees();
const attendance = await attendanceApiService.getAttendanceRecords();
```

**Legacy (Unified Import):**
```typescript
// Import from unified api.ts (backward compatibility)
import { fetchEmployees, fetchAttendance } from '@/services/api';

// Use wrapper functions
const employees = await fetchEmployees();
const attendance = await fetchAttendance(userId);
```

### Service Organization Rules

1. **Each backend API file contains:**
   - Service class with all API methods
   - Type definitions for that domain
   - Wrapper functions for backward compatibility
   - Utility functions (mapping, formatting) specific to that domain

2. **api.ts only contains:**
   - Re-exports of all services
   - Re-exports of all wrapper functions
   - Type re-exports
   - NO implementation code

3. **Benefits:**
   - Clear separation by backend service
   - Better code organization and maintainability
   - Improved tree-shaking (import only what you need)
   - Easier to locate and update endpoints
   - Backward compatibility maintained

---

## Notes

1. **Payroll Duplication**: Payroll exists in both Node.js (`/api/payroll`) and Java (`/hr/payroll`). The Java version is more comprehensive and is the primary implementation used in the frontend.

2. **Security Module**: Security management (guard posts, SOPs, access rules, incidents) is implemented in the Java backend under `/system/security/*`.

3. **API Gateway Routing**: All requests go through the API Gateway which routes based on path prefixes to the appropriate backend service.

4. **Audit Logs**: Audit logs are managed by Java backend but recent activities are accessed through Node.js backend's system API.
