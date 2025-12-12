const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: [
        'requested',
        'accepted',
        'driver_arriving',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'requested',
    },
    pickup: {
      address: {
        type: String,
        required: true,
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
      arrivalTime: Date,
    },
    dropoff: {
      address: {
        type: String,
        required: true,
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
      arrivalTime: Date,
    },
    vehicleType: {
      type: String,
      enum: ['economy', 'premium', 'xl'],
      required: true,
    },
    fare: {
      baseFare: Number,
      distanceFare: Number,
      timeFare: Number,
      surgePricing: {
        multiplier: {
          type: Number,
          default: 1.0,
        },
        reason: String,
      },
      totalFare: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
    eta: {
      pickupETA: Number, // in seconds
      dropoffETA: Number, // in seconds
    },
    distance: {
      value: Number, // in meters
      text: String,
    },
    duration: {
      value: Number, // in seconds
      text: String,
    },
    route: {
      type: [
        {
          latitude: Number,
          longitude: Number,
          timestamp: Date,
        },
      ],
      default: [],
    },
    rating: {
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      ratedBy: {
        type: String,
        enum: ['rider', 'driver'],
      },
      ratedAt: Date,
    },
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'wallet'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
      },
      transactionId: String,
    },
    notes: String,
    cancelledBy: {
      type: String,
      enum: ['rider', 'driver'],
    },
    cancellationReason: String,
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
rideSchema.index({ 'pickup.location': '2dsphere' });
rideSchema.index({ 'dropoff.location': '2dsphere' });
rideSchema.index({ riderId: 1, createdAt: -1 });
rideSchema.index({ driverId: 1, createdAt: -1 });
rideSchema.index({ status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
