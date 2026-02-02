# Python Backend Service

## Overview
Flask microservice handling Biometric Authentication, Visitor Management, Health & Safety, Reports & Analytics, and Dashboard modules for the Craft Resource Management system.

## Port
**5000** (default)

## Modules & Responsibilities

### Biometric Module
- **Facial Recognition**: Face enrollment, verification, and identification
- **Fingerprint Management**: Fingerprint enrollment and matching (conceptual)
- **Card Lookup**: RFID/card holder information retrieval
- **Biometric Statistics**: System usage and performance metrics
- **Multi-modal Authentication**: Combined biometric verification

### Visitor Management Module
- **Token Generation**: Visitor access token creation
- **Token Validation**: Verify visitor tokens
- **Check-in/Check-out**: Visitor entry and exit tracking
- **Entry Pass Generation**: Digital and printable entry passes
- **Visitor History**: Historical visitor records
- **Host Notifications**: Alert hosts of visitor arrivals

### Health & Safety Module
- **Incident Reporting**: Safety incident documentation
- **Safety Inspections**: Scheduled safety audits
- **Training Records**: Safety training tracking
- **Hazard Identification**: Risk assessment and management
- **Compliance Tracking**: Safety regulation compliance
- **Emergency Procedures**: Emergency response protocols

### Reports & Analytics Module
- **Custom Reports**: Configurable report generation
- **Data Analysis**: Statistical analysis and insights
- **KPI Tracking**: Key performance indicators
- **Trend Analysis**: Historical data trends
- **Export Functionality**: PDF, Excel, CSV exports
- **Scheduled Reports**: Automated report generation

### Dashboard Module
- **Real-time Metrics**: Live system statistics
- **Data Visualizations**: Charts and graphs
- **Department Dashboards**: Department-specific views
- **Executive Dashboard**: High-level organizational metrics
- **Custom Widgets**: Configurable dashboard components

## Technology Stack
- **Flask** 3.0+ - Web framework
- **Flask-SQLAlchemy** 3.1+ - ORM
- **Flask-JWT-Extended** 4.6+ - JWT authentication
- **Flask-CORS** 4.0+ - Cross-origin support
- **Flask-Limiter** 3.5+ - Rate limiting
- **Flask-Caching** 2.1+ - Response caching
- **MySQL** - Database (via PyMySQL and mysql-connector-python)
- **SQLAlchemy** 2.0+ - Database ORM
- **Bcrypt** - Password hashing
- **ReportLab** - PDF generation
- **Pandas** - Data analysis
- **OpenPyXL** - Excel file generation
- **Boto3** - AWS SDK for SMS
- **Pytest** - Testing framework
- **Gunicorn** - Production WSGI server

## Prerequisites
- Python 3.9 or higher
- MySQL 8.0+
- pip (Python package manager)
- Virtual environment (recommended)

## Installation

1. Navigate to the directory:
```bash
cd Backend/python-backend
```

2. Create and activate virtual environment:
```bash
# Windows CMD
python -m venv venv
venv\Scripts\activate

# Unix/Linux/macOS or Git Bash
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
Create a `.env` file based on `.env.example`:
```env
# Flask
FLASK_ENV=development
PORT=5000
SECRET_KEY=your-secret-key

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=craft_resource_management

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600

# Biometric
FACE_RECOGNITION_THRESHOLD=0.6
FINGERPRINT_THRESHOLD=0.7

# AWS (for SMS)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Running the Service

**Development mode**:
```bash
python app.py
```

**Production mode** (using Gunicorn):
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

The service will start on `http://localhost:5000`.

## API Endpoints

### Biometric
- `POST /api/biometric/enroll` - Enroll biometric data (public)
- `POST /api/biometric/verify` - Verify biometric (1:1 matching)
- `POST /api/biometric/identify` - Identify user (1:N matching) (public)
- `POST /api/biometric/card-lookup` - Lookup card holder
- `GET /api/biometric/statistics` - Get system statistics

### Visitor Management
- `POST /api/visitors/generate-token` - Generate visitor token (public)
- `POST /api/visitors/validate-token` - Validate token (public)
- `POST /api/visitors/checkin` - Check-in visitor (public)
- `POST /api/visitors/checkout` - Check-out visitor
- `GET /api/visitors/entry-pass` - Generate entry pass (public)
- `GET /api/visitors/history` - Visitor history

### Health & Safety
- `POST /api/health-safety/incidents` - Report incident
- `GET /api/health-safety/incidents` - List incidents
- `POST /api/health-safety/inspections` - Create inspection
- `GET /api/health-safety/inspections` - List inspections
- `POST /api/health-safety/training` - Record training
- `GET /api/health-safety/compliance` - Compliance status

