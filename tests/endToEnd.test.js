/**
 * End-to-End Integration Test
 * Demonstrates the complete ride lifecycle from request to completion
 * This simulates two browsers: one for rider, one for driver
 */

const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const User = require('../models/User');
const LocationBreadcrumb = require('../models/LocationBreadcrumb');
const rideService = require('../services/rideService');
const { RIDE_STATES } = require('../utils/rideStateMachine');
const { calculateFare } = require('../utils/fareCalculator');

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/taxidrive-test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Ride.deleteMany({});
  await LocationBreadcrumb.deleteMany({});
});

describe('End-to-End Ride Lifecycle (Rider & Driver)', () => {
  let rider, driver;

  beforeEach(async () => {
    // Browser 1: Rider
    rider = await User.create({
      name: 'John Rider',
      email: 'rider@example.com',
      password: 'hashed_password',
      role: 'rider',
      phone: '+1234567890',
      profilePicture: 'https://example.com/rider.jpg',
      rating: 5.0,
    });

    // Browser 2: Driver
    driver = await User.create({
      name: 'Jane Driver',
      email: 'driver@example.com',
      password: 'hashed_password',
      role: 'driver',
      phone: '+1098765432',
      licenseNumber: 'DL123456',
      vehicleType: 'economy',
      vehicleNumber: 'XYZ-1234',
      vehicleColor: 'silver',
      currentLocation: {
        type: 'Point',
        coordinates: [-74.0070, 40.7150], // Near pickup location
      },
      isAvailable: true,
      rating: 5.0,
    });
  });

  describe('Complete Ride Lifecycle', () => {
    test('should complete full ride lifecycle: request -> accept -> start -> complete -> rate', async () => {
      // ========================================
      // BROWSER 1: RIDER - Request a Ride
      // ========================================

      const pickupLocation = {
        address: 'Grand Central Terminal, New York, NY',
        coordinates: [-73.9776, 40.7527],
      };

      const dropoffLocation = {
        address: 'Times Square, New York, NY',
        coordinates: [-73.9857, 40.7580],
      };

      let ride = await rideService.createRideRequest(
        rider._id,
        pickupLocation,
        dropoffLocation,
        'economy',
        'card'
      );

      expect(ride.status).toBe(RIDE_STATES.REQUESTED);
      expect(ride.riderId.toString()).toBe(rider._id.toString());
      expect(ride.fare).toBeDefined();
      expect(ride.fare.totalFare).toBeGreaterThan(0);
      expect(ride.distance).toBeDefined();
      expect(ride.eta).toBeDefined();

      const rideId = ride._id;

      // ========================================
      // DRIVER: Search for Nearby Rides
      // ========================================

      // Simulate driver availability check
      const requestedRides = await Ride.find({ status: RIDE_STATES.REQUESTED });
      expect(requestedRides.length).toBeGreaterThan(0);

      // Assign the ride to the driver
      ride.driverId = driver._id;
      await ride.save();

      // ========================================
      // BROWSER 2: DRIVER - Accept the Ride
      // ========================================

      ride = await rideService.acceptRide(rideId, driver._id);

      expect(ride.status).toBe(RIDE_STATES.ACCEPTED);
      expect(ride.acceptedAt).toBeDefined();
      expect(ride.driverId.toString()).toBe(driver._id.toString());

      // Verify driver is now unavailable
      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.isAvailable).toBe(false);

      // ========================================
      // BROWSER 1: RIDER - Sees Driver Accepted
      // ========================================

      const riderViewOfRide = await Ride.findById(rideId).populate(
        'driverId',
        'name email phone profilePicture vehicleType vehicleNumber'
      );

      expect(riderViewOfRide.status).toBe(RIDE_STATES.ACCEPTED);
      expect(riderViewOfRide.driverId.name).toBe('Jane Driver');

      // ========================================
      // BROWSER 2: DRIVER - Update Location (Heading to Pickup)
      // ========================================

      // Driver sends location updates as they drive
      const locationUpdates = [
        [-74.0060, 40.7128],
        [-74.0055, 40.7200],
        [-74.0050, 40.7400],
        [-73.9776, 40.7527], // At pickup location
      ];

      for (const coordinates of locationUpdates) {
        await rideService.updateDriverLocation(
          driver._id,
          coordinates,
          5, // accuracy in meters
          15.5, // speed in m/s
          45 // heading in degrees
        );
      }

      // Verify breadcrumbs were created
      const breadcrumbs = await LocationBreadcrumb.find({ driverId: driver._id });
      expect(breadcrumbs.length).toBeGreaterThan(0);

      // ========================================
      // BROWSER 2: DRIVER - Start the Ride
      // ========================================

      ride = await rideService.startRide(rideId, driver._id);

      expect(ride.status).toBe(RIDE_STATES.IN_PROGRESS);
      expect(ride.startedAt).toBeDefined();

      // Update driver's current ride
      await User.findByIdAndUpdate(driver._id, { currentRideId: rideId });

      // ========================================
      // BROWSER 1: RIDER - Sees Ride Started
      // ========================================

      const riderUpdate = await Ride.findById(rideId);
      expect(riderUpdate.status).toBe(RIDE_STATES.IN_PROGRESS);

      // ========================================
      // BROWSER 2: DRIVER - Continue Sending Location Updates
      // ========================================

      // Driver is now en route to dropoff
      const enRouteUpdates = [
        [-73.9857, 40.7480],
        [-73.9857, 40.7530],
        [-73.9857, 40.7580], // At dropoff location
      ];

      for (const coordinates of enRouteUpdates) {
        await rideService.updateDriverLocation(
          driver._id,
          coordinates,
          5,
          20.0, // Higher speed
          45
        );

        // Verify breadcrumb was created during active ride
        const rideCheckUpdates = await LocationBreadcrumb.find({ rideId });
        if (coordinates === enRouteUpdates[enRouteUpdates.length - 1]) {
          expect(rideCheckUpdates.length).toBeGreaterThan(0);
        }
      }

      // ========================================
      // BROWSER 2: DRIVER - Complete the Ride
      // ========================================

      ride = await rideService.completeRide(rideId, driver._id);

      expect(ride.status).toBe(RIDE_STATES.COMPLETED);
      expect(ride.completedAt).toBeDefined();
      expect(ride.payment.status).toBe('completed');

      // Verify driver is now available again
      const availableDriver = await User.findById(driver._id);
      expect(availableDriver.isAvailable).toBe(true);
      expect(availableDriver.currentRideId).toBeNull();

      // ========================================
      // BROWSER 1: RIDER - Sees Ride Completed
      // ========================================

      const completedRide = await Ride.findById(rideId);
      expect(completedRide.status).toBe(RIDE_STATES.COMPLETED);

      // ========================================
      // BROWSER 1: RIDER - Rate the Driver
      // ========================================

      ride = await rideService.rateRide(rideId, 5, 'Excellent driver!', 'rider');

      expect(ride.rating.value).toBe(5);
      expect(ride.rating.comment).toBe('Excellent driver!');
      expect(ride.rating.ratedBy).toBe('rider');

      // ========================================
      // BROWSER 2: DRIVER - Rate the Rider
      // ========================================

      ride = await rideService.rateRide(rideId, 4, 'Great passenger', 'driver');

      expect(ride.rating.value).toBe(4);
      expect(ride.rating.comment).toBe('Great passenger');
      expect(ride.rating.ratedBy).toBe('driver');

      // ========================================
      // Final State Verification
      // ========================================

      const finalRide = await Ride.findById(rideId)
        .populate('riderId', 'name email rating')
        .populate('driverId', 'name email rating');

      expect(finalRide.status).toBe(RIDE_STATES.COMPLETED);
      expect(finalRide.riderId.name).toBe('John Rider');
      expect(finalRide.driverId.name).toBe('Jane Driver');
      expect(finalRide.rating.value).toBe(4);

      // Verify fare was calculated
      expect(finalRide.fare.baseFare).toBeGreaterThan(0);
      expect(finalRide.fare.distanceFare).toBeGreaterThan(0);
      expect(finalRide.fare.totalFare).toBeGreaterThan(0);

      // Verify route was tracked
      expect(finalRide.route.length).toBeGreaterThan(0);

      console.log('✓ Complete ride lifecycle successful');
      console.log(`  Total fare: $${finalRide.fare.totalFare.toFixed(2)}`);
      console.log(`  Distance: ${finalRide.distance.text}`);
      console.log(`  Duration: ${finalRide.duration.text}`);
    });

    test('should handle cancellation by rider during requested state', async () => {
      // Rider requests a ride
      let ride = await rideService.createRideRequest(
        rider._id,
        {
          address: 'Location A',
          coordinates: [-74.006, 40.7128],
        },
        {
          address: 'Location B',
          coordinates: [-74.0015, 40.7489],
        },
        'economy',
        'card'
      );

      const rideId = ride._id;
      expect(ride.status).toBe(RIDE_STATES.REQUESTED);

      // Rider changes mind and cancels
      ride = await rideService.cancelRide(rideId, 'rider', 'Found another ride');

      expect(ride.status).toBe(RIDE_STATES.CANCELLED);
      expect(ride.cancelledBy).toBe('rider');
      expect(ride.cancellationReason).toBe('Found another ride');
    });

    test('should handle cancellation by driver after accepting', async () => {
      // Setup: Rider requests, driver accepts
      let ride = await rideService.createRideRequest(
        rider._id,
        {
          address: 'Location A',
          coordinates: [-74.006, 40.7128],
        },
        {
          address: 'Location B',
          coordinates: [-74.0015, 40.7489],
        },
        'economy',
        'card'
      );

      ride.driverId = driver._id;
      await ride.save();

      ride = await rideService.acceptRide(ride._id, driver._id);
      expect(ride.status).toBe(RIDE_STATES.ACCEPTED);

      const rideId = ride._id;

      // Driver has emergency and cancels
      ride = await rideService.cancelRide(rideId, 'driver', 'Vehicle emergency');

      expect(ride.status).toBe(RIDE_STATES.CANCELLED);
      expect(ride.cancelledBy).toBe('driver');

      // Driver should be available again
      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.isAvailable).toBe(true);
    });

    test('should track ride history for both rider and driver', async () => {
      // Create and complete multiple rides
      for (let i = 0; i < 3; i++) {
        let ride = await rideService.createRideRequest(
          rider._id,
          {
            address: `Pickup ${i}`,
            coordinates: [-74.006 + i * 0.001, 40.7128],
          },
          {
            address: `Dropoff ${i}`,
            coordinates: [-74.0015 + i * 0.001, 40.7489],
          },
          'economy',
          'card'
        );

        ride.driverId = driver._id;
        ride = await ride.save();

        ride = await rideService.acceptRide(ride._id, driver._id);
        ride = await rideService.startRide(ride._id, driver._id);
        ride = await rideService.completeRide(ride._id, driver._id);
      }

      // Get rider history
      const riderHistory = await rideService.getRiderHistory(rider._id);
      expect(riderHistory.rides.length).toBe(3);
      expect(riderHistory.total).toBe(3);

      // Get driver history
      const driverHistory = await rideService.getDriverHistory(driver._id);
      expect(driverHistory.rides.length).toBe(3);
      expect(driverHistory.total).toBe(3);

      // Verify pagination works
      const riderHistoryPage1 = await rideService.getRiderHistory(rider._id, 2, 0);
      expect(riderHistoryPage1.rides.length).toBe(2);
      expect(riderHistoryPage1.limit).toBe(2);
      expect(riderHistoryPage1.offset).toBe(0);

      const riderHistoryPage2 = await rideService.getRiderHistory(rider._id, 2, 2);
      expect(riderHistoryPage2.rides.length).toBe(1);
    });

    test('should calculate accurate fare with surge pricing', async () => {
      // Simulate high demand scenario
      // Create multiple pending rides to trigger surge
      for (let i = 0; i < 5; i++) {
        await rideService.createRideRequest(
          new mongoose.Types.ObjectId(),
          {
            address: `Pickup ${i}`,
            coordinates: [-74.006, 40.7128],
          },
          {
            address: `Dropoff ${i}`,
            coordinates: [-74.0015, 40.7489],
          },
          'economy',
          'card'
        );
      }

      // Create a new ride request
      const ride = await rideService.createRideRequest(
        rider._id,
        {
          address: 'Downtown',
          coordinates: [-74.006, 40.7128],
        },
        {
          address: 'Uptown',
          coordinates: [-74.0015, 40.7489],
        },
        'premium',
        'card'
      );

      expect(ride.fare).toBeDefined();
      expect(ride.fare.baseFare).toBeGreaterThan(0);
      expect(ride.fare.distanceFare).toBeGreaterThan(0);
      expect(ride.fare.timeFare).toBeGreaterThan(0);
      expect(ride.fare.totalFare).toBeGreaterThan(0);

      // Premium should have higher fare than economy
      const economyFare = calculateFare(
        ride.distance.value,
        ride.duration.value,
        'economy'
      );
      expect(ride.fare.totalFare).toBeGreaterThan(economyFare.totalFare);
    });
  });

  describe('Map Integration Testing', () => {
    test('should include route visualization data', async () => {
      const ride = await rideService.createRideRequest(
        rider._id,
        {
          address: 'Grand Central Terminal',
          coordinates: [-73.9776, 40.7527],
        },
        {
          address: 'Times Square',
          coordinates: [-73.9857, 40.7580],
        },
        'economy',
        'card'
      );

      // Route should contain coordinates for visualization
      expect(ride.route).toBeDefined();
      expect(Array.isArray(ride.route)).toBe(true);

      // Each route point should have lat/lon
      ride.route.forEach((point) => {
        expect(point).toHaveProperty('latitude');
        expect(point).toHaveProperty('longitude');
        expect(point).toHaveProperty('timestamp');
      });
    });

    test('should track driver breadcrumbs for live map updates', async () => {
      // Create and start a ride
      let ride = await rideService.createRideRequest(
        rider._id,
        {
          address: 'Start',
          coordinates: [-73.9776, 40.7527],
        },
        {
          address: 'End',
          coordinates: [-73.9857, 40.7580],
        },
        'economy',
        'card'
      );

      ride.driverId = driver._id;
      await ride.save();

      ride = await rideService.acceptRide(ride._id, driver._id);
      await User.findByIdAndUpdate(driver._id, { currentRideId: ride._id });
      ride = await rideService.startRide(ride._id, driver._id);

      // Simulate driver moving along route
      const locations = [
        [-73.9776, 40.7527],
        [-73.9790, 40.7540],
        [-73.9810, 40.7560],
        [-73.9857, 40.7580],
      ];

      for (const coords of locations) {
        await rideService.updateDriverLocation(driver._id, coords, 5, 12.5, 90);
      }

      // Verify breadcrumbs were created
      const breadcrumbs = await LocationBreadcrumb.find({ rideId: ride._id });
      expect(breadcrumbs.length).toBeGreaterThan(0);

      // Verify breadcrumbs have location data for map rendering
      breadcrumbs.forEach((breadcrumb) => {
        expect(breadcrumb.location.coordinates).toBeDefined();
        expect(breadcrumb.location.coordinates.length).toBe(2);
        expect(breadcrumb.timestamp).toBeDefined();
      });
    });
  });
});
