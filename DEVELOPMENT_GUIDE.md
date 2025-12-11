# Development Guide

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB 4.0+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure MongoDB in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/taxidrive
MONGODB_TEST_URI=mongodb://localhost:27017/taxidrive-test
```

4. Generate or set JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Running the Application

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on `http://localhost:5000`

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- tests/rideStateMachine.test.js
npm test -- tests/fareCalculator.test.js
npm test -- tests/socketBasic.test.js
```

### Watch Mode
```bash
npm run test:watch
```

### Test Coverage
```bash
npm test -- --coverage
```

## Code Quality

### Linting
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

### Format Code
```bash
npm run format
```

## Project Structure

```
├── config/              # Database configuration
├── models/              # Mongoose schemas
│   ├── User.js         # User model (rider/driver)
│   ├── Ride.js         # Ride model with lifecycle
│   └── LocationBreadcrumb.js  # GPS tracking
├── services/            # Business logic layer
│   └── rideService.js  # Ride operations
├── controllers/         # HTTP request handlers
│   └── rideController.js
├── routes/              # API route definitions
│   └── rides.js
├── middleware/          # Express middleware
│   └── auth.js         # JWT authentication
├── utils/               # Utility functions
│   ├── rideStateMachine.js  # State transitions
│   ├── fareCalculator.js    # Fare logic
│   └── mappingService.js    # Mapbox integration
├── sockets/             # Socket.io handlers
│   └── rideSocket.js
├── tests/               # Test suites
│   ├── rideStateMachine.test.js
│   ├── fareCalculator.test.js
│   ├── socketBasic.test.js
│   ├── socketBroadcast.test.js  # (requires mocking)
│   ├── rideService.integration.test.js  # (requires DB)
│   └── endToEnd.test.js  # (requires DB)
├── server.js            # Express app entry point
├── jest.config.js       # Jest testing config
├── eslint.config.js     # ESLint configuration
└── package.json         # Dependencies
```

## Key Features

### 1. Ride State Machine
States: `requested` → `accepted` → `driver_arriving` → `in_progress` → `completed`

All states can transition to `cancelled`.

Enforced via `utils/rideStateMachine.js`

### 2. Fare Calculation
- Base fare: $2.50
- Distance: $1.25/mile
- Time: $0.35/minute
- Vehicle multiplier: economy(1.0x), premium(1.5x), xl(2.0x)
- Surge pricing: Based on demand/supply ratio

### 3. Real-time Socket.io Integration
**Rider Events:**
- `ride:request` - Request a ride
- `ride:cancel` - Cancel a ride
- `ride:rate` - Rate a completed ride

**Driver Events:**
- `driver:available` - Become available
- `driver:unavailable` - Stop accepting rides
- `ride:accept` - Accept a ride
- `ride:decline` - Decline a ride
- `driver:location_update` - Send GPS updates
- `ride:start` - Start a ride
- `ride:complete` - Complete a ride

### 4. Location Tracking
- Driver locations updated in real-time
- Location breadcrumbs persisted to MongoDB
- Auto-cleanup: Breadcrumbs deleted after 7 days (TTL index)
- Geospatial queries for finding nearby drivers

### 5. Authentication
- JWT token-based authentication
- Protected routes require valid token
- Passwords hashed with bcryptjs

## Common Development Tasks

### Adding a New Endpoint

1. **Create Controller Method** in `controllers/rideController.js`:
```javascript
const myNewEndpoint = async (req, res) => {
  try {
    // Implementation
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

2. **Add Route** in `routes/rides.js`:
```javascript
router.post('/my-endpoint', authMiddleware, myNewEndpoint);
```

3. **Add Tests** in `tests/`:
```javascript
test('should handle my new endpoint', () => {
  // Test logic
});
```

### Adding a New Socket Event

1. **Add Handler** in `sockets/rideSocket.js`:
```javascript
socket.on('my:event', async (data) => {
  try {
    // Implementation
    socket.emit('my:event_confirmed', { success: true });
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
});
```

2. **Add Test** in `tests/socketBasic.test.js`:
```javascript
test('should handle my:event', () => {
  // Test logic
});
```

### Adding a New Database Model

1. **Create Schema** in `models/MyModel.js`:
```javascript
const mySchema = new mongoose.Schema({
  field1: String,
  field2: { type: Number, required: true },
});

module.exports = mongoose.model('MyModel', mySchema);
```

2. **Add Service Methods** in `services/` if needed

3. **Add Tests** for model validation

## Debugging

### Enable MongoDB Logging
```bash
NODE_DEBUG=mongodb npm run dev
```

### View Socket.io Events
Socket.io automatically logs connections and errors. You can add custom logging:
```javascript
socket.on('my:event', (data) => {
  console.log('Received event:', data);
});
```

### Use Node Debugger
```bash
node --inspect server.js
```
Then open Chrome DevTools: `chrome://inspect`

## Database Migrations

To reset test database:
```bash
mongo taxidrive-test --eval "db.dropDatabase()"
```

To backup production database:
```bash
mongodump --uri "mongodb://localhost:27017/taxidrive" --out ./backup
```

## Performance Tips

1. **Use Indexes** for frequently queried fields:
```javascript
schema.index({ fieldName: 1 });
```

2. **Pagination** for large result sets:
```javascript
const rides = await Ride.find()
  .skip(offset)
  .limit(limit)
  .lean(); // Use lean() for read-only queries
```

3. **Connection Pooling** is handled by Mongoose by default

4. **Cache** frequently accessed data (implement Redis if needed)

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET
- [ ] Configure MONGODB_URI for production DB
- [ ] Set MAPBOX_ACCESS_TOKEN
- [ ] Enable CORS for frontend domain
- [ ] Run `npm test` and ensure all pass
- [ ] Run `npm run lint` and fix warnings
- [ ] Review `.env` - no default secrets
- [ ] Enable HTTPS in production
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting
- [ ] Test Socket.io with actual WebSocket connections

## Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running and URI is correct

### Socket.io Connection Failures
```
Error: WebSocket is closed
```
Solution: Check CORS configuration and client-side connection parameters

### JWT Token Errors
```
Error: Invalid signature
```
Solution: Verify JWT_SECRET is consistent between server restarts

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution: Change PORT in .env or kill process using port 5000

## Contributing

1. Create feature branch: `git checkout -b feat/new-feature`
2. Make changes and test: `npm test`
3. Lint code: `npm run lint`
4. Commit with clear message: `git commit -m "feat: add new feature"`
5. Push and create pull request

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.io Documentation](https://socket.io/)
- [Jest Testing Documentation](https://jestjs.io/)
- [Mapbox API Documentation](https://docs.mapbox.com/)

## Support

For issues or questions, refer to the [README.md](./README.md) and [API_EXAMPLES.md](./API_EXAMPLES.md)
