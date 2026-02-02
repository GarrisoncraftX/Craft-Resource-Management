# Java Backend Service

## Overview
Spring Boot 3.0 microservice handling HR, Finance, Asset Management, Legal, Revenue, and System Administration modules for the Craft Resource Management system.

## Port
**5002** (default)

## Modules & Responsibilities

### HR Module
- **Employee Management**: CRUD operations, provisioning, profile management
- **Payroll Processing**: Salary calculations, payslips, payroll runs
- **Attendance**: Attendance records and tracking
- **Benefits**: Employee benefits and benefit plans
- **Training**: Training courses and employee training records
- **Performance Reviews**: Employee performance evaluations
- **Dashboard KPIs**: HR metrics and analytics

### Finance Module
- **Chart of Accounts**: Account management and structure
- **Journal Entries**: Double-entry bookkeeping
- **Accounts Payable**: Vendor invoices and payments
- **Accounts Receivable**: Customer invoices and collections
- **Budgets**: Budget planning and tracking
- **Budget Requests**: Departmental budget requests
- **Invoice Numbering**: Sequential invoice generation
- **Accounting Integration**: Integration with accounting workflows

### Asset Module
- **Asset Management**: Asset registration, tracking, and lifecycle
- **Maintenance Records**: Scheduled and unscheduled maintenance
- **Disposal Records**: Asset disposal and write-offs

### Legal Module
- **Legal Cases**: Case management and tracking
- **Compliance Records**: Regulatory compliance documentation

### Revenue Module
- **Tax Assessments**: Tax calculation and assessment
- **Business Permits**: Permit issuance and renewal
- **Revenue Collection**: Revenue tracking and reporting

### System Module
- **Audit Logs**: System-wide audit trail
- **Notifications**: User notifications and alerts
- **Security Incidents**: Security event tracking
- **Support Tickets**: IT support and helpdesk
- **SOPs**: Standard Operating Procedures management
- **System Configuration**: Application settings
- **Access Rules**: Access control management
- **Guard Posts**: Physical security checkpoints
- **Active Sessions**: User session management

## Technology Stack
- **Spring Boot** 3.0.0
- **Spring Data JPA** - Database ORM
- **Spring Security** - Authentication and authorization
- **MySQL** - Database
- **Lombok** - Boilerplate reduction
- **Spring WebFlux** - Reactive HTTP client
- **Spring Retry** - Resilient operations
- **Spring AOP** - Aspect-oriented programming
- **Cloudinary** - Image/file storage
- **OpenAI Java SDK** - AI integration

## Prerequisites
- Java JDK 17 or higher
- Maven 3.6 or higher
- MySQL 8.0+

## Installation

1. Navigate to the directory:
```bash
cd Backend/java-backend
```

2. Configure database connection:
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/craft_resource_management
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
server.port=5002
```

3. Build the project:
```bash
mvn clean install
```

## Running the Service

**Using Maven**:
```bash
mvn spring-boot:run
```

**Using JAR**:
```bash
java -jar target/java-backend-0.0.1-SNAPSHOT.jar
```

The service will start on `http://localhost:5002`.

## API Endpoints

### HR Endpoints
- `GET /hr/employees` - List employees
- `POST /hr/employees` - Create employee
- `PUT /hr/employees/{id}` - Update employee
- `DELETE /hr/employees/{id}` - Delete employee
- `POST /hr/payroll/process` - Process payroll
- `GET /hr/payroll/runs` - Get payroll runs
- `GET /hr/dashboard-kpis` - Get HR KPIs

### Finance Endpoints
- `GET /finance/accounts` - Chart of accounts
- `POST /finance/journal-entries` - Create journal entry
- `GET /finance/accounts-payable` - List payables
- `POST /finance/accounts-payable` - Create payable
- `GET /finance/accounts-receivable` - List receivables
- `POST /finance/accounts-receivable` - Create receivable
- `GET /finance/budgets` - List budgets
- `POST /finance/budgets` - Create budget