### Reports & Analytics
- `POST /api/reports/generate` - Generate custom report
- `GET /api/reports/list` - List available reports
- `GET /api/reports/{id}` - Get specific report
- `GET /api/analytics/kpis` - Get KPIs
- `GET /api/analytics/trends` - Get trend data
- `POST /api/analytics/export` - Export data

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/department/{id}` - Department dashboard
- `GET /api/dashboard/executive` - Executive dashboard
- `GET /api/dashboard/widgets` - Get widget data

### Health Check
- `GET /health` - Service health status

## Project Structure
```
python-backend/
├── src/
│   ├── biometric_module/      # Biometric authentication
│   │   ├── controller.py      # Request handlers
│   │   ├── models.py          # Database models
│   │   ├── routes.py          # Flask routes
│   │   └── service.py         # Business logic
│   ├── visitor_module/        # Visitor management
│   │   ├── controller.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── service.py
│   ├── health_safety_module/  # Health & safety
│   │   ├── controller.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── service.py
│   ├── reports_analytics_module/  # Reports & analytics
│   │   ├── controller.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── service.py
│   ├── dashboard_module/      # Dashboard
│   │   ├── controller.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── service.py
│   ├── config/                # Configuration
│   │   ├── app.py             # App config
│   │   └── database.py        # Database config
│   ├── database/              # Database connection
│   │   └── connection.py
│   ├── middleware/            # Flask middleware
│   │   ├── auth.py            # Authentication
│   │   ├── error_handler.py   # Error handling
│   │   ├── request_logger.py  # Request logging
│   │   └── session_tracker.py # Session tracking
│   ├── utils/                 # Utilities
│   │   ├── audit_client.py    # Audit logging
│   │   └── logger.py          # Logger setup
│   ├── mockData/              # Mock data for testing
│   │   └── biometric_service.py
│   ├── audit_service.py       # Audit service
│   ├── communication_service.py  # Communication utilities
│   └── extensions.py          # Flask extensions
├── models/                    # ML models (if any)
├── tests/                     # Test files
├── app.py                     # Application entry point
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── .dockerignore              # Docker ignore rules
└── README.md
```

## Module Structure
Each module follows a consistent structure:
```
module/
├── controller.py    # Request handlers and validation
├── models.py        # SQLAlchemy models
├── routes.py        # Flask blueprints and routes
└── service.py       # Business logic and database operations
```

## Testing

Run all tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=src tests/
```

Run specific test file:
```bash
pytest tests/test_biometric.py
```

## Key Features

### Security
- JWT-based authentication with Flask-JWT-Extended
- Bcrypt password hashing
- Rate limiting to prevent abuse
- CORS configuration
- Input validation and sanitization

### Biometric Processing
- Face detection and recognition using OpenCV
- Fallback mechanisms for missing dependencies
- Configurable recognition thresholds
- Multi-modal biometric support

### Caching
- Flask-Caching for response caching
- Configurable cache backends
- Cache invalidation strategies

### Logging
- Structured logging with python-json-logger
- Request/response logging
- Error tracking
- Audit trail logging

### Report Generation
- PDF reports with ReportLab
- Excel exports with OpenPyXL
- CSV data exports
- Pandas for data processing

### Session Management
- Active session tracking
- Automatic session cleanup
- User context management

### Error Handling
- Centralized error handlers
- Consistent error response format
- Detailed error logging

## Database Models
Key SQLAlchemy models:
- BiometricData, FaceEncoding, Fingerprint
- Visitor, VisitorLog, EntryPass
- SafetyIncident, SafetyInspection, SafetyTraining
- Report, ReportSchedule, AnalyticsData
- DashboardWidget, DashboardConfig

## Development

### Code Formatting
```bash
black src/
```

### Linting
```bash
flake8 src/
```

### Import Sorting
```bash
isort src/
```

## Production Deployment

### Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 --worker-class gevent app:app
```

### Environment Variables
Ensure all production environment variables are set:
- Set `FLASK_ENV=production`
- Use strong `SECRET_KEY` and `JWT_SECRET`
- Configure production database credentials
- Set appropriate cache backend

## Troubleshooting

**Issue**: Database connection errors
- Verify MySQL is running
- Check credentials in .env
- Ensure database exists
- Check connection pool settings

**Issue**: Biometric processing errors
- Verify OpenCV installation
- Check face recognition model files
- Adjust recognition thresholds
- Review error logs

**Issue**: Import errors
- Ensure virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt`
- Check Python version compatibility

**Issue**: Performance issues
- Enable caching
- Use Gunicorn with multiple workers
- Optimize database queries
- Review slow query logs

## Performance Optimization
- Connection pooling for database
- Response caching with Flask-Caching
- Async processing for heavy operations
- Database query optimization
- Gevent for concurrent request handling

## Biometric Configuration
Adjust recognition thresholds in `.env`:
- `FACE_RECOGNITION_THRESHOLD`: Lower = stricter (default: 0.6)
- `FINGERPRINT_THRESHOLD`: Lower = stricter (default: 0.7)

## Contributing
1. Follow PEP 8 style guidelines
2. Write tests for new features
3. Use type hints where appropriate
4. Document API endpoints
5. Follow the existing module structure
6. Handle errors properly

## License
MIT License

## Contact
For support or inquiries, contact the development team.
