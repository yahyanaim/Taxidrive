const rideService = require('../services/rideService');

/**
 * Request a ride
 * POST /api/rides
 */
const requestRide = async (req, res) => {
  try {
    const { pickup, dropoff, vehicleType, paymentMethod } = req.body;
    const riderId = req.user.id;

    if (!pickup || !dropoff || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pickup, dropoff, vehicleType',
      });
    }

    const ride = await rideService.createRideRequest(
      riderId,
      pickup,
      dropoff,
      vehicleType,
      paymentMethod || 'cash'
    );

    res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get ride details
 * GET /api/rides/:id
 */
const getRide = async (req, res) => {
  try {
    const ride = await rideService.getRideDetails(req.params.id);

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Accept a ride
 * POST /api/rides/:id/accept
 */
const acceptRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.id;

    const ride = await rideService.acceptRide(id, driverId);

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Decline a ride
 * POST /api/rides/:id/decline
 */
const declineRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.id;

    const ride = await rideService.declineRide(id, driverId);

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Start a ride
 * POST /api/rides/:id/start
 */
const startRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.id;

    const ride = await rideService.startRide(id, driverId);

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete a ride
 * POST /api/rides/:id/complete
 */
const completeRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.id;

    const ride = await rideService.completeRide(id, driverId);

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cancel a ride
 * POST /api/rides/:id/cancel
 */
const cancelRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const cancelledBy = req.user.role;

    const ride = await rideService.cancelRide(id, cancelledBy, reason);

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update driver location
 * POST /api/rides/:id/location
 */
const updateLocation = async (req, res) => {
  try {
    const { coordinates, accuracy, speed, heading } = req.body;
    const driverId = req.user.id;

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates format',
      });
    }

    const user = await rideService.updateDriverLocation(
      driverId,
      coordinates,
      accuracy,
      speed,
      heading
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get rider's ride history
 * GET /api/rides/history/rider
 */
const getRiderHistory = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const riderId = req.user.id;

    const history = await rideService.getRiderHistory(
      riderId,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get driver's ride history
 * GET /api/rides/history/driver
 */
const getDriverHistory = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const driverId = req.user.id;

    const history = await rideService.getDriverHistory(
      driverId,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Rate a ride
 * POST /api/rides/:id/rate
 */
const rateRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const ratedBy = req.user.role;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const ride = await rideService.rateRide(id, rating, comment, ratedBy);

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  requestRide,
  getRide,
  acceptRide,
  declineRide,
  startRide,
  completeRide,
  cancelRide,
  updateLocation,
  getRiderHistory,
  getDriverHistory,
  rateRide,
};
