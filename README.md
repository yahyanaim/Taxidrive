# Model Data Layer (PostgreSQL + Prisma)

This repository contains the foundational database schema, migrations, seed routine, and a thin data-access/service layer.

## Quickstart

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install deps:

```sh
pnpm install
```

3. Run migrations:

```sh
pnpm prisma:migrate
# or: pnpm prisma migrate dev
```

4. Seed sample data:

```sh
pnpm prisma:seed
# or: pnpm prisma db seed
```

## Docs

See `/docs`:

- [`docs/ERD.md`](./docs/ERD.md)
- [`docs/data-dictionary.md`](./docs/data-dictionary.md)
# Auth App - Full Stack Authentication & Profile Management

A comprehensive full-stack application featuring JWT-based authentication, role-based access control, and user profile management for both riders and drivers.

## Features

### Backend
- **Authentication**
  - User signup with role selection (rider/driver)
  - Email/password login with JWT access & refresh tokens
  - Token refresh mechanism
  - Password hashing with bcrypt
  
- **Authorization**
  - Role-based middleware (rider/driver/admin)
  - Status-based access control (pending/active/inactive/rejected)
  
- **Profiles**
  - User profile CRUD operations
  - Driver-specific profiles with documents
  - Driver availability toggles
  - Document management (license, insurance, registration, inspection)
  
- **Admin Features**
  - Approve/reject drivers
  - View all drivers and users
  - Manage user account status

- **API Documentation**
  - OpenAPI/Swagger documentation at `/api-docs`
  - Interactive API explorer

### Frontend
- **Authentication Pages**
  - Login page with form validation
  - Registration page with rider/driver selection
  - JWT token management with automatic refresh
  
- **Profile Management**
  - View and edit user profile
  - Role-specific profile pages
  
- **Driver Features**
  - Driver dashboard with approval status
  - Availability toggle (when approved)
  - Driver document management
  - License and vehicle information
  
- **UI Features**
  - Form validation with error messages
  - Protected routes with role-based access
  - Loading states and error handling
  - Responsive design

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Validation**: Zod
- **API Docs**: OpenAPI/Swagger
- **Testing**: Vitest

### Frontend
- **Framework**: React 18
- **Routing**: React Router
- **State Management**: TanStack React Query
- **Validation**: Zod
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: CSS

## Project Structure

```
├── src/                          # Backend source code
│   ├── server.ts                # Main server entry
│   ├── types.ts                 # TypeScript type definitions
│   ├── db/
│   │   └── store.ts             # In-memory data store
│   ├── routes/
│   │   ├── auth.ts              # Authentication routes
│   │   ├── profile.ts           # Profile management routes
│   │   └── admin.ts             # Admin routes
│   ├── middleware/
│   │   ├── auth.ts              # Authentication middleware
│   │   └── errorHandler.ts      # Error handling
│   ├── utils/
│   │   └── auth.ts              # Auth utilities (hashing, tokens)
│   ├── schemas/
│   │   └── validation.ts        # Zod validation schemas
│   ├── swagger.ts               # OpenAPI/Swagger config
│   └── __tests__/
│       └── integration/         # Integration tests
├── frontend/                      # Frontend source code
│   ├── src/
│   │   ├── App.tsx              # Main App component
│   │   ├── App.css              # Global styles
│   │   ├── main.tsx             # React entry point
│   │   ├── api/
│   │   │   ├── client.ts        # Axios client with interceptors
│   │   │   └── hooks.ts         # React Query hooks
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx    # Login page
│   │   │   ├── SignupPage.tsx   # Signup page
│   │   │   ├── ProfilePage.tsx  # User profile
│   │   │   └── DriverDashboardPage.tsx
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx # Route protection
│   │   ├── schemas.ts           # Frontend validation schemas
│   │   └── styles/
│   ├── index.html               # HTML entry point
│   ├── vite.config.ts
│   └── tsconfig.json
├── package.json                 # Backend dependencies
├── tsconfig.json                # Backend TypeScript config
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

API documentation will be available at `http://localhost:3000/api-docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (requires auth)

### Profile
- `GET /api/profile` - Get user profile (requires auth)
- `PATCH /api/profile` - Update user profile (requires auth)
- `GET /api/profile/driver` - Get driver profile (requires driver role)
- `PATCH /api/profile/driver` - Update driver profile (requires driver role)
- `GET /api/profile/driver/documents` - Get driver documents (requires driver role)
- `POST /api/profile/driver/documents` - Add driver document (requires driver role)
- `PATCH /api/profile/driver/availability` - Toggle availability (requires driver role)

### Admin
- `GET /api/admin/drivers/pending` - Get pending drivers (requires admin role)
- `GET /api/admin/drivers` - Get all drivers (requires admin role)
- `POST /api/admin/drivers/:driverId/approve` - Approve driver (requires admin role)
- `POST /api/admin/drivers/:driverId/reject` - Reject driver (requires admin role)
- `GET /api/admin/users` - Get all users (requires admin role)
- `PATCH /api/admin/users/:userId/status` - Update user status (requires admin role)

## Authentication Flow

1. **Signup**: User registers with email, password, and role
   - Password is hashed with bcrypt
   - User profile is created
   - Access & refresh tokens are issued

2. **Login**: User authenticates with email and password
   - Password is verified against hash
   - Access & refresh tokens are issued
   - Tokens are stored in localStorage

3. **Token Refresh**: When access token expires
   - Frontend intercepts 401 response
   - Refresh token is used to get new access token
   - New tokens are stored and request is retried

4. **Protected Routes**: 
   - All protected routes require valid JWT
   - Token is validated and user info is extracted
   - Role and status are checked for authorization

## Testing

Run integration tests:
```bash
npm run test:integration
```

Run all tests:
```bash
npm test
```

## Form Validation

Frontend forms use Zod for runtime validation with error messages:
- Login: email format, password required
- Signup: email format, password 8+ chars, phone 10+ digits, password match
- Profile: name and phone validation
- Driver profile: optional fields for license, vehicle, etc.

Backend validation mirrors frontend with same Zod schemas.

## Error Handling

- Validation errors return 400 with field-level error details
- Authentication errors return 401
- Authorization errors return 403
- Not found errors return 404
- All errors include user-friendly messages

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- Refresh token rotation
- Role-based access control
- Input validation with Zod
- CORS enabled for development
- Protected routes require authentication

## Development Notes

- In-memory data store (replace with database in production)
- All timestamps stored as ISO strings
- Role-based authorization middleware
- Status-based access control (e.g., rejected users cannot login)
- Driver status tracks approval workflow (pending → approved/rejected)

## License

ISC
