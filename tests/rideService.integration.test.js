const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const User = require('../models/User');
const rideService = require('../services/rideService');
const { RIDE_STATES } = require('../utils/rideStateMachine');

// Setup and teardown
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/taxidrive-test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear database before each test
  await User.deleteMany({});
  await Ride.deleteMany({});
});

describe('Ride Service Integration Tests', () => {
  let rider, driver;

  beforeEach(async () => {
    // Create test users
    rider = await User.create({
      name: 'Test Rider',
      email: 'rider@test.com',
      password: 'password123',
      role: 'rider',
      phone: '1234567890',
    });

    driver = await User.create({
      name: 'Test Driver',
      email: 'driver@test.com',
      password: 'password123',
      role: 'driver',
      phone: '0987654321',
      isAvailable: true,
      currentLocation: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128], // NYC
      },
    });
  });

  describe('createRideRequest', () => {
    test('should create a ride request successfully', async () => {
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      const ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      expect(ride).toBeDefined();
      expect(ride.riderId.toString()).toBe(rider._id.toString());
      expect(ride.status).toBe(RIDE_STATES.REQUESTED);
      expect(ride.fare).toBeDefined();
      expect(ride.fare.totalFare).toBeGreaterThan(0);
      expect(ride.eta).toBeDefined();
    });

    test('should include fare calculation in ride request', async () => {
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      const ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'premium',
        'cash'
      );

      expect(ride.fare.baseFare).toBeGreaterThan(0);
      expect(ride.fare.distanceFare).toBeGreaterThan(0);
      expect(ride.fare.timeFare).toBeGreaterThan(0);
    });
  });

  describe('acceptRide', () => {
    let ride;

    beforeEach(async () => {
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      ride.driverId = driver._id;
      await ride.save();
    });

    test('should accept a ride successfully', async () => {
      const updatedRide = await rideService.acceptRide(ride._id, driver._id);

      expect(updatedRide.status).toBe(RIDE_STATES.ACCEPTED);
      expect(updatedRide.acceptedAt).toBeDefined();

      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.isAvailable).toBe(false);
    });

    test('should not accept ride if driver is not assigned', async () => {
      ride.driverId = undefined;
      await ride.save();

      const otherId = new mongoose.Types.ObjectId();

      await expect(rideService.acceptRide(ride._id, otherId)).rejects.toThrow();
    });
  });

  describe('startRide', () => {
    let ride;

    beforeEach(async () => {
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      ride.driverId = driver._id;
      ride.status = RIDE_STATES.ACCEPTED;
      ride.acceptedAt = new Date();
      await ride.save();
    });

    test('should start a ride successfully', async () => {
      const updatedRide = await rideService.startRide(ride._id, driver._id);

      expect(updatedRide.status).toBe(RIDE_STATES.IN_PROGRESS);
      expect(updatedRide.startedAt).toBeDefined();
    });

    test('should fail if invalid state transition', async () => {
      ride.status = RIDE_STATES.COMPLETED;
      await ride.save();

      await expect(rideService.startRide(ride._id, driver._id)).rejects.toThrow();
    });
  });

  describe('completeRide', () => {
    let ride;

    beforeEach(async () => {
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      ride.driverId = driver._id;
      ride.status = RIDE_STATES.IN_PROGRESS;
      ride.acceptedAt = new Date();
      ride.startedAt = new Date();
      await ride.save();
    });

    test('should complete a ride successfully', async () => {
      const updatedRide = await rideService.completeRide(ride._id, driver._id);

      expect(updatedRide.status).toBe(RIDE_STATES.COMPLETED);
      expect(updatedRide.completedAt).toBeDefined();
      expect(updatedRide.payment.status).toBe('completed');

      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.isAvailable).toBe(true);
    });
  });

  describe('cancelRide', () => {
    let ride;

    beforeEach(async () => {
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      ride.driverId = driver._id;
      await ride.save();
    });

    test('should cancel a ride by rider', async () => {
      const cancelledRide = await rideService.cancelRide(
        ride._id,
        'rider',
        'Changed my mind'
      );

      expect(cancelledRide.status).toBe(RIDE_STATES.CANCELLED);
      expect(cancelledRide.cancelledBy).toBe('rider');
      expect(cancelledRide.cancellationReason).toBe('Changed my mind');

      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.isAvailable).toBe(true);
    });

    test('should cancel a ride by driver', async () => {
      const cancelledRide = await rideService.cancelRide(
        ride._id,
        'driver',
        'Emergency'
      );

      expect(cancelledRide.status).toBe(RIDE_STATES.CANCELLED);
      expect(cancelledRide.cancelledBy).toBe('driver');
    });

    test('should not cancel completed ride', async () => {
      ride.status = RIDE_STATES.COMPLETED;
      await ride.save();

      await expect(
        rideService.cancelRide(ride._id, 'rider', 'Too late')
      ).rejects.toThrow();
    });
  });

  describe('Full Ride Lifecycle', () => {
    test('should complete full ride lifecycle: requested -> accepted -> in_progress -> completed', async () => {
      // Create ride request
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      let ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      expect(ride.status).toBe(RIDE_STATES.REQUESTED);

      // Assign driver
      ride.driverId = driver._id;
      await ride.save();

      // Accept ride
      ride = await rideService.acceptRide(ride._id, driver._id);
      expect(ride.status).toBe(RIDE_STATES.ACCEPTED);

      // Start ride
      ride = await rideService.startRide(ride._id, driver._id);
      expect(ride.status).toBe(RIDE_STATES.IN_PROGRESS);

      // Complete ride
      ride = await rideService.completeRide(ride._id, driver._id);
      expect(ride.status).toBe(RIDE_STATES.COMPLETED);
      expect(ride.completedAt).toBeDefined();
    });

    test('should handle cancellation at different stages', async () => {
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      // Test cancellation during requested state
      let ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      ride = await rideService.cancelRide(ride._id, 'rider', 'Changed mind');
      expect(ride.status).toBe(RIDE_STATES.CANCELLED);

      // Test cancellation during accepted state
      ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      ride.driverId = driver._id;
      await ride.save();

      ride = await rideService.acceptRide(ride._id, driver._id);
      ride = await rideService.cancelRide(ride._id, 'driver', 'Engine problem');
      expect(ride.status).toBe(RIDE_STATES.CANCELLED);
    });
  });

  describe('rateRide', () => {
    let ride;

    beforeEach(async () => {
      const pickupData = {
        address: '123 Main St, NYC',
        coordinates: [-74.006, 40.7128],
      };

      const dropoffData = {
        address: '456 Park Ave, NYC',
        coordinates: [-74.0015, 40.7489],
      };

      ride = await rideService.createRideRequest(
        rider._id,
        pickupData,
        dropoffData,
        'economy',
        'card'
      );

      ride.driverId = driver._id;
      ride.status = RIDE_STATES.COMPLETED;
      ride.completedAt = new Date();
      await ride.save();
    });

    test('should rate a completed ride', async () => {
      const ratedRide = await rideService.rateRide(ride._id, 5, 'Great driver!', 'rider');

      expect(ratedRide.rating.value).toBe(5);
      expect(ratedRide.rating.comment).toBe('Great driver!');
      expect(ratedRide.rating.ratedBy).toBe('rider');
      expect(ratedRide.rating.ratedAt).toBeDefined();
    });

    test('should not rate non-completed ride', async () => {
      ride.status = RIDE_STATES.IN_PROGRESS;
      await ride.save();

      await expect(
        rideService.rateRide(ride._id, 4, 'Good ride', 'rider')
      ).rejects.toThrow();
    });
  });
});
