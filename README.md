# Ride Lifecycle System

A comprehensive real-time ride-sharing application built with Node.js, Express, MongoDB, and Socket.io.

## Features

- **REST API Endpoints** for ride operations (request, accept, decline, start, complete, cancel)
- **Real-time Updates** via Socket.io for driver availability, ride status changes, and live GPS tracking
- **State Machine** for ride lifecycle with well-defined transitions
- **Fare Calculation** with surge pricing support
- **Mapping Integration** with Mapbox for geocoding and route visualization
- **Location Breadcrumb Tracking** for driver GPS pings persistence
- **Driver Assignment** based on proximity and availability
- **Rating System** for riders and drivers
- **Comprehensive Testing** with integration and unit tests

## Project Structure

```
.
├── config/              # Database and configuration
├── models/              # Mongoose schemas
├── services/            # Business logic
├── controllers/         # Route handlers
├── routes/              # API route definitions
├── middleware/          # Express middleware
├── utils/               # Utility functions
├── sockets/             # Socket.io handlers
├── tests/               # Test suites
├── server.js            # Entry point
└── package.json         # Dependencies
```

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd project
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file from `.env.example`
```bash
cp .env.example .env
```

4. Set up environment variables
```
MONGODB_URI=mongodb://localhost:27017/taxidrive
MAPBOX_ACCESS_TOKEN=your-mapbox-token
JWT_SECRET=your-secret-key
```

5. Start MongoDB (if running locally)
```bash
mongod
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Rides

#### Request a Ride
```
POST /api/rides
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickup": {
    "address": "123 Main St",
    "coordinates": [-74.006, 40.7128]
  },
  "dropoff": {
    "address": "456 Park Ave",
    "coordinates": [-74.0015, 40.7489]
  },
  "vehicleType": "economy",
  "paymentMethod": "card"
}
```

#### Get Ride Details
```
GET /api/rides/:id
Authorization: Bearer <token>
```

#### Accept a Ride (Driver)
```
POST /api/rides/:id/accept
Authorization: Bearer <token>
```

#### Decline a Ride (Driver)
```
POST /api/rides/:id/decline
Authorization: Bearer <token>
```

#### Start a Ride (Driver)
```
POST /api/rides/:id/start
Authorization: Bearer <token>
```

#### Complete a Ride (Driver)
```
POST /api/rides/:id/complete
Authorization: Bearer <token>
```

#### Cancel a Ride
```
POST /api/rides/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

#### Update Driver Location
```
POST /api/rides/:id/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "coordinates": [-74.0060, 40.7128],
  "accuracy": 5,
  "speed": 12.5,
  "heading": 90
}
```

#### Get Rider History
```
GET /api/rides/history/rider?limit=10&offset=0
Authorization: Bearer <token>
```

#### Get Driver History
```
GET /api/rides/history/driver?limit=10&offset=0
Authorization: Bearer <token>
```

#### Rate a Ride
```
POST /api/rides/:id/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great service!"
}
```

## Socket.io Events

### Rider Events

#### Request a Ride
```javascript
socket.emit('ride:request', {
  riderId: 'user123',
  pickup: {
    address: '123 Main St',
    coordinates: [-74.006, 40.7128]
  },
  dropoff: {
    address: '456 Park Ave',
    coordinates: [-74.0015, 40.7489]
  },
  vehicleType: 'economy',
  paymentMethod: 'card'
});
```

#### Listen for Ride Accepted
```javascript
socket.on('ride:accepted', (data) => {
  console.log('Driver accepted:', data.driverId);
});
```

#### Listen for Ride Started
```javascript
socket.on('ride:started', (data) => {
  console.log('Ride started:', data.rideId);
});
```

#### Listen for Ride Completed
```javascript
socket.on('ride:completed', (data) => {
  console.log('Fare:', data.fare);
});
```

### Driver Events

#### Become Available
```javascript
socket.emit('driver:available', {
  driverId: 'driver123',
  coordinates: [-74.0060, 40.7128]
});
```

#### Listen for New Ride Request
```javascript
socket.on('ride:new_request', (ride) => {
  console.log('New ride available:', ride);
});
```

#### Accept a Ride
```javascript
socket.emit('ride:accept', {
  rideId: 'ride123',
  driverId: 'driver123'
});
```

#### Update Location
```javascript
socket.emit('driver:location_update', {
  driverId: 'driver123',
  coordinates: [-74.0060, 40.7128],
  accuracy: 5,
  speed: 12.5,
  heading: 90
});
```

