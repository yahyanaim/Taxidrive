const Ride = require('../models/Ride');
const User = require('../models/User');
const LocationBreadcrumb = require('../models/LocationBreadcrumb');
const { isValidTransition, RIDE_STATES } = require('../utils/rideStateMachine');
const { calculateFare, calculateSurgeMultiplier } = require('../utils/fareCalculator');
const { getRoute, getETA } = require('../utils/mappingService');

/**
 * Create a new ride request
 */
const createRideRequest = async (riderId, pickupData, dropoffData, vehicleType, paymentMethod) => {
  try {
    const route = await getRoute(pickupData.coordinates, dropoffData.coordinates);
    const eta = await getETA(pickupData.coordinates, dropoffData.coordinates);

    // Calculate available drivers and waiting riders for surge pricing
    const availableDrivers = await User.countDocuments({
      role: 'driver',
      isAvailable: true,
    });
    const waitingRiders = await Ride.countDocuments({
      status: RIDE_STATES.REQUESTED,
    });

    const surgeMultiplier = calculateSurgeMultiplier(availableDrivers, waitingRiders);

    const fareData = calculateFare(
      route.distance.value,
      route.duration.value,
      vehicleType,
      surgeMultiplier
    );

    const ride = new Ride({
      riderId,
      status: RIDE_STATES.REQUESTED,
      pickup: {
        address: pickupData.address,
        location: {
          type: 'Point',
          coordinates: pickupData.coordinates,
        },
      },
      dropoff: {
        address: dropoffData.address,
        location: {
          type: 'Point',
          coordinates: dropoffData.coordinates,
        },
      },
      vehicleType,
      fare: {
        ...fareData,
        surgePricing: {
          multiplier: surgeMultiplier,
          reason: surgeMultiplier > 1 ? 'High demand' : null,
        },
      },
      eta,
      distance: route.distance,
      duration: route.duration,
      route: route.route,
      payment: {
        method: paymentMethod,
        status: 'pending',
      },
    });

    await ride.save();
    return ride;
  } catch (error) {
    throw new Error(`Failed to create ride request: ${error.message}`);
  }
};

/**
 * Find and assign nearest available driver to a ride
 */
const assignDriverToRide = async (rideId) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    // Find nearest available driver within 10km radius
    const nearbyDrivers = await User.find({
      role: 'driver',
      isAvailable: true,
      currentLocation: {
        $near: {
          $geometry: ride.pickup.location,
          $maxDistance: 10000, // 10km in meters
        },
      },
    }).limit(10);

    if (nearbyDrivers.length === 0) {
      throw new Error('No available drivers found');
    }

    // For now, assign to the first available driver
    // In production, could use more sophisticated matching
    const driver = nearbyDrivers[0];

    ride.driverId = driver._id;
    await ride.save();

    return ride;
  } catch (error) {
    throw new Error(`Failed to assign driver: ${error.message}`);
  }
};

/**
 * Accept a ride request (driver action)
 */
const acceptRide = async (rideId, driverId) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (!isValidTransition(ride.status, RIDE_STATES.ACCEPTED)) {
      throw new Error(`Invalid transition from ${ride.status} to ${RIDE_STATES.ACCEPTED}`);
    }

    if (ride.driverId && ride.driverId.toString() !== driverId) {
      throw new Error('Driver not assigned to this ride');
    }

    ride.status = RIDE_STATES.ACCEPTED;
    ride.acceptedAt = new Date();
    await ride.save();

    // Mark driver as unavailable
    await User.findByIdAndUpdate(driverId, { isAvailable: false });

    return ride;
  } catch (error) {
    throw new Error(`Failed to accept ride: ${error.message}`);
  }
};

/**
 * Decline a ride request (driver action)
 */
const declineRide = async (rideId, driverId) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (ride.driverId && ride.driverId.toString() !== driverId) {
      throw new Error('Driver not assigned to this ride');
    }

    // Reset ride's driver assignment
    ride.driverId = undefined;
    await ride.save();

    return ride;
  } catch (error) {
    throw new Error(`Failed to decline ride: ${error.message}`);
  }
};

/**
 * Start a ride (driver action)
 */
const startRide = async (rideId, driverId) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (!isValidTransition(ride.status, RIDE_STATES.IN_PROGRESS)) {
      throw new Error(`Invalid transition from ${ride.status} to ${RIDE_STATES.IN_PROGRESS}`);
    }

    if (ride.driverId.toString() !== driverId) {
      throw new Error('Driver not assigned to this ride');
    }

    ride.status = RIDE_STATES.IN_PROGRESS;
    ride.startedAt = new Date();
    await ride.save();

    return ride;
  } catch (error) {
    throw new Error(`Failed to start ride: ${error.message}`);
  }
};

/**
 * Complete a ride (driver action)
 */
