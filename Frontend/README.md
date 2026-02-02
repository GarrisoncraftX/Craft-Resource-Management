# Frontend - Craft Resource Management System

## Overview
Modern React 18 web application built with TypeScript, Vite, and Tailwind CSS. Provides a comprehensive user interface for the Craft Resource Management system with features for HR, Finance, Asset Management, Leave Management, Visitor Management, and more.

## Port
**5173** (default Vite dev server)

## Technology Stack
- **React** 18.3 - UI library
- **TypeScript** 5.5 - Type safety
- **Vite** 7.2 - Build tool and dev server
- **Tailwind CSS** 3.4 - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Router DOM** 6.26 - Client-side routing
- **TanStack Query** (React Query) 5.56 - Data fetching and state management
- **React Hook Form** 7.53 - Form handling
- **Zod** 3.23 - Schema validation
- **Axios** 1.12 - HTTP client
- **Lucide React** - Icon library
- **Recharts** 2.12 - Data visualization
- **date-fns** 3.6 - Date utilities
- **Sonner** - Toast notifications

## Prerequisites
- Node.js 16 or higher
- npm or yarn

## Installation

1. Navigate to the directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file:
```env
VITE_API_URL=http://localhost:5003
VITE_APP_NAME=Craft Resource Management
```

## Running the Application

**Development mode**:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

**Production build**:
```bash
npm run build
```

**Development build**:
```bash
npm run build:dev
```

**Preview production build**:
```bash
npm run preview
```

**Lint code**:
```bash
npm run lint
```

## Project Structure
```
Frontend/
├── public/                    # Static assets
│   ├── logo.png              # Application logo
│   ├── placeholder.svg       # Placeholder images
│   └── robots.txt            # SEO robots file
├── src/
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components (Radix-based)
│   │   ├── layout/          # Layout components
│   │   └── features/        # Feature-specific components
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   └── useApi.ts        # API hook
│   ├── lib/                 # Library configurations
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Route components/pages
│   │   ├── Dashboard/       # Dashboard pages
│   │   ├── HR/              # HR module pages
│   │   ├── Finance/         # Finance module pages
│   │   ├── Assets/          # Asset management pages
│   │   ├── Leave/           # Leave management pages
│   │   ├── Procurement/     # Procurement pages
│   │   ├── Visitors/        # Visitor management pages
│   │   ├── Auth/            # Authentication pages
│   │   └── ...              # Other module pages
│   ├── services/            # API services
│   │   ├── api.ts           # API client configuration
│   │   └── mockData.ts      # Mock data for development
│   ├── types/               # TypeScript type definitions
│   │   ├── index.ts         # Common types
│   │   └── api.ts           # API response types
│   ├── utils/               # Utility functions
│   │   ├── apiClient.ts     # Axios configuration
│   │   └── helpers.ts       # Helper functions
│   ├── App.tsx              # Main App component
│   ├── App.css              # App-level styles
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type definitions
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App TypeScript config
├── tsconfig.node.json       # Node TypeScript config
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── eslint.config.js         # ESLint configuration
├── components.json          # Radix UI components config
└── README.md
```

## Key Features

### Authentication
- User login and registration
- JWT token management
- Protected routes
- Role-based access control
- Password reset functionality
- Email verification

### Modules

#### Dashboard
- Real-time metrics and KPIs
- Data visualizations with Recharts
- Department-specific dashboards
- Executive overview

#### HR Management
- Employee directory and profiles
- Payroll management
- Attendance tracking
- Benefits administration
- Training records
- Performance reviews

#### Finance
- Chart of accounts
- Journal entries
- Accounts payable/receivable
- Budget management
- Financial reports

#### Asset Management
- Asset registry
- Maintenance tracking
- Disposal records
- Asset lifecycle management

#### Leave Management
- Leave request submission
- Approval workflow
- Leave balance tracking
- Leave history

#### Procurement
- Purchase requisitions
- Vendor management
- Purchase orders
- Quotation comparison

