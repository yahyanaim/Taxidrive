require('dotenv').config();

const VEHICLE_MULTIPLIERS = {
  economy: 1.0,
  premium: 1.5,
  xl: 2.0,
};

/**
 * Calculate fare based on distance, duration, and vehicle type
 * @param {number} distanceMeters - Distance in meters
 * @param {number} durationSeconds - Duration in seconds
 * @param {string} vehicleType - Type of vehicle ('economy', 'premium', 'xl')
 * @param {number} surgeMultiplier - Surge pricing multiplier (default: 1.0)
 * @returns {object} - Fare breakdown and total
 */
const calculateFare = (
  distanceMeters,
  durationSeconds,
  vehicleType = 'economy',
  surgeMultiplier = 1.0
) => {
  const baseFare = parseFloat(process.env.BASE_FARE) || 2.5;
  const pricePerMile = parseFloat(process.env.PRICE_PER_MILE) || 1.25;
  const pricePerMinute = parseFloat(process.env.PRICE_PER_MINUTE) || 0.35;

  // Convert meters to miles
  const distanceMiles = distanceMeters / 1609.34;

  // Convert seconds to minutes
  const durationMinutes = durationSeconds / 60;

  // Get vehicle multiplier
  const vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.0;

  // Calculate components
  const distanceFare = distanceMiles * pricePerMile * vehicleMultiplier;
  const timeFare = durationMinutes * pricePerMinute * vehicleMultiplier;

  // Apply surge pricing
  const subtotal = (baseFare + distanceFare + timeFare) * surgeMultiplier;

  // Round to 2 decimal places
  const totalFare = Math.round(subtotal * 100) / 100;

  return {
    baseFare: Math.round(baseFare * 100) / 100,
    distanceFare: Math.round(distanceFare * 100) / 100,
    timeFare: Math.round(timeFare * 100) / 100,
    totalFare,
    currency: 'USD',
    surgeMultiplier,
  };
};

/**
 * Calculate surge multiplier based on demand
 * @param {number} availableDrivers - Number of available drivers
 * @param {number} waitingRiders - Number of waiting riders
 * @returns {number} - Surge multiplier
 */
const calculateSurgeMultiplier = (availableDrivers, waitingRiders) => {
  if (availableDrivers === 0) {
    return 3.0;
  }

  const ratio = waitingRiders / availableDrivers;

  if (ratio > 3) {
    return 3.0;
  }
  if (ratio > 2) {
    return 2.5;
  }
  if (ratio > 1.5) {
    return 2.0;
  }
  if (ratio > 1) {
    return 1.5;
  }

  return 1.0;
};

module.exports = {
  calculateFare,
  calculateSurgeMultiplier,
  VEHICLE_MULTIPLIERS,
};
