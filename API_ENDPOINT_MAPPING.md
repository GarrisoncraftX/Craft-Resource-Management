# API Endpoint Mapping - Clean Architecture

## Overview
This document describes the clean API architecture where each backend service has its own dedicated API file in the frontend, eliminating the need for a centralized api.ts with implementation code.

## Backend Services and Their Routes

### 1. Python Backend (Port 5000)
**API Gateway Prefix:** `/api/biometric`, `/api/visitors`, `/api/dashboard`, `/api/health-safety`, `/api/reports`, `/api/analytics`, `/api/attendance`

**Frontend Service Files:**
- `pythonbackendapi/attendanceApi.ts` - All biometric and attendance endpoints
- `pythonbackendapi/visitorApi.ts` - All visitor management endpoints
- `pythonbackendapi/healthSafetyApi.ts` - All health & safety endpoints
- `pythonbackendapi/reportsApi.ts` - All reports and analytics endpoints

### 2. Node.js Backend (Port 5001)
**API Gateway Prefix:** `/api/auth`, `/api/lookup`, `/api/leave`, `/api/procurement`, `/api/public-relations`, `/api/planning`, `/api/transportation`, `/api/payroll`, `/api/communication`

**Frontend Service Files:**
- `nodejsbackendapi/authApi.ts` - All authentication endpoints
- `nodejsbackendapi/lookupApi.ts` - All lookup endpoints (departments, roles, permissions)
- `nodejsbackendapi/leaveApi.ts` - All leave management endpoints
- `nodejsbackendapi/procurementApi.ts` - All procurement endpoints
- `nodejsbackendapi/publicRelationsApi.ts` - All public relations endpoints
- `nodejsbackendapi/planningApi.ts` - All planning & development endpoints
- `nodejsbackendapi/transportationApi.ts` - All transportation endpoints
- `nodejsbackendapi/payrollApi.ts` - Node.js payroll endpoints (simple version)
- `nodejsbackendapi/systemApi.ts` - Audit activities and recent activities

### 3. Java Backend (Port 5002)
**API Gateway Prefix:** `/finance`, `/hr`, `/assets`, `/legal`, `/revenue`, `/system`

**Frontend Service Files:**
- `javabackendapi/hrApi.ts` - All HR and payroll endpoints (comprehensive)
- `javabackendapi/financeApi.ts` - All finance and budget endpoints
- `javabackendapi/assetApi.ts` - All asset management endpoints
- `javabackendapi/legalApi.ts` - All legal and compliance endpoints
- `javabackendapi/revenueApi.ts` - All revenue and tax endpoints
- `javabackendapi/systemApi.ts` - All system config and audit log endpoints
- `javabackendapi/securityApi.ts` - All security management endpoints
- `javabackendapi/adminApi.ts` - Admin operations
- `javabackendapi/journalApi.ts` - Journal entries

## Clean Architecture Principles

### 1. No Centralized Implementation
- **OLD:** api.ts contained all wrapper functions and mapping logic
- **NEW:** api.ts only re-exports services and functions from backend-specific files

### 2. Backend-Specific Organization
Each backend API file contains:
- Service class with all API methods
- Type definitions for that domain
- Wrapper functions for backward compatibility
- Utility functions (mapping, formatting)

### 3. Direct Imports (Recommended)
```typescript
// Import directly from backend-specific file
import { hrApiService } from '@/services/javabackendapi/hrApi';

// Use the service
const employees = await hrApiService.listEmployees();
const payslips = await hrApiService.getAllPayslips();
```

### 4. Unified Imports (Legacy Support)
```typescript
// Import from unified api.ts for backward compatibility
import { fetchEmployees, fetchPayslips } from '@/services/api';

// Use wrapper functions
const employees = await fetchEmployees();
const payslips = await fetchPayslips();
```

## File Structure

```
Frontend/src/services/
├── javabackendapi/
│   ├── hrApi.ts              ✅ Contains: HR & Payroll endpoints + wrapper functions
│   ├── financeApi.ts         ✅ Contains: Finance & Budget endpoints + wrapper functions
│   ├── assetApi.ts           ✅ Contains: Asset endpoints + wrapper functions
│   ├── legalApi.ts           ✅ Contains: Legal endpoints + wrapper functions
│   ├── revenueApi.ts         ✅ Contains: Revenue endpoints + wrapper functions
│   ├── systemApi.ts          ✅ Contains: System config endpoints + wrapper functions
│   ├── securityApi.ts        ✅ Contains: Security endpoints
│   ├── adminApi.ts           ✅ Contains: Admin endpoints
│   └── journalApi.ts         ✅ Contains: Journal endpoints
├── nodejsbackendapi/
│   ├── authApi.ts            ✅ Contains: Auth endpoints
│   ├── leaveApi.ts           ✅ Contains: Leave endpoints
│   ├── procurementApi.ts     ✅ Contains: Procurement endpoints
│   ├── publicRelationsApi.ts ✅ Contains: PR endpoints
│   ├── planningApi.ts        ✅ Contains: Planning endpoints
│   ├── transportationApi.ts  ✅ Contains: Transportation endpoints
│   ├── payrollApi.ts         ✅ Contains: Node.js payroll endpoints
│   ├── lookupApi.ts          ✅ Contains: Lookup endpoints + wrapper functions
│   └── systemApi.ts          ✅ Contains: Audit activities + wrapper functions
├── pythonbackendapi/
│   ├── attendanceApi.ts      ✅ Contains: Attendance endpoints + wrapper functions
│   ├── visitorApi.ts         ✅ Contains: Visitor endpoints
│   ├── healthSafetyApi.ts    ✅ Contains: Health & Safety endpoints
│   └── reportsApi.ts         ✅ Contains: Reports & Analytics endpoints
└── api.ts                    ✅ Only re-exports (NO implementation)
```

