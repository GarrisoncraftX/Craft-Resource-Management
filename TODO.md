# TODO: Implement Recent Activities for Employee Dashboard using Audit Log

## Backend Changes (Java Backend)

### 1. Update AuditLogRepository
- [ ] Fix missing import for `List` in `AuditLogRepository.java`

### 2. SystemService and SystemController
- [x] Methods and endpoint already implemented

## Frontend Changes

### 3. Update types/api.ts
- [ ] Add `AuditLog` interface

### 4. Update api.ts
- [ ] Add `fetchRecentActivities` function

### 5. Update EmployeeDashboard.tsx
- [ ] Replace recent activities logic with API call to audit logs

## Testing and Followup
- [ ] Test the dashboard to ensure recent activities display correctly from audit logs
- [ ] Verify audit logs are being created in relevant controllers (attendance, leave, payroll, auth)
