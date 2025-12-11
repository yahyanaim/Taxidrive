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

## License

ISC