### Asset Endpoints
- `GET /assets` - List assets
- `POST /assets` - Register asset
- `PUT /assets/{id}` - Update asset
- `POST /assets/{id}/maintenance` - Record maintenance
- `POST /assets/{id}/dispose` - Dispose asset

### Legal Endpoints
- `GET /legal/cases` - List legal cases
- `POST /legal/cases` - Create case
- `GET /legal/compliance` - Compliance records

### Revenue Endpoints
- `GET /revenue/collections` - Revenue collections
- `POST /revenue/collections` - Record collection
- `GET /revenue/permits` - Business permits
- `POST /revenue/assessments` - Tax assessments

### System Endpoints
- `GET /system/audit-logs` - Audit trail
- `GET /system/notifications` - User notifications
- `POST /system/support-tickets` - Create ticket
- `GET /system/config` - System configuration
- `GET /admin/sessions` - Active sessions

## Project Structure
```
java-backend/
├── src/
│   ├── main/
│   │   ├── java/com/craftresourcemanagement/
│   │   │   ├── asset/              # Asset management
│   │   │   ├── config/             # Security & app config
│   │   │   ├── finance/            # Finance operations
│   │   │   ├── hr/                 # HR management
│   │   │   ├── legal/              # Legal module
│   │   │   ├── revenue/            # Revenue management
│   │   │   ├── security/           # Security filters
│   │   │   ├── system/             # System administration
│   │   │   ├── utils/              # Utilities
│   │   │   └── JavaBackendApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/                       # Unit tests
├── pom.xml                         # Maven configuration
└── README.md
```

## Configuration

### Application Properties
Key configuration options in `application.properties`:
```properties
# Server
server.port=5002

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/craft_resource_management
spring.datasource.username=root
spring.datasource.password=yourpassword

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Security
jwt.secret=your-jwt-secret

# Cloudinary (for file uploads)
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret

# OpenAI (optional)
openai.api-key=your-openai-key
```

## Testing

Run unit tests:
```bash
mvn test
```

Run with coverage:
```bash
mvn test jacoco:report
```

## Key Features

### Security
- Spring Security integration
- JWT token validation via API Gateway
- User context extraction from headers
- Role-based access control

### Audit Logging
- Automatic audit trail for critical operations
- Retry mechanism for resilient logging
- Async processing for performance

### File Management
- Cloudinary integration for image/document storage
- Employee photo uploads
- Document attachments

### AI Integration
- OpenAI integration for intelligent features
- Configurable AI client with error handling

## Development

### Hot Reload
Spring DevTools is included for automatic restart during development.

### Lombok
Uses Lombok annotations to reduce boilerplate:
- `@Data` - Getters, setters, toString, equals, hashCode
- `@Entity` - JPA entities
- `@Service`, `@Repository`, `@Controller` - Spring components

## Database Schema
The service manages the following main entities:
- Users, Attendance, PayrollRun, Payslip, BenefitPlan, EmployeeBenefit
- ChartOfAccount, JournalEntry, AccountPayable, AccountReceivable, Budget
- Asset, MaintenanceRecord, DisposalRecord
- LegalCase, ComplianceRecord
- TaxAssessment, BusinessPermit, RevenueCollection
- AuditLog, Notification, SupportTicket, SystemConfig, ActiveSession

## Troubleshooting

**Issue**: Database connection errors
- Verify MySQL is running
- Check credentials in application.properties
- Ensure database exists

**Issue**: Port already in use
- Change port in application.properties
- Kill process using port 5002

**Issue**: Lombok not working in IDE
- Install Lombok plugin for your IDE
- Enable annotation processing

## Contributing
1. Follow Spring Boot best practices
2. Write unit tests for new features
3. Use proper exception handling
4. Document API endpoints
5. Follow existing code structure

## License
MIT License
