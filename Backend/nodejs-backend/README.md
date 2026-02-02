# Node.js Backend Service

## Overview
Express.js microservice handling Authentication, Leave Management, Procurement, Public Relations, Planning, Transportation, and Communication modules for the Craft Resource Management system.

## Port
**5001** (default)

## Modules & Responsibilities

### Authentication Module
- **User Registration**: New user signup with email verification
- **Login/Signin**: JWT-based authentication
- **Password Reset**: Request and confirm password reset
- **Email Verification**: Account activation via email
- **Token Management**: JWT generation and validation
- **Role & Permission Management**: RBAC system

### Leave Management Module
- **Leave Requests**: Submit and manage leave applications
- **Leave Approvals**: Supervisor approval workflow
- **Leave Balances**: Track available leave days
- **Leave Types**: Annual, sick, emergency, etc.
- **Leave History**: Historical leave records

### Procurement Module
- **Purchase Requests**: Requisition creation and tracking
- **Vendor Management**: Vendor registration and profiles
- **Purchase Orders**: PO generation and management
- **Quotations**: Vendor quotation comparison
- **Procurement Workflow**: Multi-level approval process

### Public Relations Module
- **Press Releases**: Create and publish press releases
- **Media Contacts**: Manage media relationships
- **Events**: PR event planning and tracking
- **Publications**: Public communications management

### Planning Module
- **Projects**: Project creation and management
- **Milestones**: Project milestone tracking
- **Resource Allocation**: Resource planning and assignment
- **Timelines**: Project scheduling
- **Progress Tracking**: Project status monitoring

### Transportation Module
- **Vehicle Management**: Fleet registration and tracking
- **Trip Scheduling**: Trip planning and assignment
- **Driver Management**: Driver profiles and assignments
- **Maintenance Tracking**: Vehicle maintenance records
- **Fuel Management**: Fuel consumption tracking

### Communication Module
- **Internal Messaging**: Employee-to-employee communication
- **Announcements**: Organization-wide announcements
- **Notifications**: System notifications
- **Broadcast Messages**: Department or role-based messaging

### Lookup Module
- **Departments**: Department data
- **Roles**: User roles and permissions
- **Reference Data**: System-wide lookup tables

## Technology Stack
- **Express.js** 4.18 - Web framework
- **Sequelize** 6.37 - ORM for MySQL
- **MySQL2** - Database driver
- **JWT** (jsonwebtoken) - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Request validation
- **Multer** - File upload handling
- **Cloudinary** - Cloud file storage
- **Nodemailer** - Email sending
- **Twilio** - SMS notifications
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Jest** - Testing framework

## Prerequisites
- Node.js 16 or higher
- npm 8 or higher
- MySQL 8.0+

## Installation

1. Navigate to the directory:
```bash
cd Backend/nodejs-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file based on `.env.example`:
```env
# Server
PORT=5001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=craft_resource_management

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Running the Service

**Production mode**:
```bash
npm start
```

**Development mode** (with auto-restart):
```bash
npm run dev
```

The service will start on `http://localhost:5001`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/signin` - User signin (alias)
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/confirm-password-reset` - Confirm password reset
- `POST /api/auth/verify-email` - Verify email address

### Leave Management
- `GET /api/leave/requests` - List leave requests
- `POST /api/leave/requests` - Create leave request
- `PUT /api/leave/requests/{id}` - Update leave request
- `POST /api/leave/requests/{id}/approve` - Approve leave
- `POST /api/leave/requests/{id}/reject` - Reject leave
- `GET /api/leave/balance` - Get leave balance

### Procurement
- `GET /api/procurement/requests` - List purchase requests
- `POST /api/procurement/requests` - Create purchase request
- `GET /api/procurement/vendors` - List vendors
- `POST /api/procurement/vendors` - Register vendor
- `POST /api/procurement/purchase-orders` - Create PO

### Public Relations
- `GET /api/public-relations/press-releases` - List press releases
- `POST /api/public-relations/press-releases` - Create press release
- `GET /api/public-relations/events` - List PR events
- `POST /api/public-relations/events` - Create event

