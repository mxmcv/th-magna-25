import {
  calculateDaysRemaining,
  isDateInPast,
  isDateInFuture,
  isDateRangeActive,
  getTimeRemainingText,
  isEndingSoon,
} from '@/lib/date-utils';

describe('Date Utils', () => {
  describe('calculateDaysRemaining', () => {
    it('calculates days remaining correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const result = calculateDaysRemaining(futureDate);
      expect(result).toBeGreaterThanOrEqual(4);
      expect(result).toBeLessThanOrEqual(5);
    });

    it('returns 0 for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      expect(calculateDaysRemaining(pastDate)).toBe(0);
    });
  });

  describe('isDateInPast', () => {
    it('identifies past dates correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      expect(isDateInPast(pastDate)).toBe(true);
    });

    it('identifies future dates correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      expect(isDateInPast(futureDate)).toBe(false);
    });
  });

  describe('isDateInFuture', () => {
    it('identifies future dates correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      expect(isDateInFuture(futureDate)).toBe(true);
    });

    it('identifies past dates correctly', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      expect(isDateInFuture(pastDate)).toBe(false);
    });
  });

  describe('isDateRangeActive', () => {
    it('identifies active date ranges', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);
      
      expect(isDateRangeActive(startDate, endDate)).toBe(true);
    });

    it('identifies inactive date ranges (future)', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 2);
      
      expect(isDateRangeActive(startDate, endDate)).toBe(false);
    });

    it('identifies inactive date ranges (past)', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 10);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      
      expect(isDateRangeActive(startDate, endDate)).toBe(false);
    });
  });

  describe('getTimeRemainingText', () => {
    it('returns correct text for ending today', () => {
      const today = new Date();
      today.setHours(today.getHours() + 12); // 12 hours from now
      
      const result = getTimeRemainingText(today);
      expect(result).toMatch(/(Ending today|1 day remaining)/);
    });

    it('returns correct text for days remaining', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const result = getTimeRemainingText(futureDate);
      expect(result).toContain('days remaining');
    });

    it('returns correct text for weeks remaining', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      
      const result = getTimeRemainingText(futureDate);
      expect(result).toContain('weeks remaining');
    });
  });

  describe('isEndingSoon', () => {
    it('identifies rounds ending soon', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 3);
      
      expect(isEndingSoon(soonDate)).toBe(true);
    });

    it('identifies rounds not ending soon', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      expect(isEndingSoon(futureDate)).toBe(false);
    });

    it('identifies past dates as not ending soon', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      expect(isEndingSoon(pastDate)).toBe(false);
    });
  });
});

