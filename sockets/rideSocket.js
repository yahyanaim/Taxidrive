const rideService = require('../services/rideService');
const User = require('../models/User');

/**
 * Initialize Socket.io handlers for ride-related events
 */
const initializeRideSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    /**
     * User joins their personal room
     * Allows direct messaging to specific user
     */
    socket.on('user:join', ({ userId, role }) => {
      socket.join(`user:${userId}`);
      socket.userId = userId;
      socket.userRole = role;
      console.log(`User ${userId} (${role}) joined their room`);
    });

    /**
     * Driver joins driver queue
     * Driver becomes available for ride requests
     */
    socket.on('driver:available', async ({ driverId, coordinates }) => {
      try {
        const user = await User.findByIdAndUpdate(
          driverId,
          {
            isAvailable: true,
            currentLocation: {
              type: 'Point',
              coordinates, // [longitude, latitude]
            },
          },
          { new: true }
        );

        socket.join('drivers:available');
        socket.emit('driver:status_updated', {
          success: true,
          message: 'You are now available for rides',
          data: user,
        });

        // Notify all riders
        io.to('riders').emit('driver:available_update', {
          availableDriverCount: await User.countDocuments({
            role: 'driver',
            isAvailable: true,
          }),
        });

        console.log(`Driver ${driverId} is now available`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Driver becomes unavailable
     */
    socket.on('driver:unavailable', async ({ driverId }) => {
      try {
        await User.findByIdAndUpdate(driverId, { isAvailable: false });

        socket.leave('drivers:available');
        socket.emit('driver:status_updated', {
          success: true,
          message: 'You are now unavailable',
        });

        // Notify riders about available driver count
        io.to('riders').emit('driver:available_update', {
          availableDriverCount: await User.countDocuments({
            role: 'driver',
            isAvailable: true,
          }),
        });

        console.log(`Driver ${driverId} is now unavailable`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Rider requests a ride
     * Broadcasts to available drivers
     */
    socket.on('ride:request', async (rideData) => {
      try {
        const { riderId, pickup, dropoff, vehicleType, paymentMethod } = rideData;

        const ride = await rideService.createRideRequest(
          riderId,
          pickup,
          dropoff,
          vehicleType,
          paymentMethod
        );

        // Broadcast to all available drivers
        io.to('drivers:available').emit('ride:new_request', {
          rideId: ride._id,
          riderId: ride.riderId,
          pickup: ride.pickup,
          dropoff: ride.dropoff,
          vehicleType: ride.vehicleType,
          fare: ride.fare,
          eta: ride.eta,
          distance: ride.distance,
          duration: ride.duration,
        });

        // Confirm to rider
        socket.emit('ride:request_created', {
          success: true,
          rideId: ride._id,
          data: ride,
        });

        console.log(`Ride ${ride._id} requested by rider ${riderId}`);
      } catch (error) {
        socket.emit('ride:request_failed', {
          success: false,
          message: error.message,
        });
      }
    });

    /**
     * Driver accepts a ride
     */
    socket.on('ride:accept', async ({ rideId, driverId }) => {
      try {
        const ride = await rideService.acceptRide(rideId, driverId);

        // Notify the rider
        io.to(`user:${ride.riderId}`).emit('ride:accepted', {
          rideId: ride._id,
          driverId: ride.driverId,
          status: ride.status,
          data: ride,
        });

        // Notify the driver
        socket.emit('ride:accepted_confirmed', {
          success: true,
          rideId: ride._id,
          data: ride,
        });

        // Notify other drivers that request is no longer available
        io.to('drivers:available').emit('ride:no_longer_available', {
          rideId: ride._id,
          message: 'This ride has been accepted by another driver',
        });

        console.log(`Ride ${rideId} accepted by driver ${driverId}`);
      } catch (error) {
        socket.emit('ride:accept_failed', {
          success: false,
          message: error.message,
        });
      }
    });

    /**
     * Driver declines a ride
     */
    socket.on('ride:decline', async ({ rideId, driverId }) => {
      try {
        const ride = await rideService.declineRide(rideId, driverId);

        // Rebroadcast to other available drivers
        io.to('drivers:available').emit('ride:new_request', {
          rideId: ride._id,
          riderId: ride.riderId,
          pickup: ride.pickup,
          dropoff: ride.dropoff,
          vehicleType: ride.vehicleType,
          fare: ride.fare,
          eta: ride.eta,
          distance: ride.distance,
          duration: ride.duration,
        });

        socket.emit('ride:declined_confirmed', {
          success: true,
          message: 'You have declined this ride',
        });

        console.log(`Ride ${rideId} declined by driver ${driverId}`);
      } catch (error) {
        socket.emit('ride:decline_failed', {
          success: false,
          message: error.message,
        });
      }
    });

    /**
     * Driver location update (breadcrumb tracking)
     */
    socket.on('driver:location_update', async ({ driverId, coordinates, accuracy, speed, heading }) => {
      try {
        const user = await rideService.updateDriverLocation(
          driverId,
          coordinates,
          accuracy,
          speed,
          heading
        );

        // If driver has active ride, notify rider
        if (user.currentRideId) {
          io.to(`user:${user._id}`).emit('driver:location_updated', {
            driverId,
            coordinates,
            accuracy,
            speed,
            heading,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Location update error:', error.message);
      }
    });

    /**
     * Driver starts a ride
     */
    socket.on('ride:start', async ({ rideId, driverId }) => {
      try {
        const ride = await rideService.startRide(rideId, driverId);

        // Update driver's current ride
        await User.findByIdAndUpdate(driverId, { currentRideId: rideId });

        // Notify the rider
        io.to(`user:${ride.riderId}`).emit('ride:started', {
          rideId: ride._id,
          status: ride.status,
          data: ride,
        });

        // Confirm to driver
        socket.emit('ride:started_confirmed', {
          success: true,
          rideId: ride._id,
          data: ride,
        });

        console.log(`Ride ${rideId} started by driver ${driverId}`);
      } catch (error) {
        socket.emit('ride:start_failed', {
          success: false,
          message: error.message,
        });
      }
    });

    /**
     * Driver completes a ride
     */
    socket.on('ride:complete', async ({ rideId, driverId }) => {
      try {
        const ride = await rideService.completeRide(rideId, driverId);

        // Notify the rider
        io.to(`user:${ride.riderId}`).emit('ride:completed', {
          rideId: ride._id,
          status: ride.status,
          fare: ride.fare,
          data: ride,
        });

        // Confirm to driver
        socket.emit('ride:completed_confirmed', {
          success: true,
          rideId: ride._id,
          data: ride,
        });

        console.log(`Ride ${rideId} completed by driver ${driverId}`);
      } catch (error) {
        socket.emit('ride:complete_failed', {
          success: false,
          message: error.message,
        });
      }
    });

    /**
     * Cancel a ride
     */
    socket.on('ride:cancel', async ({ rideId, reason }) => {
      try {
        const userRole = socket.userRole;

        const ride = await rideService.cancelRide(rideId, userRole, reason);

        // Notify both rider and driver
        if (ride.riderId) {
          io.to(`user:${ride.riderId}`).emit('ride:cancelled', {
            rideId: ride._id,
            status: ride.status,
            cancelledBy: ride.cancelledBy,
            reason: ride.cancellationReason,
          });
        }

        if (ride.driverId) {
          io.to(`user:${ride.driverId}`).emit('ride:cancelled', {
            rideId: ride._id,
            status: ride.status,
            cancelledBy: ride.cancelledBy,
            reason: ride.cancellationReason,
          });
        }

        socket.emit('ride:cancelled_confirmed', {
          success: true,
          message: 'Ride cancelled successfully',
        });

        console.log(`Ride ${rideId} cancelled by ${userRole}`);
      } catch (error) {
        socket.emit('ride:cancel_failed', {
          success: false,
          message: error.message,
        });
      }
    });

    /**
     * Rate a ride
     */
    socket.on('ride:rate', async ({ rideId, rating, comment }) => {
      try {
        const userRole = socket.userRole;

        const ride = await rideService.rateRide(rideId, rating, comment, userRole);

        // Notify the other party
        const otherUserId = userRole === 'rider' ? ride.driverId : ride.riderId;
        io.to(`user:${otherUserId}`).emit('ride:rated', {
          rideId: ride._id,
          rating: ride.rating.value,
          ratedBy: userRole,
        });

        socket.emit('ride:rated_confirmed', {
          success: true,
          message: 'Ride rated successfully',
        });

        console.log(`Ride ${rideId} rated by ${userRole}`);
      } catch (error) {
        socket.emit('ride:rate_failed', {
          success: false,
          message: error.message,
        });
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          const user = await User.findById(socket.userId);
          if (user && user.role === 'driver') {
            await User.findByIdAndUpdate(socket.userId, { isAvailable: false });
          }
        }
      } catch (error) {
        console.error('Disconnect error:', error.message);
      }

      console.log(`User disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
};

module.exports = initializeRideSocket;
