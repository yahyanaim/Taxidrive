# API Testing Examples

This document contains cURL examples and Socket.io client code for testing the complete ride lifecycle.

## Prerequisites

1. Server running on `http://localhost:5000`
2. MongoDB running on `mongodb://localhost:27017`
3. Valid JWT token (mock JWT for testing)

## Creating Test Users

For testing, you'll need to create users manually or extend the API with user registration.

### Example Test Setup (Using Mock Token)

For testing purposes, use a JWT token like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtcmlkZXItMTIzIiwicm9sZSI6InJpZGVyIn0.signature
```

## Full Ride Lifecycle

### Step 1: Request a Ride

```bash
curl -X POST http://localhost:5000/api/rides \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup": {
      "address": "123 Main Street, New York, NY",
      "coordinates": [-74.0060, 40.7128]
    },
    "dropoff": {
      "address": "456 Park Avenue, New York, NY",
      "coordinates": [-74.0015, 40.7489]
    },
    "vehicleType": "economy",
    "paymentMethod": "card"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ride123abc",
    "riderId": "rider-user-id",
    "status": "requested",
    "pickup": {
      "address": "123 Main Street, New York, NY",
      "location": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128]
      }
    },
    "dropoff": {
      "address": "456 Park Avenue, New York, NY",
      "location": {
        "type": "Point",
        "coordinates": [-74.0015, 40.7489]
      }
    },
    "fare": {
      "baseFare": 2.50,
      "distanceFare": 4.32,
      "timeFare": 3.50,
      "totalFare": 10.32,
      "surgePricing": {
        "multiplier": 1.0
      }
    },
    "eta": {
      "pickupETA": 300,
      "dropoffETA": 900
    },
    "distance": {
      "value": 3464,
      "text": "3.46 km"
    },
    "duration": {
      "value": 600,
      "text": "10 min"
    }
  }
}
```

### Step 2: Driver Becomes Available

```bash
curl -X POST http://localhost:5000/api/drivers/available \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [-74.0070, 40.7150]
  }'
```

### Step 3: Driver Accepts the Ride

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/accept \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ride123abc",
    "status": "accepted",
    "acceptedAt": "2024-01-15T10:30:00Z",
    "driverId": "driver-user-id"
  }
}
```

### Step 4: Driver Starts the Ride

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/start \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ride123abc",
    "status": "in_progress",
    "startedAt": "2024-01-15T10:35:00Z"
  }
}
```

### Step 5: Update Driver Location During Ride

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/location \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [-74.0065, 40.7160],
    "accuracy": 5,
    "speed": 12.5,
    "heading": 90
  }'
```

### Step 6: Complete the Ride

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/complete \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ride123abc",
    "status": "completed",
    "completedAt": "2024-01-15T10:45:00Z",
    "payment": {
      "status": "completed"
    }
  }
}
```

### Step 7: Rate the Ride

#### Rider rates driver:
```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/rate \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent driver, very professional!"
  }'
```

#### Driver rates rider:
```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/rate \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Good rider, respectful."
  }'
```

## Socket.io Client Examples

### Client Setup (JavaScript)

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Join user's personal room
socket.emit('user:join', {
  userId: 'rider-user-123',
  role: 'rider'
});

// Listen for real-time updates
socket.on('ride:accepted', (data) => {
  console.log('Driver accepted your ride:', data);
});

socket.on('driver:location_updated', (data) => {
  console.log('Driver location updated:', data);
});

socket.on('ride:completed', (data) => {
  console.log('Ride completed. Fare: $' + data.fare.totalFare);
});
```

### Rider Flow (Socket.io)

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

// Step 1: Join user room
socket.emit('user:join', {
  userId: 'rider-123',
  role: 'rider'
});

// Step 2: Request a ride
socket.emit('ride:request', {
  riderId: 'rider-123',
  pickup: {
    address: '123 Main St',
    coordinates: [-74.0060, 40.7128]
  },
  dropoff: {
    address: '456 Park Ave',
    coordinates: [-74.0015, 40.7489]
  },
  vehicleType: 'economy',
  paymentMethod: 'card'
});

// Step 3: Listen for acceptance
socket.on('ride:accepted', (data) => {
  console.log('Driver accepted!', data);
  const rideId = data.rideId;
  const driverId = data.driverId;

  // Get driver location updates
  socket.on('driver:location_updated', (location) => {
    console.log('Driver location:', location);
    // Update map with driver marker
  });
});

// Step 4: Listen for completion
socket.on('ride:completed', (data) => {
  console.log('Ride completed!');
  console.log('Total fare: $' + data.fare.totalFare);

  // Step 5: Rate the ride
  socket.emit('ride:rate', {
    rideId: data.rideId,
    rating: 5,
    comment: 'Great driver!'
  });
});

// Listen for cancellation
socket.on('ride:cancelled', (data) => {
  console.log('Ride cancelled:', data.reason);
});

// Handle errors
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### Driver Flow (Socket.io)

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

// Step 1: Join user room and become available
socket.emit('user:join', {
  userId: 'driver-456',
  role: 'driver'
});

