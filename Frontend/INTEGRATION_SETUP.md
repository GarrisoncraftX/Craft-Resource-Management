# Cross-Module Integration Setup Guide
## Getting Started with Enterprise Banking System Integration

### Quick Start

#### 1. Import Integration Service
```typescript
import { integrationService } from '@/services/integration/CrossModuleIntegration';
import { useAuth } from '@/contexts/AuthContext';
```

#### 2. Set Up Event Listeners (in useEffect)
```typescript
useEffect(() => {
  // Listen for employee onboarding
  integrationService.on('employee:onboarded', (event) => {
    console.log('New employee:', event.payload.employeeName);
    // Trigger any module-specific actions
  });

  // Listen for offboarding
  integrationService.on('employee:offboarding-initiated', (event) => {
    console.log('Employee exiting:', event.payload.employeeName);
    // Trigger asset return, access revocation, etc.
  });
}, []);
```

#### 3. Emit Integration Events
```typescript
const { user } = useAuth();

// When employee is onboarded
const correlationId = integrationService.initializeEmployeeOnboarding(
  {
    employeeId: 123,
    employeeName: 'John Doe',
    email: 'john@bank.com',
    department: 'Finance',
    riskSensitivePosition: true,
    roles: ['financial-analyst'],
    joiningDate: new Date().toISOString(),
  },
  user.id
);
```

---

## Event Reference

### Employee Lifecycle Events

#### `employee:onboarded`
**Triggered**: When new employee onboarding is complete
**Listeners**: Security (create account), Assets (assign equipment)
**Payload**:
```typescript
{
  employeeId: number;
  employeeName: string;
  email: string;
  department: string;
  riskSensitivePosition: boolean;
  roles: string[];
  joiningDate: string;
}
```

**Example**:
```typescript
integrationService.on('employee:onboarded', (event) => {
  // Create security account
  integrationService.createSecurityAccount(
    event.payload.employeeId,
    event.payload.email,
    event.correlationId,
    event.userId
  );
});
```

#### `employee:offboarding-initiated`
**Triggered**: When employee exit process starts
**Listeners**: Assets (prepare returns), Security (schedule deactivation)
**Payload**:
```typescript
{
  employeeId: number;
  employeeName: string;
  offboardingType: 'RESIGNATION' | 'TERMINATION' | 'RETIREMENT' | 'TRANSFER';
  exitDate: string;
  assetsToReturn: { assetId: number; assetTag: string }[];
  accessToRevoke: { system: string; userId: string }[];
}
```

#### `employee:role-changed`
**Triggered**: When employee role/position changes
**Listeners**: Security (update RBAC), Audit (log change)
**Payload**:
```typescript
{
  employeeId: number;
  oldRole: string;
  newRole: string;
  department: string;
}
```

### Asset Events

#### `asset:assigned-to-employee`
**Triggered**: When asset is assigned to employee
**Payload**:
```typescript
{
  assetId: number;
  assetTag: string;
  assignedTo: number;
  employeeName: string;
  assignmentDate: string;
  expectedReturnDate?: string;
}
```

#### `asset:returned-from-employee`
**Triggered**: When asset is returned
**Payload**: Same as assignment

#### `asset:offboarding-return-initiated`
**Triggered**: During offboarding, when asset return is required

### Security Events

#### `security:account-created`
**Triggered**: When security account is created for new employee
**Payload**:
```typescript
{
  employeeId: number;
  email: string;
}
```

#### `security:account-disabled`
**Triggered**: When account is disabled during offboarding
**Payload**: Same as account-created

---

## Audit Logging

### Log Every Important Action
```typescript
integrationService.logAudit({
  correlationId: 'corr-123456',
  module: 'HR',
  action: 'EMPLOYEE_ONBOARDED',
  resourceType: 'Employee',
  resourceId: '123',
  userId: user.id,
  timestamp: new Date().toISOString(),
  changes: [
    {
      field: 'status',
      oldValue: 'pending',
      newValue: 'active',
    }
  ],
  status: 'success',
});
```

### Query Audit Logs
```typescript
const logs = integrationService.getAuditLogs({
  module: 'HR',
  userId: 'emp-123',
  startDate: '2024-01-01',
  endDate: '2024-02-18',
});
```

### Get Correlation Chain
```typescript
// View all events related to a transaction
const events = integrationService.getCorrelationChain('corr-1708234567-abc123def');
events.forEach(event => {
  console.log(`${event.sourceModule}: ${event.eventType} @ ${event.timestamp}`);
});
```

---

## Module-Specific Integration Examples

### HR Module Integration

#### In RecruitmentOnboarding.tsx
```typescript
const handleCompleteTask = async (taskId: number) => {
  // ... existing code ...

  // Check if all onboarding tasks complete
  if (allTasksComplete && selectedUserId && user) {
    const correlationId = integrationService.initializeEmployeeOnboarding(
      {
        employeeId: selectedUserId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        department: employee.department,
        riskSensitivePosition: false,
        roles: [],
        joiningDate: new Date().toISOString(),
      },
      user.id
    );
  }
};
```

#### In EmployeeOffboarding.tsx
```typescript
const handleComplete = async (id: number) => {
  const offboarding = offboardings.find(o => o.id === id);
  const employee = employees.find(e => Number(e.id) === offboarding?.userId);

  if (offboarding && employee && user) {
    const correlationId = integrationService.initiateEmployeeOffboarding(
      {
        employeeId: offboarding.userId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        offboardingType: offboarding.offboardingType,
        exitDate: offboarding.lastWorkingDate,
        assetsToReturn: [],
        accessToRevoke: [],
      },
      user.id
    );
  }

  await completeOffboarding(id);
};
```