#### Start a Ride
```javascript
socket.emit('ride:start', {
  rideId: 'ride123',
  driverId: 'driver123'
});
```

#### Complete a Ride
```javascript
socket.emit('ride:complete', {
  rideId: 'ride123',
  driverId: 'driver123'
});
```

## Ride State Machine

The ride lifecycle follows a defined state machine:

```
requested → accepted → driver_arriving → in_progress → completed
    ↓           ↓           ↓              ↓
  cancelled   cancelled   cancelled      cancelled
```

Valid state transitions are enforced to maintain data integrity.

## Fare Calculation

Fare is calculated based on:
- **Base fare**: Fixed starting price
- **Distance fare**: Price per mile
- **Time fare**: Price per minute
- **Vehicle type multiplier**: Economy (1.0x), Premium (1.5x), XL (2.0x)
- **Surge pricing**: Dynamic multiplier based on demand/supply ratio

## Location Breadcrumbs

Driver locations are persisted to MongoDB with:
- GPS coordinates
- Accuracy radius
- Speed and heading
- Timestamp
- TTL (7 days auto-delete)

Breadcrumbs are created only during active rides.

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Test files:
- `tests/rideStateMachine.test.js` - State machine validation
- `tests/fareCalculator.test.js` - Fare calculation logic
- `tests/rideService.integration.test.js` - Full ride lifecycle tests

## Database Models

### User
- Fields: name, email, password, role (rider/driver), phone, rating
- Driver-specific: licenseNumber, vehicleType, currentLocation, isAvailable

### Ride
- Fields: riderId, driverId, status, pickup, dropoff, vehicleType
- Pricing: baseFare, distanceFare, timeFare, surgePricing, totalFare
- Routing: distance, duration, eta, route points
- Rating: value, comment, ratedBy

### LocationBreadcrumb
- Tracks driver GPS updates during rides
- Auto-deletes after 7 days

## Security

- JWT token authentication on all protected routes
- Password hashing with bcryptjs
- CORS configuration for Socket.io
- Input validation on all endpoints

## Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Server port (default: 5000)
- `MAPBOX_ACCESS_TOKEN` - Mapbox API token

Optional:
- `NODE_ENV` - Environment (development/production)
- `SOCKET_CORS` - CORS origin for Socket.io
- `BASE_FARE` - Base fare amount
- `PRICE_PER_MILE` - Price per mile
- `PRICE_PER_MINUTE` - Price per minute

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Socket.io errors are emitted back to the client:
```javascript
socket.on('error', (error) => {
  console.error(error.message);
});
```

## Future Enhancements

- [ ] Payment processing integration
- [ ] Real-time traffic integration
- [ ] Multiple driver assignment algorithms
- [ ] Ride pooling/sharing
- [ ] Driver analytics dashboard
- [ ] SMS/Push notifications
- [ ] Accessibility features
# RideShare Payments Admin Dashboard

A complete full-stack ride-sharing application with Stripe payments integration and comprehensive admin dashboard.

## Features

### Backend (Node.js/Express)
- **Authentication & Authorization**: JWT-based auth with role-based access (Admin/User/Driver)
- **Stripe Integration**: Complete payment processing, webhooks, refund handling
- **Database**: PostgreSQL with Prisma ORM, comprehensive schema for users, drivers, rides, payments
- **RESTful APIs**: Well-structured endpoints for all operations
- **Security**: Helmet middleware, CORS configuration, input validation with Zod

### Frontend (React/TypeScript)
- **Admin Dashboard**: KPIs, revenue charts, searchable tables for users/drivers/rides/payments
- **Driver Interface**: Driver registration, ride management, earnings tracking
- **User Experience**: Payment settings, ride history, profile management
- **UI/UX**: Responsive design with Tailwind CSS, modern component library
- **State Management**: React Query for server state, form handling with React Hook Form

### Payment Processing
- **Stripe Elements**: Secure payment method collection
- **Payment Intents**: Complete ride payment lifecycle
- **Webhooks**: Real-time payment status updates
- **Refunds**: Admin-initiated partial/full refunds
- **Receipts**: PDF generation for transaction records
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
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Stripe API integration
- JWT authentication
- Zod validation
- Helmet security

### Frontend
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- React Query (TanStack Query)
- React Hook Form
- Stripe Elements
- Recharts for data visualization

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Stripe account (for test keys)

### Installation

