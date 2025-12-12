const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const authMiddleware = require('../middleware/auth');

// All ride routes require authentication
router.use(authMiddleware);

// Request a new ride
router.post('/', rideController.requestRide);

// Get ride details
router.get('/:id', rideController.getRide);

// Accept a ride (driver)
router.post('/:id/accept', rideController.acceptRide);

// Decline a ride (driver)
router.post('/:id/decline', rideController.declineRide);

// Start a ride (driver)
router.post('/:id/start', rideController.startRide);

// Complete a ride (driver)
router.post('/:id/complete', rideController.completeRide);

// Cancel a ride
router.post('/:id/cancel', rideController.cancelRide);

// Update driver location
router.post('/:id/location', rideController.updateLocation);

// Get rider history
router.get('/history/rider', rideController.getRiderHistory);

// Get driver history
router.get('/history/driver', rideController.getDriverHistory);

// Rate a ride
router.post('/:id/rate', rideController.rateRide);

module.exports = router;