### Assets Module Integration

#### In AssetAssignment
```typescript
const assignAssetToEmployee = async (assetId: number, employeeId: number) => {
  const correlationId = integrationService.logAssetAssignment(
    {
      assetId,
      assetTag: 'LAP-2024-001',
      assignedTo: employeeId,
      employeeName: 'John Doe',
      assignmentDate: new Date().toISOString(),
    },
    user.id
  );
  
  // Asset assigned and logged
};
```

#### Listen for Offboarding Asset Returns
```typescript
integrationService.on('employee:offboarding-initiated', (event) => {
  const assetsToReturn = event.payload.assetsToReturn;
  
  // Create return checklist
  assetsToReturn.forEach(asset => {
    console.log(`Asset ${asset.assetTag} must be returned by ${event.payload.exitDate}`);
  });
});
```

### Security Module Integration

#### Respond to Employee Onboarding
```typescript
integrationService.on('employee:onboarded', (event) => {
  integrationService.createSecurityAccount(
    event.payload.employeeId,
    event.payload.email,
    event.correlationId,
    event.userId
  );
});
```

#### Respond to Employee Offboarding
```typescript
integrationService.on('employee:offboarding-initiated', (event) => {
  integrationService.revokeSecurityAccess(
    event.payload.employeeId,
    event.payload.email,
    event.correlationId,
    event.userId
  );
});
```

---

## Correlation ID Pattern

### What is a Correlation ID?
A unique identifier that links all events related to a single transaction across multiple modules.

### Example Flow:
```
Employee Onboarding (Correlation ID: corr-1708234567-abc123def)
├─ 2024-02-18T10:15:00Z - HR: EMPLOYEE_ONBOARDED
├─ 2024-02-18T10:15:05Z - Security: ACCOUNT_CREATED
├─ 2024-02-18T10:15:30Z - Assets: EQUIPMENT_ASSIGNED
├─ 2024-02-18T10:15:35Z - Audit: ACTION_LOGGED
└─ 2024-02-18T10:15:40Z - Notifications: EMAIL_SENT
```

### Usage:
```typescript
// When starting a process, get correlation ID
const correlationId = integrationService.initializeEmployeeOnboarding(...);

// Later, retrieve all related events
const chain = integrationService.getCorrelationChain(correlationId);

// Each event has same correlationId for tracing
chain.forEach(event => {
  if (event.correlationId === correlationId) {
    console.log('Related event:', event.eventType);
  }
});
```

---

## Best Practices

### 1. Always Use Current User Context
```typescript
const { user } = useAuth();
// Pass user.id to integration methods
integrationService.emit(..., user.id);
```

### 2. Log All State Changes
```typescript
// Before state change
const oldValue = employee.status;

// Make change
employee.status = 'active';

// Log change
integrationService.logAudit({
  changes: [{ field: 'status', oldValue, newValue: 'active' }],
  // ... rest of audit data
});
```

### 3. Use Event Listeners for Side Effects
```typescript
// DO: Use integration events
integrationService.on('employee:onboarded', (event) => {
  // Security can respond independently
});

// DON'T: Call security module directly from HR
// (Breaks loose coupling)
```

### 4. Handle Errors Gracefully
```typescript
try {
  const correlationId = integrationService.initiateEmployeeOffboarding(...);
  console.log('Offboarding initiated:', correlationId);
} catch (error) {
  console.error('Failed to initiate offboarding:', error);
  toast.error('Offboarding process failed');
}
```

### 5. Store Correlation ID for User Reference
```typescript
// Show user the correlation ID for support/tracking
toast.success(`Employee onboarded (ID: ${correlationId})`);
```

---

## Testing Integration Events

### Mock Integration Service
```typescript
const mockIntegrationService = {
  on: jest.fn(),
  emit: jest.fn(),
  logAudit: jest.fn(),
  initializeEmployeeOnboarding: jest.fn(),
  initiateEmployeeOffboarding: jest.fn(),
  getCorrelationChain: jest.fn(),
};
```

### Test Event Emission
```typescript
test('should emit employee:onboarded event on onboarding complete', async () => {
  const correlationId = integrationService.initializeEmployeeOnboarding(
    mockEmployee,
    mockUser.id
  );

  // Verify event was emitted
  const chain = integrationService.getCorrelationChain(correlationId);
  expect(chain).toHaveLength(1);
  expect(chain[0].eventType).toBe('employee:onboarded');
});
```

---

## Troubleshooting

### Event Not Firing?
1. Check event listener is registered before event emitted
2. Verify correlation ID is passed correctly
3. Check console for error messages

### Audit Log Not Recording?
1. Verify `integrationService.logAudit()` is called
2. Check user context is available
3. Verify timestamp is ISO format

### Correlation Chain Empty?
1. Verify correlation ID matches exactly
2. Check events are emitted to same service instance
3. Confirm no errors in event listeners

---

## Related Documentation

- **CROSS_MODULE_INTEGRATION.md** - Architecture & design patterns
- **HR_MODULE_ENHANCEMENTS.md** - HR-specific features
- **ASSET_LIFECYCLE_FEATURES.md** - Asset management features
- **Security Module Docs** - Role-based access control
- **Audit Module Docs** - Compliance reporting

---

**Questions? Check the integration examples in RecruitmentOnboarding.tsx and EmployeeOffboarding.tsx**
