const { calculateFare, calculateSurgeMultiplier } = require('../utils/fareCalculator');

describe('Fare Calculator', () => {
  describe('calculateFare', () => {
    test('should calculate fare for economy vehicle', () => {
      const distance = 5000; // 5 km
      const duration = 600; // 10 minutes
      const vehicleType = 'economy';

      const fare = calculateFare(distance, duration, vehicleType);

      expect(fare).toHaveProperty('baseFare');
      expect(fare).toHaveProperty('distanceFare');
      expect(fare).toHaveProperty('timeFare');
      expect(fare).toHaveProperty('totalFare');
      expect(fare.baseFare).toBeGreaterThan(0);
      expect(fare.totalFare).toBeGreaterThan(0);
    });

    test('should calculate higher fare for premium vehicle', () => {
      const distance = 5000; // 5 km
      const duration = 600; // 10 minutes

      const economyFare = calculateFare(distance, duration, 'economy');
      const premiumFare = calculateFare(distance, duration, 'premium');

      expect(premiumFare.totalFare).toBeGreaterThan(economyFare.totalFare);
    });

    test('should calculate highest fare for xl vehicle', () => {
      const distance = 5000; // 5 km
      const duration = 600; // 10 minutes

      const economyFare = calculateFare(distance, duration, 'economy');
      const xlFare = calculateFare(distance, duration, 'xl');

      expect(xlFare.totalFare).toBeGreaterThan(economyFare.totalFare);
    });

    test('should apply surge multiplier correctly', () => {
      const distance = 5000;
      const duration = 600;
      const vehicleType = 'economy';

      const regularFare = calculateFare(distance, duration, vehicleType, 1.0);
      const surgeFare = calculateFare(distance, duration, vehicleType, 2.0);

      // Allow for rounding differences
      expect(Math.abs(surgeFare.totalFare - regularFare.totalFare * 2)).toBeLessThan(0.02);
    });

    test('should handle short distances', () => {
      const distance = 500; // 500 meters
      const duration = 120; // 2 minutes

      const fare = calculateFare(distance, duration, 'economy');

      expect(fare.totalFare).toBeGreaterThan(0);
      expect(fare.totalFare).toBeGreaterThanOrEqual(fare.baseFare);
    });

    test('should return correct currency', () => {
      const fare = calculateFare(5000, 600, 'economy');
      expect(fare.currency).toBe('USD');
    });
  });

  describe('calculateSurgeMultiplier', () => {
    test('should return 1.0 when supply equals demand', () => {
      const multiplier = calculateSurgeMultiplier(10, 10);
      expect(multiplier).toBe(1.0);
    });

    test('should return 1.5 when demand is 1.5x supply', () => {
      const multiplier = calculateSurgeMultiplier(10, 15);
      expect(multiplier).toBe(1.5);
    });

    test('should return 2.0 when demand is 2x supply', () => {
      const multiplier = calculateSurgeMultiplier(10, 20);
      expect(multiplier).toBe(2.0);
    });

    test('should return 2.5 when demand is 2.5x supply', () => {
      const multiplier = calculateSurgeMultiplier(10, 25);
      expect(multiplier).toBe(2.5);
    });

    test('should return max 3.0 for very high demand', () => {
      const multiplier = calculateSurgeMultiplier(1, 100);
      expect(multiplier).toBe(3.0);
    });

    test('should return 3.0 when no drivers available', () => {
      const multiplier = calculateSurgeMultiplier(0, 50);
      expect(multiplier).toBe(3.0);
    });

    test('should return 1.0 for excess supply', () => {
      const multiplier = calculateSurgeMultiplier(50, 10);
      expect(multiplier).toBe(1.0);
    });
  });
});
