# Craft Resource Management

## Overview
This repository contains the full stack application for Craft Resource Management, including backend services and frontend application.

## Backend
The backend consists of multiple services implemented in different technologies to provide a modular and scalable architecture:

- **API Gateway**: Node.js service acting as the gateway for routing and aggregating requests.
- **Java Backend**: Java-based service built with Maven, providing core business logic and APIs.
- **Node.js Backend**: Node.js service with RESTful APIs and business logic.
- **Python Backend**: Python Flask service providing biometric, reporting, health & safety, visitor management, and dashboard functionalities.

Each backend service has its own setup instructions and dependencies. Please refer to the respective README files in each service directory for detailed information.

## Frontend
The frontend application is built using React 18 with TypeScript, Vite as the build tool, and Tailwind CSS for styling. It leverages Radix UI components for accessible UI primitives and React Query for data fetching and state management.

### Technologies Used
- React 18
- TypeScript
- Vite
- Tailwind CSS (with typography and animation plugins)
- Radix UI components
- React Router DOM for routing
- React Hook Form for form handling
- Zod for schema validation
- ESLint for linting

### Prerequisites
- Node.js (version 16 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

### Available Scripts
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the app for production.
- `npm run build:dev` - Builds the app for development mode.
- `npm run preview` - Previews the production build locally.
- `npm run lint` - Runs ESLint to analyze the code.

## Common Scripts
The `Backend/scripts` directory contains SQL scripts for database schema, seed data, user creation, and documentation for access control and backup/recovery.

## Docker
Each backend service and the API gateway have their own Dockerfiles and `.dockerignore` files for containerization. The root `.dockerignore` and `.gitignore` files help manage ignored files across the entire project.

### Docker Compose
The root `docker-compose.yml` file orchestrates all backend services and the frontend:

1. Copy `.env.example` to `.env` and fill in your environment variables
2. Run `docker-compose up --build` to start all services
3. Access the frontend at `http://localhost`
4. Backend services will be available at their respective ports:
   - API Gateway: `http://localhost:5003`
   - Java Backend: `http://localhost:5002`
   - Node.js Backend: `http://localhost:5001`
   - Python Backend: `http://localhost:5000`

## Kubernetes
The `k8s/` directory contains Kubernetes manifests for deploying the application to a Kubernetes cluster:

- `deployments.yaml`: Deployments for all services
- `services.yaml`: Services for internal communication
- `ingress.yaml`: Ingress for external access
- `secrets.yaml`: Secrets and ConfigMaps for environment variables

### Kubernetes Deployment
1. Apply the secrets and configmaps: `kubectl apply -f k8s/secrets.yaml`
2. Deploy the services: `kubectl apply -f k8s/services.yaml`
3. Deploy the applications: `kubectl apply -f k8s/deployments.yaml`
4. Apply the ingress: `kubectl apply -f k8s/ingress.yaml`
5. Access the application at `http://craft-resource-management.local` (add to /etc/hosts if needed)

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to run linting and tests before submitting.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For questions or support, contact the development team.
