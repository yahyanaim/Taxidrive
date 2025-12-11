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