#### Visitor Management
- Visitor registration
- Check-in/check-out
- Entry pass generation
- Visitor history

#### Health & Safety
- Incident reporting
- Safety inspections
- Training records
- Compliance tracking

#### Reports & Analytics
- Custom report generation
- Data export (PDF, Excel, CSV)
- Trend analysis
- KPI tracking

### UI Components (Radix UI)
- Accordion
- Alert Dialog
- Avatar
- Button
- Card
- Checkbox
- Dialog/Modal
- Dropdown Menu
- Form components
- Input fields
- Select
- Tabs
- Toast notifications
- Tooltip
- And many more...

### Form Handling
- React Hook Form for form state management
- Zod schema validation
- Custom form components
- Error handling and display
- File upload support

### Data Fetching
- TanStack Query for server state management
- Automatic caching and refetching
- Optimistic updates
- Loading and error states
- Pagination support

### Routing
- React Router DOM for navigation
- Protected routes
- Nested routes
- Route-based code splitting
- 404 error handling

### Styling
- Tailwind CSS utility classes
- Custom theme configuration
- Dark mode support (next-themes)
- Responsive design
- Typography plugin
- Animation utilities

## Configuration Files

### Vite Configuration (vite.config.ts)
- React plugin with SWC
- Path aliases
- Build optimization
- Dev server settings

### Tailwind Configuration (tailwind.config.ts)
- Custom color palette
- Typography plugin
- Animation plugin
- Custom utilities
- Responsive breakpoints

### TypeScript Configuration
- Strict type checking
- Path aliases
- Module resolution
- JSX configuration

### ESLint Configuration
- React hooks rules
- React refresh plugin
- TypeScript ESLint
- Code quality rules

## API Integration

### API Client (Axios)
```typescript
// Example API call
import { apiClient } from '@/utils/apiClient';

const fetchEmployees = async () => {
  const response = await apiClient.get('/hr/employees');
  return response.data;
};
```

### React Query Usage
```typescript
// Example query
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['employees'],
  queryFn: fetchEmployees,
});
```

### Authentication
```typescript
// Using auth context
import { useAuth } from '@/hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

## Environment Variables
- `VITE_API_URL` - Backend API URL (default: http://localhost:5003)
- `VITE_APP_NAME` - Application name

## Development

### Hot Module Replacement (HMR)
Vite provides instant HMR for fast development feedback.

### Type Safety
TypeScript ensures type safety across the application. Run type checking:
```bash
npx tsc --noEmit
```

### Code Linting
```bash
npm run lint
```

### Component Development
Follow the existing component structure:
1. Create component in appropriate directory
2. Define TypeScript interfaces for props
3. Use Tailwind CSS for styling
4. Export from index file if needed

## Building for Production

1. Build the application:
```bash
npm run build
```

2. The build output will be in the `dist/` directory.

3. Preview the production build:
```bash
npm run preview
```

## Deployment

### Static Hosting
The built application can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

### Environment Configuration
Set production environment variables:
- `VITE_API_URL` - Production API URL

### Build Optimization
- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Lazy loading

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility
- Radix UI components are WCAG compliant
- Keyboard navigation support
- Screen reader friendly
- ARIA attributes
- Focus management

## Performance
- Code splitting with React.lazy
- Image optimization
- Lazy loading
- Memoization with React.memo
- Virtual scrolling for large lists

## Troubleshooting

**Issue**: Port 5173 already in use
- Change port in vite.config.ts or use `--port` flag
- Kill process using port 5173

**Issue**: API connection errors
- Verify VITE_API_URL in .env
- Ensure backend services are running
- Check CORS configuration

**Issue**: Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npx tsc --noEmit`

**Issue**: Styling not working
- Ensure Tailwind CSS is properly configured
- Check PostCSS configuration
- Verify import order in main.tsx

## Contributing
1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow React best practices
4. Use Tailwind CSS for styling
5. Write accessible components
6. Test on multiple browsers
7. Document complex logic

## Scripts Reference
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License
MIT License