const completeRide = async (rideId, driverId) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (!isValidTransition(ride.status, RIDE_STATES.COMPLETED)) {
      throw new Error(`Invalid transition from ${ride.status} to ${RIDE_STATES.COMPLETED}`);
    }

    if (ride.driverId.toString() !== driverId) {
      throw new Error('Driver not assigned to this ride');
    }

    ride.status = RIDE_STATES.COMPLETED;
    ride.completedAt = new Date();
    ride.payment.status = 'completed';
    await ride.save();

    // Mark driver as available
    await User.findByIdAndUpdate(driverId, {
      isAvailable: true,
      currentRideId: null,
    });

    return ride;
  } catch (error) {
    throw new Error(`Failed to complete ride: ${error.message}`);
  }
};

/**
 * Cancel a ride
 */
const cancelRide = async (rideId, cancelledBy, reason) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (!isValidTransition(ride.status, RIDE_STATES.CANCELLED)) {
      throw new Error(`Cannot cancel ride in ${ride.status} state`);
    }

    ride.status = RIDE_STATES.CANCELLED;
    ride.cancelledBy = cancelledBy;
    ride.cancellationReason = reason;
    ride.cancelledAt = new Date();
    await ride.save();

    // If driver was assigned, mark them as available
    if (ride.driverId) {
      await User.findByIdAndUpdate(ride.driverId, {
        isAvailable: true,
        currentRideId: null,
      });
    }

    return ride;
  } catch (error) {
    throw new Error(`Failed to cancel ride: ${error.message}`);
  }
};

/**
 * Update driver location and create breadcrumb
 */
const updateDriverLocation = async (driverId, coordinates, accuracy, speed, heading) => {
  try {
    // Update user's current location
    const user = await User.findByIdAndUpdate(
      driverId,
      {
        currentLocation: {
          type: 'Point',
          coordinates, // [longitude, latitude]
        },
      },
      { new: true }
    );

    // Create breadcrumb for tracking
    if (user.currentRideId) {
      const breadcrumb = new LocationBreadcrumb({
        driverId,
        rideId: user.currentRideId,
        location: {
          type: 'Point',
          coordinates,
        },
        accuracy,
        speed,
        heading,
      });
      await breadcrumb.save();
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to update driver location: ${error.message}`);
  }
};

/**
 * Get ride details
 */
const getRideDetails = async (rideId) => {
  try {
    const ride = await Ride.findById(rideId)
      .populate('riderId', 'name email phone profilePicture rating')
      .populate('driverId', 'name email phone profilePicture rating vehicleType vehicleNumber');

    if (!ride) {
      throw new Error('Ride not found');
    }

    return ride;
  } catch (error) {
    throw new Error(`Failed to get ride details: ${error.message}`);
  }
};

/**
 * Get rider's ride history
 */
const getRiderHistory = async (riderId, limit = 10, offset = 0) => {
  try {
    const rides = await Ride.find({ riderId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('driverId', 'name email phone profilePicture rating vehicleType vehicleNumber');

    const total = await Ride.countDocuments({ riderId });

    return {
      rides,
      total,
      limit,
      offset,
    };
  } catch (error) {
    throw new Error(`Failed to get rider history: ${error.message}`);
  }
};

/**
 * Get driver's ride history
 */
const getDriverHistory = async (driverId, limit = 10, offset = 0) => {
  try {
    const rides = await Ride.find({ driverId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('riderId', 'name email phone profilePicture rating');

    const total = await Ride.countDocuments({ driverId });

    return {
      rides,
      total,
      limit,
      offset,
    };
  } catch (error) {
    throw new Error(`Failed to get driver history: ${error.message}`);
  }
};

/**
 * Rate a ride
 */
const rateRide = async (rideId, rating, comment, ratedBy) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (ride.status !== RIDE_STATES.COMPLETED) {
      throw new Error('Can only rate completed rides');
    }

    ride.rating = {
      value: rating,
      comment,
      ratedBy,
      ratedAt: new Date(),
    };

    await ride.save();

    // Update user's average rating
    const targetUserId = ratedBy === 'rider' ? ride.driverId : ride.riderId;
    const riderRides = await Ride.find({
      [ratedBy === 'rider' ? 'driverId' : 'riderId']: targetUserId,
      'rating.value': { $exists: true },
    });

    const avgRating =
      riderRides.reduce((sum, r) => sum + r.rating.value, 0) / riderRides.length;

    await User.findByIdAndUpdate(targetUserId, {
      rating: Math.round(avgRating * 10) / 10,
    });

    return ride;
  } catch (error) {
    throw new Error(`Failed to rate ride: ${error.message}`);
  }
};

module.exports = {
  createRideRequest,
  assignDriverToRide,
  acceptRide,
  declineRide,
  startRide,
  completeRide,
  cancelRide,
  updateDriverLocation,
  getRideDetails,
  getRiderHistory,
  getDriverHistory,
  rateRide,
};
