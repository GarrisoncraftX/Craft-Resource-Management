# Craft Resource Management System

A comprehensive enterprise resource management system built with a microservices architecture, featuring HR management, finance, asset tracking, biometric authentication, visitor management, and more.

## System Architecture

This system follows a microservices architecture with three specialized backend services and a unified frontend:

- **API Gateway** - Central routing and authentication layer
- **Java Backend** - HR, Finance, Assets, Legal, Revenue, and System Administration
- **Node.js Backend** - Authentication, Leave Management, Procurement, Planning, Transportation, and Communication
- **Python Backend** - Biometric Authentication, Visitor Management, Health & Safety, Reports & Analytics, and Dashboard
- **React Frontend** - Modern web interface built with React 18, TypeScript, and Tailwind CSS

## Technology Stack

### Backend Services
- **Java**: Spring Boot 3.0, Spring Data JPA, Spring Security, MySQL
- **Node.js**: Express.js, Sequelize ORM, JWT, MySQL
- **Python**: Flask, SQLAlchemy, Flask-JWT-Extended, MySQL
- **API Gateway**: Express.js, JWT validation, request routing

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **React Router** for navigation

### Database
- **MySQL** - Shared database across all services

## Project Structure

```
CraftResourceManagement/
├── Backend/
│   ├── api-gateway/          # Central API gateway and routing
│   ├── java-backend/         # Spring Boot service
│   ├── nodejs-backend/       # Express.js service
│   ├── python-backend/       # Flask service
│   └── scripts/              # Database scripts
└── Frontend/                 # React TypeScript application
```

## Prerequisites

- **Node.js** 16+ (for API Gateway, Node.js backend, and Frontend)
- **Java JDK** 17+ (for Java backend)
- **Python** 3.9+ (for Python backend)
- **MySQL** 8.0+
- **Maven** 3.6+ (for Java backend)
- **npm** or **yarn** (for Node.js projects)

## Quick Start

### 1. Database Setup
```bash
# Create database and run migrations
mysql -u root -p < Backend/scripts/fulldatabase.sql
```

### 2. Configure Environment Variables
Each backend service requires a `.env` file. Use the `.env.example` files as templates:
- `Backend/api-gateway/.env`
- `Backend/java-backend/.env` (or application.properties)
- `Backend/nodejs-backend/.env`
- `Backend/python-backend/.env`
- `Frontend/.env`

### 3. Start Backend Services

**API Gateway** (Port 5003):
```bash
cd Backend/api-gateway
npm install
npm start
```

**Java Backend** (Port 5002):
```bash
cd Backend/java-backend
mvn clean install
mvn spring-boot:run
```

**Node.js Backend** (Port 5001):
```bash
cd Backend/nodejs-backend
npm install
npm start
```

**Python Backend** (Port 5000):
```bash
cd Backend/python-backend
pip install -r requirements.txt
python app.py
```

### 4. Start Frontend (Port 5173)
```bash
cd Frontend
npm install
npm run dev
```

## Service Responsibilities

### API Gateway (Port 5003)
- JWT token validation
- Request routing to appropriate backend services
- CORS handling
- User context injection

### Java Backend (Port 5002)
- **HR Module**: Employee management, payroll, attendance, benefits, training, performance reviews
- **Finance Module**: Accounting, budgets, accounts payable/receivable, journal entries
- **Asset Module**: Asset tracking, maintenance records, disposal management
- **Legal Module**: Legal cases, compliance records
- **Revenue Module**: Tax assessments, business permits, revenue collection
- **System Module**: Audit logs, notifications, security incidents, support tickets, SOPs

### Node.js Backend (Port 5001)
- **Authentication**: User registration, login, password reset, email verification
- **Leave Management**: Leave requests, approvals, balances
- **Procurement**: Purchase requests, vendor management, purchase orders
- **Public Relations**: Press releases, media contacts, events
- **Planning**: Projects, milestones, resource allocation
- **Transportation**: Vehicle management, trip scheduling, maintenance
- **Communication**: Internal messaging and announcements

### Python Backend (Port 5000)
- **Biometric Module**: Facial recognition, fingerprint enrollment, identification
- **Visitor Management**: Check-in/out, token generation, entry passes
- **Health & Safety**: Incident reporting, safety inspections, training records
- **Reports & Analytics**: Data analysis, custom reports, KPI tracking
- **Dashboard**: Real-time metrics and visualizations

## API Documentation

All API requests should be routed through the API Gateway at `http://localhost:5003`.

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Public Routes
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/request-password-reset`
- `POST /api/biometric/enroll`
- `POST /api/visitors/generate-token`

## Development

### Running in Development Mode
Each service has a development mode with hot-reloading:
- API Gateway: `npm run dev`
- Java Backend: Uses Spring DevTools
- Node.js Backend: `npm run dev`
- Python Backend: Set `FLASK_ENV=development`
- Frontend: `npm run dev`

### Testing
- **Node.js Backend**: `npm test`
- **Java Backend**: `mvn test`
- **Python Backend**: `pytest`
- **Frontend**: `npm run lint`

## Deployment

### Building for Production

**Frontend**:
```bash
cd Frontend
npm run build
```

**Java Backend**:
```bash
cd Backend/java-backend
mvn clean package
```

**Node.js Services**: Use PM2 or similar process manager
**Python Backend**: Use Gunicorn or uWSGI

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository or contact the development team.
