const axios = require('axios');
require('dotenv').config();

const MAPBOX_BASE_URL = 'https://api.mapbox.com';
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

/**
 * Geocode an address to get coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<object>} - Location coordinates and place name
 */
const geocodeAddress = async (address) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured');
  }

  try {
    const response = await axios.get(
      `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
        },
      }
    );

    if (response.data.features.length === 0) {
      throw new Error('Address not found');
    }

    const feature = response.data.features[0];
    const [longitude, latitude] = feature.center;

    return {
      coordinates: [longitude, latitude],
      address: feature.place_name,
      placeType: feature.place_type[0],
      confidence: feature.relevance,
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw new Error(`Failed to geocode address: ${error.message}`);
  }
};

/**
 * Get route and distance between two points
 * @param {array} pickup - Pickup coordinates [longitude, latitude]
 * @param {array} dropoff - Dropoff coordinates [longitude, latitude]
 * @returns {Promise<object>} - Route, distance, and duration
 */
const getRoute = async (pickup, dropoff) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured');
  }

  try {
    const coordinates = `${pickup[0]},${pickup[1]};${dropoff[0]},${dropoff[1]}`;

    const response = await axios.get(
      `${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${coordinates}`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          overview: 'full',
          steps: true,
          geometries: 'geojson',
        },
      }
    );

    if (response.data.code !== 'Ok') {
      throw new Error(`Routing error: ${response.data.code}`);
    }

    const route = response.data.routes[0];

    return {
      distance: {
        value: route.distance, // in meters
        text: formatDistance(route.distance),
      },
      duration: {
        value: route.duration, // in seconds
        text: formatDuration(route.duration),
      },
      route: route.geometry.coordinates.map(([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
        timestamp: new Date(),
      })),
      polyline: route.geometry,
    };
  } catch (error) {
    console.error('Routing error:', error.message);
    throw new Error(`Failed to get route: ${error.message}`);
  }
};

/**
 * Get ETA in seconds between two points
 * @param {array} pickup - Pickup coordinates [longitude, latitude]
 * @param {array} dropoff - Dropoff coordinates [longitude, latitude]
 * @returns {Promise<object>} - ETA in seconds
 */
const getETA = async (pickup, dropoff) => {
  const routeData = await getRoute(pickup, dropoff);
  return {
    pickupETA: 0, // Assuming driver is at pickup
    dropoffETA: routeData.duration.value, // Time from pickup to dropoff
  };
};

/**
 * Format distance in meters to readable string
 * @param {number} meters - Distance in meters
 * @returns {string} - Formatted distance
 */
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

/**
 * Reverse geocode coordinates to get address
 * @param {array} coordinates - [longitude, latitude]
 * @returns {Promise<string>} - Address
 */
const reverseGeocode = async (coordinates) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured');
  }

  try {
    const [longitude, latitude] = coordinates;
    const response = await axios.get(
      `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
        },
      }
    );

    if (response.data.features.length === 0) {
      return 'Unknown location';
    }

    return response.data.features[0].place_name;
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return 'Unknown location';
  }
};

module.exports = {
  geocodeAddress,
  getRoute,
  getETA,
  reverseGeocode,
  formatDistance,
  formatDuration,
};
