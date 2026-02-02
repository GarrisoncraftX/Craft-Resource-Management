# API Documentation
# Craft Resource Management System

**Version:** 1.0  
**Base URL:** `http://localhost:5003`  
**Authentication:** JWT Bearer Token

---

## Table of Contents
1. [Authentication](#authentication)
2. [HR Module APIs](#hr-module-apis)
3. [Finance Module APIs](#finance-module-apis)
4. [Asset Module APIs](#asset-module-apis)
5. [Leave Module APIs](#leave-module-apis)
6. [Procurement Module APIs](#procurement-module-apis)
7. [Visitor Module APIs](#visitor-module-apis)
8. [Health & Safety APIs](#health--safety-apis)
9. [Reports & Analytics APIs](#reports--analytics-apis)
10. [Dashboard APIs](#dashboard-apis)
11. [Error Codes](#error-codes)

---

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": 123,
    "email": "user@example.com"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 123,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roleId": 2,
      "roleName": "Employee",
      "departmentId": 5,
      "departmentName": "IT"
    }
  }
}
```

### Request Password Reset
```http
POST /api/auth/request-password-reset
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "verification-token-here"
}
```

---

## HR Module APIs

### List Employees
```http
GET /hr/employees?page=1&limit=20&search=john&departmentId=5
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or employee ID
- `departmentId` (optional): Filter by department
- `status` (optional): Filter by status (active, inactive)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employeeId": 1001,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "phone": "+1234567890",
        "departmentId": 5,
        "departmentName": "IT",
        "positionId": 10,
        "positionTitle": "Software Engineer",
        "hireDate": "2023-01-15",
        "status": "active",
        "photoUrl": "https://cloudinary.com/..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Get Employee Details
```http
GET /hr/employees/{employeeId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employeeId": 1001,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-05-15",
    "gender": "Male",
    "address": "123 Main St, City, State",
    "departmentId": 5,
    "departmentName": "IT",
    "positionId": 10,
    "positionTitle": "Software Engineer",
    "hireDate": "2023-01-15",
    "employmentType": "Full-time",
    "status": "active",
    "salary": 75000,
    "bankAccount": "1234567890",
    "taxId": "123-45-6789",
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+1234567891"
    },
    "photoUrl": "https://cloudinary.com/..."
  }
}
```

### Create Employee
```http
POST /hr/employees
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "address": "123 Main St, City, State",
  "departmentId": 5,
  "positionId": 10,
  "hireDate": "2023-01-15",
  "employmentType": "Full-time",
  "salary": 75000,
  "bankAccount": "1234567890",
  "taxId": "123-45-6789"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": 1001
  }
}
```

### Update Employee
```http
PUT /hr/employees/{employeeId}
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (Same as Create, all fields optional)

### Process Payroll
```http
POST /hr/payroll/process
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "payPeriodStart": "2025-01-01",
  "payPeriodEnd": "2025-01-31",
  "paymentDate": "2025-02-05",
  "departmentId": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payroll processed successfully",
  "data": {
    "payrollRunId": 501,
    "employeesProcessed": 45,
    "totalAmount": 337500.00,
    "payslipsGenerated": 45
  }
}
```

### Get Payslip
```http
GET /hr/payroll/payslips/{payslipId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payslipId": 1001,
    "employeeId": 1001,
    "employeeName": "John Doe",
    "payPeriod": "January 2025",
    "paymentDate": "2025-02-05",
    "basicSalary": 75000.00,
    "allowances": 10000.00,
    "grossPay": 85000.00,
    "deductions": {
      "tax": 15000.00,
      "insurance": 2000.00,
      "pension": 5000.00
    },
    "totalDeductions": 22000.00,
    "netPay": 63000.00
  }
}
```

### Record Attendance
```http
POST /hr/attendance
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "employeeId": 1001,
  "date": "2025-01-15",
  "checkIn": "08:30:00",
  "checkOut": "17:30:00",
  "status": "present"
}
```

### Get HR Dashboard KPIs
```http
GET /hr/dashboard-kpis
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 450,
    "activeEmployees": 445,
    "newHires": 12,
    "resignations": 3,
    "averageAttendance": 96.5,
    "pendingLeaveRequests": 8,
    "upcomingTrainings": 5
  }
}
```

---

## Finance Module APIs

### Get Chart of Accounts
```http
GET /finance/accounts?type=expense&status=active
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "accountId": 1001,
      "accountCode": "1000",
      "accountName": "Cash",
      "accountType": "asset",
      "parentAccountId": null,
      "balance": 150000.00,
      "status": "active"
    }
  ]
}
```

### Create Journal Entry
```http
POST /finance/journal-entries
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2025-01-15",
  "description": "Office supplies purchase",
  "reference": "INV-2025-001",
  "lines": [
    {
      "accountId": 5001,
      "debit": 5000.00,
      "credit": 0
    },
    {
      "accountId": 1001,
      "debit": 0,
      "credit": 5000.00
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Journal entry created successfully",
  "data": {
    "journalEntryId": 2001,
    "entryNumber": "JE-2025-001"
  }
}
```

### Create Budget
```http
POST /finance/budgets
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "fiscalYear": 2025,
  "departmentId": 5,
  "accountId": 5001,
  "budgetAmount": 100000.00,
  "period": "annual"
}
```

### Get Budget Report
```http
GET /finance/budgets/report?departmentId=5&fiscalYear=2025
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "departmentId": 5,
    "departmentName": "IT",
    "fiscalYear": 2025,
    "totalBudget": 500000.00,
    "totalSpent": 325000.00,
    "remaining": 175000.00,
    "utilizationRate": 65.0,
    "accounts": [
      {
        "accountName": "Salaries",
        "budgeted": 300000.00,
        "spent": 200000.00,
        "remaining": 100000.00
      }
    ]
  }
}
```

### Create Account Payable
```http
POST /finance/accounts-payable
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "vendorId": 101,
  "invoiceNumber": "INV-2025-001",
  "invoiceDate": "2025-01-15",
  "dueDate": "2025-02-15",
  "amount": 50000.00,
  "description": "Office equipment",
  "items": [
    {
      "description": "Laptops",
      "quantity": 10,
      "unitPrice": 5000.00,
      "amount": 50000.00
    }
  ]
}
```

### Record Payment
```http
POST /finance/accounts-payable/{payableId}/payment
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentDate": "2025-02-10",
  "amount": 50000.00,
  "paymentMethod": "bank_transfer",
  "reference": "TXN-2025-001"
}
```

---

## Asset Module APIs

### List Assets
```http
GET /assets?category=computer&status=active&location=HQ
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "assetId": 3001,
      "assetTag": "AST-2025-001",
      "assetName": "Dell Laptop",
      "category": "Computer Equipment",
      "serialNumber": "SN123456",
      "purchaseDate": "2024-01-15",
      "purchasePrice": 75000.00,
      "currentValue": 60000.00,
      "location": "HQ - IT Department",
      "custodian": "John Doe",
      "status": "active",
      "condition": "good"
    }
  ]
}
```

### Register Asset
```http
POST /assets
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "assetName": "Dell Laptop",
  "category": "Computer Equipment",
  "serialNumber": "SN123456",
  "purchaseDate": "2024-01-15",
  "purchasePrice": 75000.00,
  "supplierId": 201,
  "location": "HQ - IT Department",
  "custodianId": 1001,
  "warrantyExpiry": "2027-01-15",
  "depreciationRate": 20.0
}
```

### Record Maintenance
```http
POST /assets/{assetId}/maintenance
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "maintenanceDate": "2025-01-15",
  "maintenanceType": "preventive",
  "description": "Regular servicing and cleaning",
  "cost": 5000.00,
  "performedBy": "Tech Support Team",
  "nextMaintenanceDate": "2025-07-15"
}
```

### Dispose Asset
```http
POST /assets/{assetId}/dispose
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "disposalDate": "2025-01-15",
  "disposalMethod": "sale",
  "disposalValue": 20000.00,
  "reason": "Obsolete equipment",
  "approvedBy": 5001
}
```

---

## Leave Module APIs

### Submit Leave Request
```http
POST /api/leave/requests
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "leaveTypeId": 1,
  "startDate": "2025-02-01",
  "endDate": "2025-02-05",
  "reason": "Family vacation",
  "contactDuringLeave": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "leaveRequestId": 4001,
    "status": "pending",
    "daysRequested": 5,
    "remainingBalance": 15
  }
}
```

### Get Leave Requests
```http
GET /api/leave/requests?status=pending&employeeId=1001
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "leaveRequestId": 4001,
      "employeeId": 1001,
      "employeeName": "John Doe",
      "leaveType": "Annual Leave",
      "startDate": "2025-02-01",
      "endDate": "2025-02-05",
      "days": 5,
      "reason": "Family vacation",
      "status": "pending",
      "submittedDate": "2025-01-15",
      "approverId": 5001,
      "approverName": "Jane Smith"
    }
  ]
}
```

### Approve/Reject Leave
```http
POST /api/leave/requests/{requestId}/approve
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "approve",
  "comments": "Approved. Enjoy your vacation!"
}
```

### Get Leave Balance
```http
GET /api/leave/balance
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employeeId": 1001,
    "balances": [
      {
        "leaveTypeId": 1,
        "leaveType": "Annual Leave",
        "entitled": 20,
        "used": 5,
        "pending": 5,
        "available": 10
      },
      {
        "leaveTypeId": 2,
        "leaveType": "Sick Leave",
        "entitled": 10,
        "used": 2,
        "pending": 0,
        "available": 8
      }
    ]
  }
}
```

---

## Procurement Module APIs

### Create Purchase Requisition
```http
POST /api/procurement/requests
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "departmentId": 5,
  "requestDate": "2025-01-15",
  "requiredDate": "2025-02-01",
  "justification": "Replace old equipment",
  "items": [
    {
      "description": "Dell Laptop",
      "quantity": 5,
      "estimatedUnitPrice": 75000.00,
      "specifications": "i7, 16GB RAM, 512GB SSD"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Purchase requisition created successfully",
  "data": {
    "requisitionId": 6001,
    "requisitionNumber": "PR-2025-001",
    "status": "pending_approval"
  }
}
```

### List Vendors
```http
GET /api/procurement/vendors?category=electronics&status=active
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "vendorId": 201,
      "vendorName": "Tech Supplies Ltd",
      "category": "Electronics",
      "contactPerson": "Mike Johnson",
      "email": "mike@techsupplies.com",
      "phone": "+1234567890",
      "address": "456 Business Ave",
      "rating": 4.5,
      "status": "active"
    }
  ]
}
```

### Create Purchase Order
```http
POST /api/procurement/purchase-orders
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "requisitionId": 6001,
  "vendorId": 201,
  "orderDate": "2025-01-20",
  "deliveryDate": "2025-02-01",
  "paymentTerms": "Net 30",
  "items": [
    {
      "description": "Dell Laptop",
      "quantity": 5,
      "unitPrice": 75000.00,
      "amount": 375000.00
    }
  ],
  "totalAmount": 375000.00
}
```

---

## Visitor Module APIs

### Generate Visitor Token
```http
POST /api/visitors/generate-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "visitorName": "Alice Brown",
  "visitorEmail": "alice@example.com",
  "visitorPhone": "+1234567890",
  "hostEmployeeId": 1001,
  "visitPurpose": "Business meeting",
  "visitDate": "2025-01-20",
  "expectedArrival": "10:00",
  "expectedDeparture": "12:00"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Visitor token generated successfully",
  "data": {
    "token": "VIS-2025-ABC123",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Validate Token
```http
POST /api/visitors/validate-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "VIS-2025-ABC123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "visitorName": "Alice Brown",
    "hostName": "John Doe",
    "visitPurpose": "Business meeting",
    "visitDate": "2025-01-20"
  }
}
```

### Check-in Visitor
```http
POST /api/visitors/checkin
Content-Type: multipart/form-data
```

**Form Data:**
- `token`: VIS-2025-ABC123
- `photo`: (file upload)
- `idType`: passport
- `idNumber`: AB123456

**Response (200):**
```json
{
  "success": true,
  "message": "Visitor checked in successfully",
  "data": {
    "visitorLogId": 7001,
    "checkInTime": "2025-01-20T10:05:00Z",
    "entryPassUrl": "https://..."
  }
}
```

### Check-out Visitor
```http
POST /api/visitors/checkout
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "visitorLogId": 7001
}
```

---

## Health & Safety APIs

### Report Incident
```http
POST /api/health-safety/incidents
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "incidentDate": "2025-01-15",
  "incidentTime": "14:30",
  "location": "Workshop Area",
  "incidentType": "injury",
  "severity": "minor",
  "description": "Employee slipped on wet floor",
  "injuredPersonId": 1001,
  "witnessIds": [1002, 1003],
  "immediateAction": "First aid provided"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Incident reported successfully",
  "data": {
    "incidentId": 8001,
    "incidentNumber": "INC-2025-001",
    "status": "under_investigation"
  }
}
```

### Create Safety Inspection
```http
POST /api/health-safety/inspections
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "inspectionDate": "2025-01-15",
  "inspectionType": "routine",
  "area": "Workshop",
  "inspectorId": 5001,
  "findings": [
    {
      "item": "Fire extinguisher",
      "status": "compliant",
      "notes": "In good condition"
    },
    {
      "item": "Emergency exit",
      "status": "non_compliant",
      "notes": "Exit blocked by equipment",
      "correctiveAction": "Clear exit path immediately"
    }
  ]
}
```

### Get Compliance Status
```http
GET /api/health-safety/compliance
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overallCompliance": 92.5,
    "categories": [
      {
        "category": "Fire Safety",
        "compliance": 95.0,
        "issues": 2
      },
      {
        "category": "Equipment Safety",
        "compliance": 90.0,
        "issues": 5
      }
    ],
    "pendingActions": 7,
    "overdueActions": 2
  }
}
```

---

## Reports & Analytics APIs

### Generate Report
```http
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reportType": "employee_attendance",
  "parameters": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "departmentId": 5
  },
  "format": "pdf"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "reportId": 9001,
    "downloadUrl": "https://...",
    "expiresAt": "2025-01-16T10:00:00Z"
  }
}
```

### Get Analytics KPIs
```http
GET /api/analytics/kpis?period=monthly&year=2025&month=1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hr": {
      "headcount": 450,
      "turnoverRate": 2.5,
      "averageAttendance": 96.5
    },
    "finance": {
      "revenue": 5000000.00,
      "expenses": 3500000.00,
      "profit": 1500000.00
    },
    "operations": {
      "purchaseOrders": 45,
      "assetsAcquired": 12,
      "maintenanceCompleted": 28
    }
  }
}
```

### Export Data
```http
POST /api/analytics/export
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "dataType": "employees",
  "format": "excel",
  "filters": {
    "departmentId": 5,
    "status": "active"
  }
}
```

---

## Dashboard APIs

### Get Dashboard Metrics
```http
GET /api/dashboard/metrics
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employees": {
      "total": 450,
      "active": 445,
      "onLeave": 12
    },
    "attendance": {
      "today": 425,
      "rate": 95.5
    },
    "leave": {
      "pending": 8,
      "approved": 12
    },
    "procurement": {
      "pendingRequests": 15,
      "activeOrders": 23
    },
    "visitors": {
      "today": 18,
      "checkedIn": 12
    },
    "incidents": {
      "thisMonth": 3,
      "open": 1
    }
  }
}
```

### Get Department Dashboard
```http
GET /api/dashboard/department/{departmentId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "departmentId": 5,
    "departmentName": "IT",
    "headcount": 45,
    "attendance": 43,
    "budget": {
      "allocated": 500000.00,
      "spent": 325000.00,
      "remaining": 175000.00
    },
    "projects": {
      "active": 8,
      "completed": 12
    },
    "assets": {
      "total": 120,
      "needsMaintenance": 5
    }
  }
}
```

---

## Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Application Error Codes
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Insufficient permissions
- `VAL_001` - Validation error
- `VAL_002` - Missing required field
- `BUS_001` - Business rule violation
- `BUS_002` - Insufficient balance
- `BUS_003` - Duplicate entry
- `SYS_001` - Database error
- `SYS_002` - External service error

### Error Response Format
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_001",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/auth/login"
}
```

---

## Rate Limiting
- **Default:** 100 requests per minute per user
- **Authentication endpoints:** 10 requests per minute per IP
- **File uploads:** 20 requests per hour per user

## Pagination
All list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

## Filtering & Sorting
- Use query parameters for filtering
- Use `sortBy` and `order` for sorting
- Example: `?sortBy=createdAt&order=desc`

## File Uploads
- Maximum file size: 10MB
- Supported formats: JPG, PNG, PDF, DOCX, XLSX
- Use `multipart/form-data` content type

---

**Last Updated:** January 2025
