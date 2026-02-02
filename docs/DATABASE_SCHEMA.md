# Database Schema Documentation
# Craft Resource Management System

**Database:** MySQL 8.0  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci

---

## Table of Contents
1. [Authentication & User Management](#authentication--user-management)
2. [HR Module Tables](#hr-module-tables)
3. [Finance Module Tables](#finance-module-tables)
4. [Asset Module Tables](#asset-module-tables)
5. [Leave Module Tables](#leave-module-tables)
6. [Procurement Module Tables](#procurement-module-tables)
7. [Visitor Module Tables](#visitor-module-tables)
8. [Health & Safety Tables](#health--safety-tables)
9. [System Tables](#system-tables)
10. [Relationships](#relationships)

---

## Authentication & User Management

### users
Primary user authentication table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| username | VARCHAR(100) | UNIQUE | Username for login |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| phone | VARCHAR(20) | | Phone number |
| role_id | INT | FOREIGN KEY | Reference to roles table |
| department_id | INT | FOREIGN KEY | Reference to departments table |
| status | ENUM | NOT NULL | active, inactive, suspended |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| last_login | DATETIME | | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- PRIMARY KEY (user_id)
- UNIQUE KEY (email)
- INDEX (role_id)
- INDEX (department_id)

### roles
User roles for RBAC.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| role_name | VARCHAR(100) | UNIQUE, NOT NULL | |
| description | TEXT | | |
| is_system_role | BOOLEAN | DEFAULT FALSE | |
| created_at | TIMESTAMP | | |

### permissions
System permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| permission_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| permission_name | VARCHAR(100) | UNIQUE, NOT NULL | |
| module | VARCHAR(50) | NOT NULL | |
| action | VARCHAR(50) | NOT NULL | |
| description | TEXT | | |

### role_permissions
Maps roles to permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_permission_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| role_id | INT | FOREIGN KEY, NOT NULL | |
| permission_id | INT | FOREIGN KEY, NOT NULL | |
| created_at | TIMESTAMP | | |

---

## HR Module Tables

### employees
Employee master data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| employee_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| user_id | INT | FOREIGN KEY, UNIQUE | Link to users table |
| employee_number | VARCHAR(50) | UNIQUE, NOT NULL | |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| phone | VARCHAR(20) | | |
| date_of_birth | DATE | | |
| gender | ENUM | | male, female, other |
| address | TEXT | | |
| city | VARCHAR(100) | | |
| state | VARCHAR(100) | | |
| postal_code | VARCHAR(20) | | |
| country | VARCHAR(100) | | |
| department_id | INT | FOREIGN KEY | |
| position_id | INT | FOREIGN KEY | |
| hire_date | DATE | NOT NULL | |
| employment_type | ENUM | | full-time, part-time, contract |
| status | ENUM | NOT NULL | active, inactive, terminated |
| salary | DECIMAL(15,2) | | |
| bank_account | VARCHAR(50) | | |
| tax_id | VARCHAR(50) | | |
| emergency_contact_name | VARCHAR(200) | | |
| emergency_contact_phone | VARCHAR(20) | | |
| emergency_contact_relationship | VARCHAR(50) | | |
| photo_url | VARCHAR(500) | | |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |
| created_by | INT | FOREIGN KEY | |
| updated_by | INT | FOREIGN KEY | |

### departments
Organizational departments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| department_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| department_name | VARCHAR(200) | UNIQUE, NOT NULL | |
| department_code | VARCHAR(20) | UNIQUE | |
| parent_department_id | INT | FOREIGN KEY | |
| manager_id | INT | FOREIGN KEY | |
| budget | DECIMAL(15,2) | | |
| status | ENUM | | active, inactive |
| created_at | TIMESTAMP | | |

### positions
Job positions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| position_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| position_title | VARCHAR(200) | NOT NULL | |
| position_code | VARCHAR(20) | UNIQUE | |
| department_id | INT | FOREIGN KEY | |
| grade_level | INT | | |
| min_salary | DECIMAL(15,2) | | |
| max_salary | DECIMAL(15,2) | | |
| description | TEXT | | |
| status | ENUM | | active, inactive |
| created_at | TIMESTAMP | | |

### attendance
Employee attendance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| attendance_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| employee_id | INT | FOREIGN KEY, NOT NULL | |
| date | DATE | NOT NULL | |
| check_in | TIME | | |
| check_out | TIME | | |
| work_hours | DECIMAL(5,2) | | |
| overtime_hours | DECIMAL(5,2) | | |
| status | ENUM | NOT NULL | present, absent, late, half-day |
| notes | TEXT | | |
| created_at | TIMESTAMP | | |

**Indexes:**
- UNIQUE KEY (employee_id, date)

### payroll_runs
Payroll processing batches.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| payroll_run_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| run_number | VARCHAR(50) | UNIQUE, NOT NULL | |
| pay_period_start | DATE | NOT NULL | |
| pay_period_end | DATE | NOT NULL | |
| payment_date | DATE | NOT NULL | |
| department_id | INT | FOREIGN KEY | |
| total_employees | INT | | |
| total_amount | DECIMAL(15,2) | | |
| status | ENUM | NOT NULL | draft, processed, paid |
| processed_by | INT | FOREIGN KEY | |
| processed_at | TIMESTAMP | | |
| created_at | TIMESTAMP | | |

### payslips
Individual employee payslips.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| payslip_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| payroll_run_id | INT | FOREIGN KEY, NOT NULL | |
| employee_id | INT | FOREIGN KEY, NOT NULL | |
| basic_salary | DECIMAL(15,2) | NOT NULL | |
| allowances | DECIMAL(15,2) | DEFAULT 0 | |
| gross_pay | DECIMAL(15,2) | NOT NULL | |
| tax_deduction | DECIMAL(15,2) | DEFAULT 0 | |
| insurance_deduction | DECIMAL(15,2) | DEFAULT 0 | |
| pension_deduction | DECIMAL(15,2) | DEFAULT 0 | |
| other_deductions | DECIMAL(15,2) | DEFAULT 0 | |
| total_deductions | DECIMAL(15,2) | NOT NULL | |
| net_pay | DECIMAL(15,2) | NOT NULL | |
| payment_status | ENUM | | pending, paid |
| created_at | TIMESTAMP | | |

### benefit_plans
Employee benefit plans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| benefit_plan_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| plan_name | VARCHAR(200) | NOT NULL | |
| plan_type | VARCHAR(100) | | health, pension, insurance |
| description | TEXT | | |
| provider | VARCHAR(200) | | |
| cost | DECIMAL(15,2) | | |
| status | ENUM | | active, inactive |
| created_at | TIMESTAMP | | |

### employee_benefits
Employee benefit enrollments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| employee_benefit_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| employee_id | INT | FOREIGN KEY, NOT NULL | |
| benefit_plan_id | INT | FOREIGN KEY, NOT NULL | |
| enrollment_date | DATE | NOT NULL | |
| effective_date | DATE | NOT NULL | |
| termination_date | DATE | | |
| status | ENUM | | active, terminated |
| created_at | TIMESTAMP | | |

### training_courses
Training courses catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| course_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| course_name | VARCHAR(200) | NOT NULL | |
| course_code | VARCHAR(50) | UNIQUE | |
| description | TEXT | | |
| duration_hours | INT | | |
| provider | VARCHAR(200) | | |
| cost | DECIMAL(15,2) | | |
| status | ENUM | | active, inactive |
| created_at | TIMESTAMP | | |

### employee_training
Employee training records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| training_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| employee_id | INT | FOREIGN KEY, NOT NULL | |
| course_id | INT | FOREIGN KEY, NOT NULL | |
| training_date | DATE | NOT NULL | |
| completion_date | DATE | | |
| status | ENUM | | scheduled, completed, cancelled |
| score | DECIMAL(5,2) | | |
| certificate_url | VARCHAR(500) | | |
| created_at | TIMESTAMP | | |

### performance_reviews
Employee performance evaluations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| review_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| employee_id | INT | FOREIGN KEY, NOT NULL | |
| reviewer_id | INT | FOREIGN KEY, NOT NULL | |
| review_period_start | DATE | NOT NULL | |
| review_period_end | DATE | NOT NULL | |
| review_date | DATE | NOT NULL | |
| overall_rating | DECIMAL(3,2) | | |
| strengths | TEXT | | |
| areas_for_improvement | TEXT | | |
| goals | TEXT | | |
| comments | TEXT | | |
| status | ENUM | | draft, submitted, approved |
| created_at | TIMESTAMP | | |

---

## Finance Module Tables

### chart_of_accounts
Financial accounts structure.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| account_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| account_code | VARCHAR(50) | UNIQUE, NOT NULL | |
| account_name | VARCHAR(200) | NOT NULL | |
| account_type | ENUM | NOT NULL | asset, liability, equity, revenue, expense |
| parent_account_id | INT | FOREIGN KEY | |
| balance | DECIMAL(15,2) | DEFAULT 0 | |
| status | ENUM | | active, inactive |
| created_at | TIMESTAMP | | |

### journal_entries
Financial journal entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| journal_entry_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| entry_number | VARCHAR(50) | UNIQUE, NOT NULL | |
| entry_date | DATE | NOT NULL | |
| description | TEXT | NOT NULL | |
| reference | VARCHAR(100) | | |
| total_debit | DECIMAL(15,2) | NOT NULL | |
| total_credit | DECIMAL(15,2) | NOT NULL | |
| status | ENUM | NOT NULL | draft, posted, reversed |
| posted_by | INT | FOREIGN KEY | |
| posted_at | TIMESTAMP | | |
| created_at | TIMESTAMP | | |
| created_by | INT | FOREIGN KEY | |

### journal_entry_lines
Journal entry line items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| line_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| journal_entry_id | INT | FOREIGN KEY, NOT NULL | |
| account_id | INT | FOREIGN KEY, NOT NULL | |
| debit | DECIMAL(15,2) | DEFAULT 0 | |
| credit | DECIMAL(15,2) | DEFAULT 0 | |
| description | TEXT | | |
| created_at | TIMESTAMP | | |

### budgets
Budget allocations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| budget_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| fiscal_year | INT | NOT NULL | |
| department_id | INT | FOREIGN KEY | |
| account_id | INT | FOREIGN KEY, NOT NULL | |
| budget_amount | DECIMAL(15,2) | NOT NULL | |
| spent_amount | DECIMAL(15,2) | DEFAULT 0 | |
| period | ENUM | | annual, quarterly, monthly |
| status | ENUM | | draft, approved, active |
| created_at | TIMESTAMP | | |
| created_by | INT | FOREIGN KEY | |

### accounts_payable
Vendor payables.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| payable_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| vendor_id | INT | FOREIGN KEY, NOT NULL | |
| invoice_number | VARCHAR(100) | NOT NULL | |
| invoice_date | DATE | NOT NULL | |
| due_date | DATE | NOT NULL | |
| amount | DECIMAL(15,2) | NOT NULL | |
| paid_amount | DECIMAL(15,2) | DEFAULT 0 | |
| balance | DECIMAL(15,2) | NOT NULL | |
| description | TEXT | | |
| status | ENUM | NOT NULL | pending, partial, paid |
| created_at | TIMESTAMP | | |

### accounts_receivable
Customer receivables.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| receivable_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| customer_id | INT | FOREIGN KEY | |
| invoice_number | VARCHAR(100) | UNIQUE, NOT NULL | |
| invoice_date | DATE | NOT NULL | |
| due_date | DATE | NOT NULL | |
| amount | DECIMAL(15,2) | NOT NULL | |
| received_amount | DECIMAL(15,2) | DEFAULT 0 | |
| balance | DECIMAL(15,2) | NOT NULL | |
| description | TEXT | | |
| status | ENUM | NOT NULL | pending, partial, paid |
| created_at | TIMESTAMP | | |

---

## Asset Module Tables

### assets
Asset registry.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| asset_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| asset_tag | VARCHAR(50) | UNIQUE, NOT NULL | |
| asset_name | VARCHAR(200) | NOT NULL | |
| category | VARCHAR(100) | | |
| serial_number | VARCHAR(100) | | |
| purchase_date | DATE | | |
| purchase_price | DECIMAL(15,2) | | |
| current_value | DECIMAL(15,2) | | |
| depreciation_rate | DECIMAL(5,2) | | |
| supplier_id | INT | FOREIGN KEY | |
| location | VARCHAR(200) | | |
| custodian_id | INT | FOREIGN KEY | |
| warranty_expiry | DATE | | |
| status | ENUM | NOT NULL | active, maintenance, disposed |
| condition | ENUM | | excellent, good, fair, poor |
| created_at | TIMESTAMP | | |

### maintenance_records
Asset maintenance history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| maintenance_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| asset_id | INT | FOREIGN KEY, NOT NULL | |
| maintenance_date | DATE | NOT NULL | |
| maintenance_type | ENUM | | preventive, corrective, emergency |
| description | TEXT | NOT NULL | |
| cost | DECIMAL(15,2) | | |
| performed_by | VARCHAR(200) | | |
| next_maintenance_date | DATE | | |
| created_at | TIMESTAMP | | |

### disposal_records
Asset disposal records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| disposal_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| asset_id | INT | FOREIGN KEY, NOT NULL | |
| disposal_date | DATE | NOT NULL | |
| disposal_method | ENUM | | sale, donation, scrap, transfer |
| disposal_value | DECIMAL(15,2) | | |
| reason | TEXT | | |
| approved_by | INT | FOREIGN KEY | |
| created_at | TIMESTAMP | | |

---

## Leave Module Tables

### leave_types
Leave type definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| leave_type_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| leave_type_name | VARCHAR(100) | NOT NULL | |
| description | TEXT | | |
| days_per_year | INT | | |
| carry_forward | BOOLEAN | DEFAULT FALSE | |
| requires_approval | BOOLEAN | DEFAULT TRUE | |
| status | ENUM | | active, inactive |
| created_at | TIMESTAMP | | |

### leave_requests
Leave applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| leave_request_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| employee_id | INT | FOREIGN KEY, NOT NULL | |
| leave_type_id | INT | FOREIGN KEY, NOT NULL | |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NOT NULL | |
| days | INT | NOT NULL | |
| reason | TEXT | | |
| contact_during_leave | VARCHAR(100) | | |
| status | ENUM | NOT NULL | pending, approved, rejected, cancelled |
| approver_id | INT | FOREIGN KEY | |
| approver_comments | TEXT | | |
| approved_at | TIMESTAMP | | |
| submitted_at | TIMESTAMP | | |
| created_at | TIMESTAMP | | |

### leave_balances
Employee leave balances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| balance_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| employee_id | INT | FOREIGN KEY, NOT NULL | |
| leave_type_id | INT | FOREIGN KEY, NOT NULL | |
| year | INT | NOT NULL | |
| entitled | INT | NOT NULL | |
| used | INT | DEFAULT 0 | |
| pending | INT | DEFAULT 0 | |
| available | INT | NOT NULL | |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

**Indexes:**
- UNIQUE KEY (employee_id, leave_type_id, year)

---

## Procurement Module Tables

### vendors
Vendor registry.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vendor_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| vendor_name | VARCHAR(200) | NOT NULL | |
| vendor_code | VARCHAR(50) | UNIQUE | |
| category | VARCHAR(100) | | |
| contact_person | VARCHAR(200) | | |
| email | VARCHAR(255) | | |
| phone | VARCHAR(20) | | |
| address | TEXT | | |
| tax_id | VARCHAR(50) | | |
| rating | DECIMAL(3,2) | | |
| status | ENUM | | active, inactive, blacklisted |
| created_at | TIMESTAMP | | |

### purchase_requests
Purchase requisitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| request_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| request_number | VARCHAR(50) | UNIQUE, NOT NULL | |
| requester_id | INT | FOREIGN KEY, NOT NULL | |
| department_id | INT | FOREIGN KEY | |
| request_date | DATE | NOT NULL | |
| required_date | DATE | | |
| justification | TEXT | | |
| total_amount | DECIMAL(15,2) | | |
| status | ENUM | NOT NULL | draft, pending, approved, rejected |
| approved_by | INT | FOREIGN KEY | |
| approved_at | TIMESTAMP | | |
| created_at | TIMESTAMP | | |

### purchase_request_items
Purchase request line items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| item_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| request_id | INT | FOREIGN KEY, NOT NULL | |
| description | TEXT | NOT NULL | |
| quantity | INT | NOT NULL | |
| unit_price | DECIMAL(15,2) | | |
| amount | DECIMAL(15,2) | | |
| specifications | TEXT | | |
| created_at | TIMESTAMP | | |

### purchase_orders
Purchase orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| po_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| po_number | VARCHAR(50) | UNIQUE, NOT NULL | |
| request_id | INT | FOREIGN KEY | |
| vendor_id | INT | FOREIGN KEY, NOT NULL | |
| order_date | DATE | NOT NULL | |
| delivery_date | DATE | | |
| payment_terms | VARCHAR(100) | | |
| total_amount | DECIMAL(15,2) | NOT NULL | |
| status | ENUM | NOT NULL | pending, confirmed, delivered, cancelled |
| created_by | INT | FOREIGN KEY | |
| created_at | TIMESTAMP | | |

---

## Visitor Module Tables

### visitors
Visitor registry.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| visitor_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| visitor_name | VARCHAR(200) | NOT NULL | |
| visitor_email | VARCHAR(255) | | |
| visitor_phone | VARCHAR(20) | | |
| id_type | VARCHAR(50) | | |
| id_number | VARCHAR(100) | | |
| company | VARCHAR(200) | | |
| created_at | TIMESTAMP | | |

### visitor_tokens
Pre-registration tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| token_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| token | VARCHAR(100) | UNIQUE, NOT NULL | |
| visitor_id | INT | FOREIGN KEY | |
| host_employee_id | INT | FOREIGN KEY, NOT NULL | |
| visit_purpose | TEXT | | |
| visit_date | DATE | NOT NULL | |
| expected_arrival | TIME | | |
| expected_departure | TIME | | |
| status | ENUM | | pending, used, expired, cancelled |
| created_at | TIMESTAMP | | |
| expires_at | TIMESTAMP | | |

### visitor_logs
Visitor check-in/out records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| visitor_id | INT | FOREIGN KEY, NOT NULL | |
| token_id | INT | FOREIGN KEY | |
| check_in_time | TIMESTAMP | NOT NULL | |
| check_out_time | TIMESTAMP | | |
| photo_url | VARCHAR(500) | | |
| entry_pass_url | VARCHAR(500) | | |
| host_employee_id | INT | FOREIGN KEY | |
| visit_purpose | TEXT | | |
| created_at | TIMESTAMP | | |

---

## Health & Safety Tables

### safety_incidents
Safety incident reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| incident_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| incident_number | VARCHAR(50) | UNIQUE, NOT NULL | |
| incident_date | DATE | NOT NULL | |
| incident_time | TIME | | |
| location | VARCHAR(200) | | |
| incident_type | ENUM | | injury, near_miss, property_damage |
| severity | ENUM | | minor, moderate, severe, critical |
| description | TEXT | NOT NULL | |
| injured_person_id | INT | FOREIGN KEY | |
| reported_by | INT | FOREIGN KEY, NOT NULL | |
| immediate_action | TEXT | | |
| status | ENUM | | reported, under_investigation, closed |
| created_at | TIMESTAMP | | |

### safety_inspections
Safety inspection records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| inspection_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| inspection_date | DATE | NOT NULL | |
| inspection_type | ENUM | | routine, special, follow_up |
| area | VARCHAR(200) | | |
| inspector_id | INT | FOREIGN KEY, NOT NULL | |
| overall_status | ENUM | | compliant, non_compliant, needs_improvement |
| findings | TEXT | | |
| recommendations | TEXT | | |
| created_at | TIMESTAMP | | |

### safety_training
Safety training records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| training_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| employee_id | INT | FOREIGN KEY, NOT NULL | |
| training_type | VARCHAR(100) | NOT NULL | |
| training_date | DATE | NOT NULL | |
| expiry_date | DATE | | |
| trainer | VARCHAR(200) | | |
| status | ENUM | | completed, expired |
| certificate_url | VARCHAR(500) | | |
| created_at | TIMESTAMP | | |

---

## System Tables

### audit_logs
System audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | |
| user_id | INT | FOREIGN KEY | |
| action | VARCHAR(100) | NOT NULL | |
| module | VARCHAR(50) | NOT NULL | |
| entity_type | VARCHAR(100) | | |
| entity_id | INT | | |
| old_values | JSON | | |
| new_values | JSON | | |
| ip_address | VARCHAR(45) | | |
| user_agent | VARCHAR(500) | | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- INDEX (user_id)
- INDEX (module)
- INDEX (created_at)

### notifications
User notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| user_id | INT | FOREIGN KEY, NOT NULL | |
| title | VARCHAR(200) | NOT NULL | |
| message | TEXT | NOT NULL | |
| type | ENUM | | info, warning, error, success |
| is_read | BOOLEAN | DEFAULT FALSE | |
| link | VARCHAR(500) | | |
| created_at | TIMESTAMP | | |

### system_config
System configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| config_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| config_key | VARCHAR(100) | UNIQUE, NOT NULL | |
| config_value | TEXT | | |
| description | TEXT | | |
| updated_at | TIMESTAMP | | |
| updated_by | INT | FOREIGN KEY | |

### active_sessions
Active user sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| session_id | INT | PRIMARY KEY, AUTO_INCREMENT | |
| user_id | INT | FOREIGN KEY, NOT NULL | |
| token | VARCHAR(500) | UNIQUE, NOT NULL | |
| ip_address | VARCHAR(45) | | |
| user_agent | VARCHAR(500) | | |
| last_activity | TIMESTAMP | | |
| expires_at | TIMESTAMP | | |
| created_at | TIMESTAMP | | |

---

## Relationships

### Key Foreign Key Relationships

**Users & Employees:**
- users.user_id → employees.user_id (1:1)
- users.role_id → roles.role_id (N:1)
- users.department_id → departments.department_id (N:1)

**HR Relationships:**
- employees.department_id → departments.department_id (N:1)
- employees.position_id → positions.position_id (N:1)
- attendance.employee_id → employees.employee_id (N:1)
- payslips.employee_id → employees.employee_id (N:1)
- payslips.payroll_run_id → payroll_runs.payroll_run_id (N:1)

**Finance Relationships:**
- journal_entry_lines.journal_entry_id → journal_entries.journal_entry_id (N:1)
- journal_entry_lines.account_id → chart_of_accounts.account_id (N:1)
- budgets.department_id → departments.department_id (N:1)
- budgets.account_id → chart_of_accounts.account_id (N:1)

**Leave Relationships:**
- leave_requests.employee_id → employees.employee_id (N:1)
- leave_requests.leave_type_id → leave_types.leave_type_id (N:1)
- leave_balances.employee_id → employees.employee_id (N:1)
- leave_balances.leave_type_id → leave_types.leave_type_id (N:1)

**Procurement Relationships:**
- purchase_requests.requester_id → users.user_id (N:1)
- purchase_request_items.request_id → purchase_requests.request_id (N:1)
- purchase_orders.vendor_id → vendors.vendor_id (N:1)
- purchase_orders.request_id → purchase_requests.request_id (N:1)

---

**Last Updated:** January 2025