socket.emit('driver:available', {
  driverId: 'driver-456',
  coordinates: [-74.0070, 40.7150]
});

// Step 2: Listen for new ride requests
socket.on('ride:new_request', (ride) => {
  console.log('New ride request!');
  console.log('From:', ride.pickup.address);
  console.log('To:', ride.dropoff.address);
  console.log('Estimated fare: $' + ride.fare.totalFare);
  console.log('ETA to pickup: ' + ride.eta.pickupETA + ' seconds');

  // Step 3: Accept the ride
  socket.emit('ride:accept', {
    rideId: ride.rideId,
    driverId: 'driver-456'
  });
});

// Listen for acceptance confirmation
socket.on('ride:accepted_confirmed', (data) => {
  console.log('Ride accepted successfully!');
  const rideId = data.rideId;

  // Step 4: Start sending location updates
  const locationInterval = setInterval(() => {
    // Simulate location update (in real app, get from GPS)
    socket.emit('driver:location_update', {
      driverId: 'driver-456',
      coordinates: [-74.0065 + Math.random() * 0.0001, 40.7160 + Math.random() * 0.0001],
      accuracy: 5,
      speed: 12.5,
      heading: 90
    });
  }, 5000); // Every 5 seconds

  // Step 5: Start the ride when at pickup location
  setTimeout(() => {
    socket.emit('ride:start', {
      rideId: rideId,
      driverId: 'driver-456'
    });
  }, 30000); // After 30 seconds

  // Step 6: Complete the ride when at dropoff location
  setTimeout(() => {
    clearInterval(locationInterval);
    socket.emit('ride:complete', {
      rideId: rideId,
      driverId: 'driver-456'
    });
  }, 60000); // After 60 seconds total
});

// Listen for ride completion
socket.on('ride:completed_confirmed', (data) => {
  console.log('Ride completed!');
  // Driver is now available for next ride
  socket.emit('driver:available', {
    driverId: 'driver-456',
    coordinates: [-74.0065, 40.7160]
  });
});

// Handle ride decline
socket.on('ride:new_request', (ride) => {
  // Later, if want to decline
  socket.emit('ride:decline', {
    rideId: ride.rideId,
    driverId: 'driver-456'
  });
});

// Listen for unavailability confirmation
socket.on('ride:declined_confirmed', (data) => {
  console.log('Ride declined');
  // Wait for next request
});

// Become unavailable when leaving
socket.emit('driver:unavailable', {
  driverId: 'driver-456'
});
```

## Cancellation Examples

### Rider Cancels Before Driver Accepts

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/cancel \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Found another ride"
  }'
```

### Driver Cancels After Accepting

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/cancel \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Vehicle emergency"
  }'
```

### Socket.io Cancellation

```javascript
socket.emit('ride:cancel', {
  rideId: 'ride123abc',
  reason: 'User requested cancellation'
});

socket.on('ride:cancelled_confirmed', (data) => {
  console.log('Cancellation confirmed');
});
```

## Ride History

### Get Rider History

```bash
curl http://localhost:5000/api/rides/history/rider?limit=10&offset=0 \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN"
```

### Get Driver History

```bash
curl http://localhost:5000/api/rides/history/driver?limit=10&offset=0 \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"
```

## Error Scenarios

### Invalid State Transition

Attempting to start a ride that hasn't been accepted:

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/start \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid transition from requested to in_progress"
}
```

### Rating Non-Completed Ride

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/rate \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

**Response:**
```json
{
  "success": false,
  "message": "Can only rate completed rides"
}
```

### Invalid Rating Value

```bash
curl -X POST http://localhost:5000/api/rides/ride123abc/rate \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 10}'
```

**Response:**
```json
{
  "success": false,
  "message": "Rating must be between 1 and 5"
}
```

## Testing with Postman

1. Create a new Postman collection
2. Set base URL: `{{baseUrl}}/api`
3. Add environment variable: `baseUrl = http://localhost:5000`
4. Add authorization header with Bearer token
5. Import the cURL examples above

## Live Map Integration Testing

To test with a live map component:

```javascript
// Initialize map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.0060, 40.7128],
  zoom: 12
});

// Update map when driver location changes
socket.on('driver:location_updated', (data) => {
  // Remove old marker
  if (driverMarker) driverMarker.remove();

  // Add new marker
  driverMarker = new mapboxgl.Marker({ color: 'blue' })
    .setLngLat(data.coordinates)
    .addTo(map);
});

// Draw route when ride accepted
socket.on('ride:accepted', (data) => {
  // Add route layer to map
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: data.route
      }
    }
  });

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#4285F4',
      'line-width': 4
    }
  });
});
```

## Notes

- Replace `YOUR_RIDER_TOKEN` and `YOUR_DRIVER_TOKEN` with actual JWT tokens
- Coordinates are in [longitude, latitude] format (GeoJSON standard)
- All timestamps are in ISO 8601 format
- Distances are in meters, durations in seconds
- Prices are in USD
