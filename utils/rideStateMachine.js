/**
 * Ride State Machine
 * Defines valid state transitions for a ride lifecycle
 */

const RIDE_STATES = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const STATE_TRANSITIONS = {
  [RIDE_STATES.REQUESTED]: {
    allowed: [
      RIDE_STATES.ACCEPTED,
      RIDE_STATES.CANCELLED,
    ],
  },
  [RIDE_STATES.ACCEPTED]: {
    allowed: [
      RIDE_STATES.DRIVER_ARRIVING,
      RIDE_STATES.CANCELLED,
    ],
  },
  [RIDE_STATES.DRIVER_ARRIVING]: {
    allowed: [
      RIDE_STATES.IN_PROGRESS,
      RIDE_STATES.CANCELLED,
    ],
  },
  [RIDE_STATES.IN_PROGRESS]: {
    allowed: [
      RIDE_STATES.COMPLETED,
      RIDE_STATES.CANCELLED,
    ],
  },
  [RIDE_STATES.COMPLETED]: {
    allowed: [],
  },
  [RIDE_STATES.CANCELLED]: {
    allowed: [],
  },
};

/**
 * Check if a transition from currentState to nextState is valid
 * @param {string} currentState - The current ride state
 * @param {string} nextState - The desired next state
 * @returns {boolean} - True if transition is valid
 */
const isValidTransition = (currentState, nextState) => {
  if (!STATE_TRANSITIONS[currentState]) {
    return false;
  }
  return STATE_TRANSITIONS[currentState].allowed.includes(nextState);
};

/**
 * Get allowed transitions from a given state
 * @param {string} currentState - The current ride state
 * @returns {string[]} - Array of allowed next states
 */
const getAllowedTransitions = (currentState) => {
  if (!STATE_TRANSITIONS[currentState]) {
    return [];
  }
  return STATE_TRANSITIONS[currentState].allowed;
};

module.exports = {
  RIDE_STATES,
  STATE_TRANSITIONS,
  isValidTransition,
  getAllowedTransitions,
};
