# Craft Resource Management - Python Backend

## Overview
This backend service is the core of the Craft Resource Management system, implemented using Python and Flask. It provides modular functionalities including biometric authentication, reporting and analytics, health and safety management, visitor management, and dashboard features.

## Features
- RESTful API endpoints for biometric enrollment, verification, identification, and card lookup.
- Facial recognition using OpenCV and dlib with fallback to OpenCV-only processing.
- Fingerprint and card data handling (conceptual/mocked implementations).
- Database interactions using SQLAlchemy ORM with MySQL.
- JWT-based authentication and authorization middleware.
- Modular and scalable project structure for maintainability.

## Prerequisites
- Python 3.9 or higher
- MySQL database server
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Backend/python-backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
# On Windows CMD:
venv\Scripts\activate
# On Unix or Git Bash:
source venv/Scripts/activate
```

3. Install required dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
Create a `.env` file in the `Backend/python-backend` directory with the following variables (adjust values as needed):
```
FLASK_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=craft_resource_management
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret-key
FACE_RECOGNITION_THRESHOLD=0.6
```

## Running the Backend
Start the backend server with:
```bash
python app.py
```
The server will run on `http://localhost:5001`.

## API Endpoints

### Biometric Module
- `POST /api/biometric/enroll` - Enroll new biometric data.
- `POST /api/biometric/verify` - Verify biometric data (1:1 matching).
- `POST /api/biometric/identify` - Identify user from biometric data (1:N matching).
- `POST /api/biometric/card-lookup` - Lookup card holder information.
- `GET /api/biometric/statistics` - Retrieve biometric system statistics.

### Other Modules
- Dashboard, health & safety, visitor management, and reports & analytics modules expose their own RESTful endpoints (refer to module documentation for details).

## Testing
Use API clients like Postman or curl to test the endpoints. Authentication is required for protected routes.

## Troubleshooting
- If you encounter build errors related to dlib, ensure CMake is installed and added to your system PATH, or remove the `face-recognition` package from `requirements.txt` if not used.
- Verify database connectivity and credentials in the `.env` file.
- Check logs for detailed error messages.

## Contributing
Contributions are welcome. Please fork the repository and submit pull requests.

## License
Specify your project license here.

## Contact
For support or inquiries, contact the development team at [your-email@example.com].
