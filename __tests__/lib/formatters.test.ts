import {
  formatCurrency,
  formatCompactCurrency,
  calculatePercentage,
  formatDate,
  formatRelativeTime,
  formatNumber,
  capitalize,
  getStatusColor,
} from '@/lib/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('formats standard amounts correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1500000)).toBe('$1,500,000');
    });

    it('formats with decimals when specified', () => {
      expect(formatCurrency(1000.5, { decimals: 2 })).toBe('$1,000.50');
    });

    it('formats compact currency when specified', () => {
      expect(formatCurrency(1500000, { compact: true })).toBe('$1.5M');
    });
  });

  describe('formatCompactCurrency', () => {
    it('formats millions correctly', () => {
      expect(formatCompactCurrency(1000000)).toBe('$1.0M');
      expect(formatCompactCurrency(2500000)).toBe('$2.5M');
    });

    it('formats thousands correctly', () => {
      expect(formatCompactCurrency(1000)).toBe('$1.0K');
      expect(formatCompactCurrency(50000)).toBe('$50.0K');
    });

    it('formats small amounts normally', () => {
      expect(formatCompactCurrency(500)).toBe('$500');
    });
  });

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(75, 200)).toBe(38);
    });

    it('handles zero total', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });
  });

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('2024');
    });

    it('handles null dates', () => {
      expect(formatDate(null)).toBe('Unknown');
    });

    it('handles invalid dates', () => {
      expect(formatDate('invalid')).toBe('Invalid Date');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousands separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });
  });

  describe('capitalize', () => {
    it('capitalizes strings correctly', () => {
      expect(capitalize('active')).toBe('Active');
      expect(capitalize('PENDING')).toBe('Pending');
    });

    it('handles empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct colors for statuses', () => {
      expect(getStatusColor('active')).toContain('primary');
      expect(getStatusColor('completed')).toContain('green');
      expect(getStatusColor('pending')).toContain('yellow');
    });

    it('handles unknown statuses', () => {
      expect(getStatusColor('unknown')).toContain('muted');
    });
  });
});

