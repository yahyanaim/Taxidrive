# Entity Relationship Diagram (ERD)

```mermaid
erDiagram
  User {
    uuid id PK
    text email UK
    text phone UK
    text name
    enum role
    timestamp createdAt
    timestamp updatedAt
  }

  DriverProfile {
    uuid id PK
    uuid userId UK
    text licenseNumber UK
    enum status
    text bio
    timestamp createdAt
    timestamp updatedAt
  }

  Vehicle {
    uuid id PK
    uuid driverProfileId FK
    text make
    text model
    int year
    text plateNumber UK
    text color
    boolean isActive
    timestamp createdAt
    timestamp updatedAt
  }

  Ride {
    uuid id PK
    uuid riderId FK
    uuid driverProfileId FK
    uuid vehicleId FK
    enum status
    text pickupAddress
    text dropoffAddress
    decimal pickupLat
    decimal pickupLng
    decimal dropoffLat
    decimal dropoffLng
    geography pickupLocation
    geography dropoffLocation
    timestamp requestedAt
    timestamp acceptedAt
    timestamp startedAt
    timestamp completedAt
    timestamp canceledAt
    int fareCents
    char currency
    timestamp createdAt
    timestamp updatedAt
  }

  Payment {
    uuid id PK
    uuid rideId UK, FK
    uuid payerId FK
    enum provider
    enum status
    int amountCents
    char currency
    timestamp createdAt
    timestamp updatedAt
  }

  Transaction {
    uuid id PK
    uuid paymentId FK
    enum type
    enum status
    text providerRef UK
    int amountCents
    timestamp createdAt
  }

  Notification {
    uuid id PK
    uuid userId FK
    enum type
    enum channel
    text title
    text body
    timestamp readAt
    timestamp createdAt
  }

  Rating {
    uuid id PK
    uuid rideId FK
    uuid raterUserId FK
    uuid rateeUserId FK
    int score
    text comment
    timestamp createdAt
  }

  User ||--o| DriverProfile : "has"
  DriverProfile ||--o{ Vehicle : "owns"

  User ||--o{ Ride : "rider"
  DriverProfile ||--o{ Ride : "driver"
  Vehicle ||--o{ Ride : "vehicle"

  Ride ||--o| Payment : "payment"
  Payment ||--o{ Transaction : "transactions"

  User ||--o{ Notification : "receives"

  Ride ||--o{ Rating : "ratings"
  User ||--o{ Rating : "given"
  User ||--o{ Rating : "received"
```

## Notes

- `Ride.pickupLocation`/`dropoffLocation` are PostGIS `geography(Point,4326)` columns (nullable) used to support geospatial queries (e.g., `ST_DWithin`).
- UUIDs are generated using `pgcrypto` (`gen_random_uuid()`).
