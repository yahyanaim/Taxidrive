# Data Dictionary

This document describes the foundational database entities.

## Conventions

- All primary keys are UUIDs.
- Monetary values use integer cents (`amountCents`, `fareCents`) + `currency` (`CHAR(3)`, default `USD`).
- `createdAt` uses `now()`; `updatedAt` is maintained by Prisma via `@updatedAt`.

## User

Represents any actor in the system (rider, driver, admin).

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | TEXT | Unique |
| phone | TEXT | Unique, nullable |
| name | TEXT | Nullable |
| role | UserRole | `RIDER`/`DRIVER`/`ADMIN` |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

## DriverProfile

One-to-one extension of `User` for drivers.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| userId | UUID | Unique FK → `User.id` (cascade delete) |
| licenseNumber | TEXT | Unique |
| status | DriverStatus | `PENDING`/`APPROVED`/`SUSPENDED` |
| bio | TEXT | Nullable |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

## Vehicle

Vehicle attached to a driver profile.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| driverProfileId | UUID | FK → `DriverProfile.id` (cascade delete) |
| make/model | TEXT | |
| year | INT | |
| plateNumber | TEXT | Unique |
| color | TEXT | Nullable |
| isActive | BOOLEAN | Default true |
| createdAt/updatedAt | TIMESTAMP | |

## Ride

A trip request and its lifecycle.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| riderId | UUID | FK → `User.id` (restrict delete) |
| driverProfileId | UUID | Nullable FK → `DriverProfile.id` (set null) |
| vehicleId | UUID | Nullable FK → `Vehicle.id` (set null) |
| status | RideStatus | `REQUESTED` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED` (or `CANCELED`) |
| pickupAddress/dropoffAddress | TEXT | Nullable |
| pickupLat/pickupLng | DECIMAL(9,6) | Required; usable for simple bounding-box queries |
| dropoffLat/dropoffLng | DECIMAL(9,6) | Required |
| pickupLocation/dropoffLocation | geography(Point,4326) | Nullable; enables PostGIS proximity queries |
| requestedAt/acceptedAt/... | TIMESTAMP | Lifecycle timestamps |
| fareCents | INT | |
| currency | CHAR(3) | Default `USD` |
| createdAt/updatedAt | TIMESTAMP | |

### Key indexes

- `Ride_status_requestedAt_idx` for operational queues.
- `Ride_pickupLocation_gist` / `Ride_dropoffLocation_gist` for geospatial search.

## Payment

A single payment for a ride.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| rideId | UUID | Unique FK → `Ride.id` (cascade delete) |
| payerId | UUID | FK → `User.id` |
| provider | PaymentProvider | `STRIPE`/`CASH`/`OTHER` |
| status | PaymentStatus | `PENDING`/`AUTHORIZED`/`CAPTURED`/`FAILED`/`REFUNDED` |
| amountCents | INT | |
| currency | CHAR(3) | Default `USD` |
| createdAt/updatedAt | TIMESTAMP | |

## Transaction

Ledger-like entries associated with a payment (charge/refund/payout).

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| paymentId | UUID | FK → `Payment.id` (cascade delete) |
| type | TransactionType | `CHARGE`/`REFUND`/`PAYOUT` |
| status | TransactionStatus | `PENDING`/`SUCCEEDED`/`FAILED` |
| providerRef | TEXT | Nullable unique external reference |
| amountCents | INT | |
| createdAt | TIMESTAMP | |

## Notification

A message delivered to a user.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → `User.id` (cascade delete) |
| type | NotificationType | `RIDE_STATUS`/`PAYMENT`/`SYSTEM` |
| channel | NotificationChannel | `PUSH`/`EMAIL`/`SMS` |
| title/body | TEXT | |
| readAt | TIMESTAMP | Nullable |
| createdAt | TIMESTAMP | |

## Rating

Ratings tied to a ride. Uniqueness is enforced per `(rideId, raterUserId)`.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| rideId | UUID | FK → `Ride.id` (cascade delete) |
| raterUserId | UUID | FK → `User.id` |
| rateeUserId | UUID | FK → `User.id` |
| score | INT | 1–5 (application enforced) |
| comment | TEXT | Nullable |
| createdAt | TIMESTAMP | |