### Planning
- `GET /api/planning/projects` - List projects
- `POST /api/planning/projects` - Create project
- `PUT /api/planning/projects/{id}` - Update project
- `POST /api/planning/projects/{id}/milestones` - Add milestone

### Transportation
- `GET /api/transportation/vehicles` - List vehicles
- `POST /api/transportation/vehicles` - Register vehicle
- `GET /api/transportation/trips` - List trips
- `POST /api/transportation/trips` - Schedule trip

### Communication
- `POST /api/communication/messages` - Send message
- `GET /api/communication/messages` - Get messages
- `POST /api/communication/announcements` - Create announcement
- `GET /api/communication/announcements` - List announcements

### Lookup
- `GET /api/lookup` - Get all lookup data
- `GET /departments` - List departments
- `GET /roles` - List roles

## Project Structure
```
nodejs-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Database config
│   │   └── sequelize.js     # Sequelize setup
│   ├── database/            # Database connection
│   │   └── connection.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # Authentication
│   │   ├── errorHandler.js  # Error handling
│   │   ├── jwtVerification.js
│   │   ├── rbacAuthorization.js
│   │   ├── requestLogger.js
│   │   ├── sessionTracker.js
│   │   └── validation.js
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── communication/   # Communication
│   │   ├── leave/           # Leave management
│   │   ├── lookup/          # Lookup data
│   │   ├── planning/        # Planning
│   │   ├── procurement/     # Procurement
│   │   ├── publicRelations/ # Public relations
│   │   └── transportation/  # Transportation
│   ├── utils/               # Utilities
│   │   ├── cloudinary.js    # File upload
│   │   ├── logger.js        # Winston logger
│   │   └── validators.js    # Validation helpers
│   └── logs/                # Log files
├── test/                    # Test files
├── uploads/                 # Temporary file uploads
├── server.js                # Application entry point
├── package.json             # Dependencies
├── jest.config.js           # Jest configuration
└── README.md
```

## Module Structure
Each module follows a consistent structure:
```
module/
├── controller.js    # Request handlers
├── model.js         # Sequelize models
├── routes.js        # Express routes
└── service.js       # Business logic
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Key Features

### Security
- JWT-based authentication
- Bcrypt password hashing
- Helmet for security headers
- Rate limiting to prevent abuse
- CORS configuration
- Input validation with Joi

### Logging
- Winston logger with file and console transports
- Request logging middleware
- Error logging
- Separate log files for errors and combined logs

### File Uploads
- Multer for handling multipart/form-data
- Cloudinary integration for cloud storage
- Image optimization with Sharp

### Email & SMS
- Nodemailer for email notifications
- Twilio for SMS notifications
- Email templates for various events

### Session Management
- Active session tracking
- Session cleanup thread
- User context management

### Error Handling
- Centralized error handling middleware
- Consistent error response format
- Detailed error logging

## Database Models
Key Sequelize models:
- User, Role, Permission, RolePermission
- LeaveRequest, LeaveBalance, LeaveType
- PurchaseRequest, Vendor, PurchaseOrder
- PressRelease, MediaContact, PREvent
- Project, Milestone, ResourceAllocation
- Vehicle, Trip, Driver
- Message, Announcement, Notification

## Development

### Linting
```bash
npm run lint
npm run lint:fix
```

### Database Migrations
```bash
npm run migrate
```

### Database Seeding
```bash
npm run seed
```

## Environment Variables
All required environment variables are documented in `.env.example`. Never commit `.env` to version control.

## Troubleshooting

**Issue**: Database connection errors
- Verify MySQL is running
- Check credentials in .env
- Ensure database exists

**Issue**: Email not sending
- Verify SMTP credentials
- Check email provider settings
- Enable "Less secure app access" for Gmail

**Issue**: File upload errors
- Check Cloudinary credentials
- Verify upload directory permissions
- Check file size limits

**Issue**: JWT errors
- Ensure JWT_SECRET matches across services
- Check token expiration settings

## Performance Optimization
- Connection pooling for database
- Compression middleware for responses
- Async/await for non-blocking operations
- Caching with appropriate strategies

## Contributing
1. Follow the existing module structure
2. Write tests for new features
3. Use Joi for input validation
4. Follow ESLint rules
5. Document API endpoints
6. Handle errors properly

## License
MIT License
