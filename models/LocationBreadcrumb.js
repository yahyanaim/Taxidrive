const mongoose = require('mongoose');

const locationBreadcrumbSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
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
    accuracy: Number, // GPS accuracy in meters
    speed: Number, // in m/s
    heading: Number, // compass direction in degrees
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Index for geospatial queries
locationBreadcrumbSchema.index({ location: '2dsphere' });
locationBreadcrumbSchema.index({ driverId: 1, timestamp: -1 });
locationBreadcrumbSchema.index({ rideId: 1, timestamp: -1 });

// TTL index to auto-delete old breadcrumbs after 7 days
locationBreadcrumbSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800, background: true });

module.exports = mongoose.model('LocationBreadcrumb', locationBreadcrumbSchema);
