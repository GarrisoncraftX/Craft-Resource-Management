# API Gateway Service

## Overview
The API Gateway serves as the central entry point for all client requests in the Craft Resource Management system. It handles JWT authentication, request routing to appropriate backend services, and user context injection.

## Port
**5003** (default)

## Key Responsibilities
- **JWT Token Validation**: Validates authentication tokens for protected routes
- **Request Routing**: Routes requests to Java, Node.js, or Python backends based on path prefixes
- **CORS Management**: Handles cross-origin requests from the frontend
- **User Context Injection**: Adds user metadata (userId, departmentId, roleId, permissions) to request headers
- **Multipart Form Data Handling**: Special handling for file uploads

## Technology Stack
- Node.js with Express.js
- JWT (jsonwebtoken)
- Axios for proxying requests
- Morgan for logging
- CORS middleware

## Prerequisites
- Node.js 14 or higher
- npm

## Installation

1. Navigate to the directory:
```bash
cd Backend/api-gateway
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file based on `.env.example`:
```env
PORT=5003
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:5173
JAVA_BACKEND_URL=http://localhost:5002
NODE_BACKEND_URL=http://localhost:5001
PYTHON_BACKEND_URL=http://localhost:5000
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

The API Gateway will start on `http://localhost:5003`.

## Routing Rules

### Java Backend (Port 5002)
Routes starting with:
- `/hr/employees` - Employee management
- `/hr/payroll` - Payroll processing
- `/hr/dashboard-kpis` - HR KPIs
- `/finance` - Financial operations
- `/assets` - Asset management
- `/legal` - Legal cases and compliance
- `/revenue` - Revenue and tax management
- `/system` - System administration
- `/admin` - Admin operations

### Node.js Backend (Port 5001)
Routes starting with:
- `/api/auth` - Authentication
- `/api/lookup` - Lookup data (departments, roles)
- `/api/leave` - Leave management
- `/api/procurement` - Procurement operations
- `/api/public-relations` - PR activities
- `/api/planning` - Project planning
- `/api/transportation` - Vehicle and trip management
- `/api/communication` - Internal communications

### Python Backend (Port 5000)
Routes starting with:
- `/api/biometric` - Biometric authentication
- `/api/visitors` - Visitor management
- `/api/dashboard` - Dashboard data
- `/api/health-safety` - Health and safety
- `/api/reports` - Report generation
- `/api/analytics` - Analytics data
- `/api/attendance` - Attendance tracking

## Public Routes (No Authentication Required)
- `/api/auth/signin`
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/request-password-reset`
- `/api/auth/confirm-password-reset`
- `/api/auth/verify-email`
- `/api/lookup`
- `/api/biometric/enroll`
- `/api/biometric/identify`
- `/api/leave`
- `/api/visitors/generate-token`
- `/api/visitors/validate-token`
- `/api/visitors/checkin`
- `/api/visitors/entry-pass`
- `/hr/employees/list`

## Authentication Flow

1. Client sends request with `Authorization: Bearer <token>` header
2. Gateway validates JWT token using `JWT_SECRET`
3. If valid, extracts user information (userId, departmentId, roleId, permissions)
4. Injects user context into request headers:
   - `x-user-id`
   - `x-department-id`
   - `x-role-id`
   - `x-permissions`
5. Proxies request to appropriate backend service
6. Returns response to client

## Error Handling
- **401 Unauthorized**: Missing or invalid JWT token
- **404 Not Found**: Route not found
- **500 Internal Server Error**: Proxy or server errors

## Logging
Uses Morgan middleware for HTTP request logging in combined format.

## Development

### Dependencies
```json
{
  "axios": "^1.10.0",
  "cors": "^2.8.5",
  "dotenv": "^17.0.1",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "morgan": "^1.10.0",
  "nodemon": "^3.1.10"
}
```

### Project Structure
```
api-gateway/
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (not in git)
├── .env.example       # Environment template
└── .gitignore         # Git ignore rules
```

## Monitoring
Monitor the gateway logs for:
- Request routing patterns
- Authentication failures
- Proxy errors
- Response times

## Security Considerations
- Keep `JWT_SECRET` secure and never commit to version control
- Regularly rotate JWT secrets
- Monitor for unusual authentication patterns
- Keep dependencies updated for security patches

## Troubleshooting

**Issue**: 401 Unauthorized errors
- Verify JWT_SECRET matches across all services
- Check token expiration
- Ensure Authorization header format is correct

**Issue**: 500 Proxy errors
- Verify backend services are running
- Check backend URLs in .env file
- Review backend service logs

**Issue**: CORS errors
- Verify FRONTEND_URL in .env matches your frontend URL
- Check CORS configuration in server.js

## Contributing
Contributions are welcome. Please ensure all routes are properly documented and tested before submitting pull requests.

## License
MIT License