## Endpoint to File Mapping

### Java Backend Endpoints

| Endpoint Pattern | Frontend File | Contains |
|-----------------|---------------|----------|
| `/hr/employees/*` | `javabackendapi/hrApi.ts` | Employee management, registration, profile updates |
| `/hr/payroll/*` | `javabackendapi/hrApi.ts` | Payroll runs, payslips, benefits, training, reviews |
| `/assets/*` | `javabackendapi/assetApi.ts` | Assets, maintenance, disposal, acquisition, valuation |
| `/finance/*` | `javabackendapi/financeApi.ts` | Accounts, budgets, journal entries, payables, receivables |
| `/legal/*` | `javabackendapi/legalApi.ts` | Legal cases, compliance records |
| `/revenue/*` | `javabackendapi/revenueApi.ts` | Tax assessments, revenue collections |
| `/system/configs/*` | `javabackendapi/systemApi.ts` | System configurations |
| `/system/audit-logs/*` | `javabackendapi/systemApi.ts` | Audit logs |
| `/system/security/*` | `javabackendapi/securityApi.ts` | Access rules, guard posts, SOPs, incidents |

### Node.js Backend Endpoints

| Endpoint Pattern | Frontend File | Contains |
|-----------------|---------------|----------|
| `/api/auth/*` | `nodejsbackendapi/authApi.ts` | Login, register, logout, token refresh, profile |
| `/api/lookup/*` | `nodejsbackendapi/lookupApi.ts` | Departments, roles, permissions |
| `/api/leave/*` | `nodejsbackendapi/leaveApi.ts` | Leave types, requests, balances, approvals |
| `/api/procurement/*` | `nodejsbackendapi/procurementApi.ts` | Requests, vendors, tenders, bids, contracts |
| `/api/public-relations/*` | `nodejsbackendapi/publicRelationsApi.ts` | PR management |
| `/api/planning/*` | `nodejsbackendapi/planningApi.ts` | Planning & development |
| `/api/transportation/*` | `nodejsbackendapi/transportationApi.ts` | Transport management |
| `/api/payroll/*` | `nodejsbackendapi/payrollApi.ts` | Simple payroll (Node.js version) |

### Python Backend Endpoints

| Endpoint Pattern | Frontend File | Contains |
|-----------------|---------------|----------|
| `/api/biometric/*` | `pythonbackendapi/attendanceApi.ts` | Biometric enrollment, verification, identification |
| `/api/attendance/*` | `pythonbackendapi/attendanceApi.ts` | Clock in/out, records, stats, manual fallbacks |
| `/api/visitors/*` | `pythonbackendapi/visitorApi.ts` | Token generation, check-in/out, entry passes |
| `/api/health-safety/*` | `pythonbackendapi/healthSafetyApi.ts` | Incidents, inspections, trainings, environmental |
| `/api/reports/*` | `pythonbackendapi/reportsApi.ts` | Report generation, download |
| `/api/analytics/*` | `pythonbackendapi/reportsApi.ts` | Trends, insights, KPIs, analytics |
| `/api/dashboard/*` | `pythonbackendapi/reportsApi.ts` | Dashboard data |

## Migration Guide

### For Developers

**Before (Old Way):**
```typescript
// Everything imported from api.ts
import { fetchEmployees, createBudget, fetchAssets } from '@/services/api';
```

**After (New Way - Recommended):**
```typescript
// Import directly from backend-specific files
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { financeApiService } from '@/services/javabackendapi/financeApi';
import { assetApiService } from '@/services/javabackendapi/assetApi';

// Use services directly
const employees = await hrApiService.listEmployees();
const budgets = await financeApiService.getAllBudgets();
const assets = await assetApiService.getAllAssets();
```

**After (New Way - Legacy Support):**
```typescript
// Still works for backward compatibility
import { fetchEmployees, createBudget, fetchAssets } from '@/services/api';
```

## Benefits of Clean Architecture

1. **Clear Separation:** Each backend has its own dedicated file
2. **Better Organization:** Easy to find and update endpoints
3. **Improved Tree-Shaking:** Import only what you need
4. **Type Safety:** Better TypeScript support with domain-specific types
5. **Maintainability:** Changes to one backend don't affect others
6. **Scalability:** Easy to add new endpoints to the right file
7. **Backward Compatibility:** Legacy imports still work via api.ts re-exports

## Notes

1. **Payroll Duplication:** Payroll exists in both Node.js (`/api/payroll`) and Java (`/hr/payroll`). The Java version is comprehensive and is the primary implementation.

2. **Security Module:** Security management is in Java backend under `/system/security/*` and mapped to `javabackendapi/securityApi.ts`.

3. **Audit Logs:** Audit logs are in Java backend but recent activities are accessed through Node.js backend's system API.

4. **No More api.ts Implementation:** The api.ts file now only contains re-exports for backward compatibility. All implementation is in backend-specific files.