1. Clone and install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cp .env.example server/.env
# Edit server/.env with your actual values
```

3. Set up database:
```bash
cd server
npm run db:migrate
npm run db:seed
```

4. Start development servers:
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

This will start:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

### Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Stripe dashboard
3. Set up webhook endpoints in Stripe:
   - Endpoint URL: http://localhost:3001/webhooks/stripe
   - Events: payment_intent.succeeded, payment_intent.payment_failed, payment_method.attached

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/payments_dashboard"

# Stripe (get from Stripe dashboard)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Security
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3001
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
```

## API Endpoints

### Authentication
- POST /auth/register - User registration
- POST /auth/login - User login
- GET /auth/me - Get current user

### Users (Admin)
- GET /admin/users - List users with search/filters
- PATCH /admin/users/:id/status - Activate/deactivate user
- DELETE /admin/users/:id - Delete user

### Drivers
- POST /drivers/register - Register as driver
- GET /drivers/me - Get driver profile
- GET /admin/drivers - List drivers (admin)
- PATCH /drivers/:id/approve - Approve/reject driver (admin)

### Rides
- POST /rides - Create new ride
- GET /rides/my-rides - User ride history
- GET /rides/driver-rides - Driver ride management
- PATCH /rides/:id/status - Update ride status

### Payments
- POST /payments/payment-methods - Add payment method
- GET /payments/payment-methods - List payment methods
- POST /payments/confirm-payment - Confirm ride payment
- GET /payments/history - Payment history
- POST /payments/refund - Process refund (admin)

### Admin Dashboard
- GET /admin/dashboard - KPI metrics
- GET /admin/revenue - Revenue analytics
- GET /admin/payments - Payment management
- POST /admin/payments/:id/refund - Process refund

## Database Schema

### Core Models
- **User**: Authentication, profile, Stripe customer ID
- **Driver**: Vehicle info, license, approval status, Stripe Connect account
- **Ride**: Route, pricing, status lifecycle, payment intent
- **Payment**: Stripe payment intent, status, refunds
- **Transaction**: Financial transaction history
- **PaymentMethod**: Stored payment methods
- **Invoice**: Receipt generation
- **Payout**: Driver earnings distribution

## Admin Dashboard Features

### KPIs & Metrics
- Total users, drivers, rides, revenue
- Daily/weekly/monthly growth metrics
- Revenue trend charts
- Transaction summaries

### Data Management
- **Users**: Search, filter, activate/deactivate, delete
- **Drivers**: Approval queue, background check status, vehicle info
- **Rides**: Complete ride lifecycle, status management
- **Payments**: Transaction history, refund processing

### Driver Approval Workflow
1. Driver submits application with documents
2. Admin reviews application
3. Background check completion
4. Final approval/rejection
5. Stripe Connect onboarding

## Security Features

- JWT token authentication
- Role-based access control
- Stripe webhook signature validation
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Helmet security headers

## Payment Flow

1. **User Books Ride**: Creates payment intent
2. **Payment Method**: User selects/stored payment method
3. **Payment Processing**: Stripe processes payment
4. **Webhook Handling**: Real-time status updates
5. **Driver Payout**: Automatic Stripe Connect transfers
6. **Refunds**: Admin-initiated partial/full refunds

## Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Set NODE_ENV=production
- Use production Stripe keys
- Configure production database
- Set up Stripe webhooks for production URLs

## Development

### Database Migrations
```bash
cd server
npm run db:migrate
npm run db:seed
```

### Code Quality
```bash
# Run linting
npm run lint

# Type checking
npm run type-check
```

## Features Implemented

✅ **Stripe Integration**: Complete payment processing lifecycle
✅ **Admin Dashboard**: KPIs, search, filtering, pagination
✅ **Driver Management**: Registration, approval workflow
✅ **User Management**: Profile, payment methods, ride history
✅ **Payment Settings**: Add/remove payment methods
✅ **Ride History**: Transaction status, receipt downloads
✅ **Refund Processing**: Admin-initiated refunds
✅ **Webhook Handling**: Real-time payment updates
✅ **Authentication**: JWT with role-based access
✅ **Database**: Comprehensive PostgreSQL schema
✅ **Responsive UI**: Mobile-friendly design

## Future Enhancements

- Real-time notifications
- Push notifications for ride updates
- Advanced analytics and reporting
- Multi-language support
- Mobile app development
- Advanced driver matching algorithm
- Dynamic pricing with surge multipliers

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
