# Quick Reference: HR Module Integration

## Import & Setup (2 lines)
```typescript
import { integrationService } from '@/services/integration/CrossModuleIntegration';
import { useAuth } from '@/contexts/AuthContext';
```

## Emit Onboarding Event (7 lines)
```typescript
const correlationId = integrationService.initializeEmployeeOnboarding({
  employeeId: 123, employeeName: 'John Doe', email: 'john@bank.com',
  department: 'Finance', riskSensitivePosition: true,
  roles: ['analyst'], joiningDate: new Date().toISOString(),
}, user.id);
```

## Emit Offboarding Event (8 lines)
```typescript
const correlationId = integrationService.initiateEmployeeOffboarding({
  employeeId: 123, employeeName: 'John Doe',
  offboardingType: 'RESIGNATION', exitDate: '2024-03-18',
  assetsToReturn: [{assetId: 1, assetTag: 'LAP-001'}],
  accessToRevoke: [{system: 'AD', userId: 'jdoe'}]
}, user.id);
```

## Listen for Event (5 lines)
```typescript
integrationService.on('employee:onboarded', (event) => {
  console.log('New employee:', event.payload.employeeName);
  // Trigger module-specific actions
});
```

## Log Audit Entry (11 lines)
```typescript
integrationService.logAudit({
  correlationId: 'corr-123456', module: 'HR',
  action: 'EMPLOYEE_ONBOARDED', resourceType: 'Employee',
  resourceId: '123', userId: user.id,
  timestamp: new Date().toISOString(),
  status: 'success'
});
```

## Get Correlation Chain (1 line)
```typescript
const events = integrationService.getCorrelationChain('corr-123456');
```

## Query Audit Logs (1 line)
```typescript
const logs = integrationService.getAuditLogs({module: 'HR', startDate: '2024-01-01'});
```

---

## Event Types & Triggers

| Event | Trigger | Listeners | Use Case |
|-------|---------|-----------|----------|
| `employee:onboarded` | Onboarding complete | Security, Assets | Account creation, equipment assignment |
| `employee:offboarding-initiated` | Exit process starts | Assets, Security, Finance | Return checklist, access revocation |
| `employee:role-changed` | Position update | Security | RBAC update |
| `asset:assigned-to-employee` | Asset assignment | HR, Assets | Custody tracking |
| `asset:returned-from-employee` | Asset return | HR, Assets | Return verification |
| `security:account-created` | Account creation | HR, Audit | Confirmation of provisioning |
| `security:account-disabled` | Account deactivation | HR, Audit | Confirmation of deprovisioning |

---

## Component Import Paths

```typescript
// HR Components
import { HRDashboard } from '@/components/modules/hr/HRDashboard';
import { EmployeeProfiles } from '@/components/modules/hr/EmployeeProfiles';
import { RecruitmentOnboarding } from '@/components/modules/hr/RecruitmentOnboarding';
import { EmployeeOffboarding } from '@/components/modules/hr/EmployeeOffboarding';
import { ComplianceTracking } from '@/components/modules/hr/ComplianceTracking';

// Integration Components
import { HRAssetsIntegration } from '@/components/integration/HRAssetsIntegration';

// Services
import { integrationService } from '@/services/integration/CrossModuleIntegration';
```

---

## Type Imports

```typescript
// Enhanced HR Types
import type {
  EmployeeProfile,
  ComplianceItem,
  EmployeeOffboarding,
  OnboardingChecklist,
} from '@/types/hr-enhanced';

// Integration Types
import type {
  EmployeeOnboardingEvent,
  EmployeeOffboardingEvent,
  IntegrationEvent,
} from '@/services/integration/CrossModuleIntegration';
```

---

## Common Patterns

### Pattern 1: Complete Onboarding Tasks
```typescript
const allTasksComplete = onboardingTasks.every(t => t.completionDate);
if (allTasksComplete && user) {
  integrationService.initializeEmployeeOnboarding({...}, user.id);
}
```

### Pattern 2: Respond to Offboarding
```typescript
integrationService.on('employee:offboarding-initiated', (event) => {
  // Assets: Create return checklist
  // Security: Schedule account disable
  // Finance: Prepare settlement
});
```

### Pattern 3: Audit Change
```typescript
integrationService.logAudit({
  changes: [{field: 'role', oldValue: 'analyst', newValue: 'manager'}],
  status: 'success'
});
```

---

## Compliance Checklist for Banking

- [ ] Fit-and-Proper tracking (ComplianceTracking component)
- [ ] Background check status (same component)
- [ ] AML/KYC training completion (same component)
- [ ] Asset custody chain (HRAssetsIntegration)
- [ ] Access control automation (Security integration)
- [ ] Offboarding checklist (EmployeeOffboarding)
- [ ] Audit trail complete (integrationService logs)
- [ ] Correlation IDs tracked (all events)

---

## Testing Checklist

- [ ] Employee can be onboarded
- [ ] Event fires when onboarding completes
- [ ] Security receives event and logs action
- [ ] Assets receives event and assigns equipment
- [ ] Correlation chain shows all related events
- [ ] Employee can be marked for offboarding
- [ ] Asset return checklist appears
- [ ] Access revocation scheduled
- [ ] Audit log shows complete trail

---

## Key Files

| File | Purpose | Lines |
|------|---------|-------|
| CrossModuleIntegration.ts | Event system & audit | 307 |
| hr-enhanced.ts | Banking types | 258 |
| ComplianceTracking.tsx | Fit-and-proper, AML/KYC | 379 |
| HRAssetsIntegration.tsx | Asset tracking | 152 |
| EmployeeOffboarding.tsx | Exit workflow | +50 |
| RecruitmentOnboarding.tsx | Onboarding with events | +25 |

---

## Documentation

- **INTEGRATION_SETUP.md** - Complete setup guide
- **CROSS_MODULE_INTEGRATION.md** - Architecture & patterns
- **HR_MODULE_ENHANCEMENTS.md** - Banking features
- **BANKING_SYSTEM_COMPLETE.md** - Full system overview

---

## Commands

### List all events for employee (in console)
```typescript
integrationService.getAuditLogs({
  resourceType: 'Employee',
  resourceId: 'emp-123'
})
```

### Check if onboarding complete
```typescript
const events = integrationService.getCorrelationChain(correlationId);
const onboardingComplete = events.length > 0;
```

### Export audit trail for regulator
```typescript
const logs = integrationService.getAuditLogs({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
JSON.stringify(logs, null, 2);
```

---

## Error Handling

```typescript
try {
  const correlationId = integrationService.initializeEmployeeOnboarding({...}, userId);
  toast.success(`Employee onboarded (ID: ${correlationId})`);
} catch (error) {
  console.error('[v0] Onboarding failed:', error);
  toast.error('Failed to onboard employee');
}
```

---

## Security Note
- Always use `user.id` from `useAuth()` hook
- Never hardcode user IDs
- All actions are logged with user attribution
- Audit trail is immutable

---

**For complete details, see INTEGRATION_SETUP.md**
