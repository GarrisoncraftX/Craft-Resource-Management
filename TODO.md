# TODO: Add Missing Node.js API Endpoints to Frontend Services

## Overview
Ensure all Node.js backend API endpoints have corresponding frontend service functions. The Node.js backend has the following modules:
- Leave (already implemented: leaveApi.ts)
- Procurement (already implemented: procurementApi.ts)
- Public Relations (missing: publicRelationsApi.ts)
- Planning (missing: planningApi.ts)
- Transportation (missing: transportationApi.ts)
- Auth (missing: authApi.ts)
- Lookup (partially in api.ts, needs dedicated: lookupApi.ts)
- Payroll (missing: payrollApi.ts for Node.js backend)

## Tasks
- [x] Create procurementApi.ts with functions for procurement requests, vendors, tenders, bids, contracts, etc.
- [x] Create publicRelationsApi.ts with functions for press releases, media contacts, public events
- [x] Create planningApi.ts with functions for urban plans, projects, policies, strategic goals, development permits
- [x] Create transportationApi.ts with functions for vehicles, drivers, trips
- [x] Create authApi.ts with functions for register, signin, logout
- [ ] Create lookupApi.ts with functions for departments, roles, permissions
- [ ] Create payrollApi.ts with functions for payroll records (Node.js backend)
- [ ] Update api.ts to remove any duplicate functions and ensure clean separation
- [ ] Test all new API services for proper integration
