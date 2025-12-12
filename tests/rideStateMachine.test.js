const {
  RIDE_STATES,
  isValidTransition,
  getAllowedTransitions,
} = require('../utils/rideStateMachine');

describe('Ride State Machine', () => {
  describe('Valid Transitions', () => {
    test('should allow requested -> accepted', () => {
      expect(isValidTransition(RIDE_STATES.REQUESTED, RIDE_STATES.ACCEPTED)).toBe(true);
    });

    test('should allow requested -> cancelled', () => {
      expect(isValidTransition(RIDE_STATES.REQUESTED, RIDE_STATES.CANCELLED)).toBe(true);
    });

    test('should allow accepted -> driver_arriving', () => {
      expect(isValidTransition(RIDE_STATES.ACCEPTED, RIDE_STATES.DRIVER_ARRIVING)).toBe(true);
    });

    test('should allow accepted -> cancelled', () => {
      expect(isValidTransition(RIDE_STATES.ACCEPTED, RIDE_STATES.CANCELLED)).toBe(true);
    });

    test('should allow driver_arriving -> in_progress', () => {
      expect(isValidTransition(RIDE_STATES.DRIVER_ARRIVING, RIDE_STATES.IN_PROGRESS)).toBe(
        true
      );
    });

    test('should allow driver_arriving -> cancelled', () => {
      expect(isValidTransition(RIDE_STATES.DRIVER_ARRIVING, RIDE_STATES.CANCELLED)).toBe(true);
    });

    test('should allow in_progress -> completed', () => {
      expect(isValidTransition(RIDE_STATES.IN_PROGRESS, RIDE_STATES.COMPLETED)).toBe(true);
    });

    test('should allow in_progress -> cancelled', () => {
      expect(isValidTransition(RIDE_STATES.IN_PROGRESS, RIDE_STATES.CANCELLED)).toBe(true);
    });
  });

  describe('Invalid Transitions', () => {
    test('should not allow requested -> in_progress', () => {
      expect(isValidTransition(RIDE_STATES.REQUESTED, RIDE_STATES.IN_PROGRESS)).toBe(false);
    });

    test('should not allow requested -> completed', () => {
      expect(isValidTransition(RIDE_STATES.REQUESTED, RIDE_STATES.COMPLETED)).toBe(false);
    });

    test('should not allow accepted -> requested', () => {
      expect(isValidTransition(RIDE_STATES.ACCEPTED, RIDE_STATES.REQUESTED)).toBe(false);
    });

    test('should not allow completed -> cancelled', () => {
      expect(isValidTransition(RIDE_STATES.COMPLETED, RIDE_STATES.CANCELLED)).toBe(false);
    });

    test('should not allow completed -> in_progress', () => {
      expect(isValidTransition(RIDE_STATES.COMPLETED, RIDE_STATES.IN_PROGRESS)).toBe(false);
    });

    test('should not allow cancelled -> completed', () => {
      expect(isValidTransition(RIDE_STATES.CANCELLED, RIDE_STATES.COMPLETED)).toBe(false);
    });
  });

  describe('Get Allowed Transitions', () => {
    test('should return correct transitions for requested state', () => {
      const transitions = getAllowedTransitions(RIDE_STATES.REQUESTED);
      expect(transitions).toEqual([RIDE_STATES.ACCEPTED, RIDE_STATES.CANCELLED]);
    });

    test('should return correct transitions for accepted state', () => {
      const transitions = getAllowedTransitions(RIDE_STATES.ACCEPTED);
      expect(transitions).toEqual([RIDE_STATES.DRIVER_ARRIVING, RIDE_STATES.CANCELLED]);
    });

    test('should return correct transitions for in_progress state', () => {
      const transitions = getAllowedTransitions(RIDE_STATES.IN_PROGRESS);
      expect(transitions).toEqual([RIDE_STATES.COMPLETED, RIDE_STATES.CANCELLED]);
    });

    test('should return empty array for completed state', () => {
      const transitions = getAllowedTransitions(RIDE_STATES.COMPLETED);
      expect(transitions).toEqual([]);
    });

    test('should return empty array for cancelled state', () => {
      const transitions = getAllowedTransitions(RIDE_STATES.CANCELLED);
      expect(transitions).toEqual([]);
    });
  });
});
