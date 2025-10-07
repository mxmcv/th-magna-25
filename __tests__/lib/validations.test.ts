import {
  validateContribution,
  validateEmail,
  validateTarget,
  validateContributionLimits,
  validateDateRange,
  validateWalletAddress,
} from '@/lib/validations';

describe('Validations', () => {
  describe('validateContribution', () => {
    it('accepts valid contributions', () => {
      const result = validateContribution(50000, 10000, 100000);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects contributions below minimum', () => {
      const result = validateContribution(5000, 10000, 100000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('rejects contributions above maximum', () => {
      const result = validateContribution(150000, 10000, 100000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@company.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validateTarget', () => {
    it('accepts valid targets', () => {
      const result = validateTarget(500000);
      expect(result.isValid).toBe(true);
    });

    it('rejects targets below minimum', () => {
      const result = validateTarget(5000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least');
    });

    it('rejects targets above maximum', () => {
      const result = validateTarget(2000000000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed');
    });
  });

  describe('validateContributionLimits', () => {
    it('accepts valid limits', () => {
      const result = validateContributionLimits(10000, 100000);
      expect(result.isValid).toBe(true);
    });

    it('rejects when min >= max', () => {
      const result = validateContributionLimits(100000, 100000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('less than maximum');
    });

    it('rejects when min is too low', () => {
      const result = validateContributionLimits(500, 100000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least');
    });
  });

  describe('validateDateRange', () => {
    it('accepts valid date ranges', () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(true);
    });

    it('rejects when end date is before start date', () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('after start date');
    });

    it('rejects when end date is in the past', () => {
      const startDate = new Date('2020-01-01');
      const endDate = new Date('2020-02-01');
      
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('in the future');
    });
  });

  describe('validateWalletAddress', () => {
    it('validates correct Ethereum addresses', () => {
      expect(validateWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1')).toBe(true);
      expect(validateWalletAddress('0x0000000000000000000000000000000000000000')).toBe(true);
    });

    it('rejects invalid wallet addresses', () => {
      expect(validateWalletAddress('invalid')).toBe(false);
      expect(validateWalletAddress('0x123')).toBe(false);
      expect(validateWalletAddress('742d35Cc6634C0532925a3b844Bc9e7595f0bEb1')).toBe(false);
    });
  });
});

