# Frontend - Vite React TypeScript Project

## Description
This is the frontend application for the Craft Resource Management system. It is built using React 18 with TypeScript, Vite as the build tool, and Tailwind CSS for styling. The project leverages Radix UI components for accessible UI primitives and React Query for data fetching and state management.

## Technologies Used
- React 18
- TypeScript
- Vite
- Tailwind CSS (with typography and animation plugins)
- Radix UI components
- React Router DOM for routing
- React Hook Form for form handling
- Zod for schema validation
- ESLint for linting

## Prerequisites
- Node.js (version 16 or higher recommended)
- npm (comes with Node.js) or yarn

## Installation
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
   or if you use yarn:
   ```bash
   yarn install
   ```

## Available Scripts

- `npm run dev`  
  Starts the development server using Vite. The app will be available at `http://localhost:5173` by default.

- `npm run build`  
  Builds the app for production to the `dist` folder.

- `npm run build:dev`  
  Builds the app for development mode.

- `npm run preview`  
  Previews the production build locally.

- `npm run lint`  
  Runs ESLint to analyze the code for potential issues.

## Project Structure Overview

- `src/` - Source code for the frontend application
  - `components/` - React components organized by feature and UI primitives
  - `contexts/` - React context providers and types
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `pages/` - Route components/pages
  - `services/` - API and mock data services
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions such as API clients and helpers

- `public/` - Static assets like robots.txt, and placeholder images

- Configuration files for Vite, Tailwind CSS, ESLint, and TypeScript are located at the root of the `Frontend` directory.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to run linting and tests before submitting.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
