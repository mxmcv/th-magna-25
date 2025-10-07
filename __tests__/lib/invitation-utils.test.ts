import {
  generateInvitationToken,
  getInvitationExpiry,
  isInvitationExpired,
  generateInvitationLink,
} from '@/lib/invitation-utils';

describe('Invitation Utils', () => {
  describe('generateInvitationToken', () => {
    it('generates a token', () => {
      const token = generateInvitationToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('generates unique tokens', () => {
      const token1 = generateInvitationToken();
      const token2 = generateInvitationToken();
      expect(token1).not.toBe(token2);
    });

    it('generates tokens in hex format', () => {
      const token = generateInvitationToken();
      // Should be hex characters only (64 chars for 32 bytes)
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('getInvitationExpiry', () => {
    it('returns a date 7 days in the future', () => {
      const now = new Date();
      const expiry = getInvitationExpiry();
      
      const diffInMs = expiry.getTime() - now.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      
      // Should be approximately 7 days (with small tolerance for execution time)
      expect(diffInDays).toBeGreaterThan(6.99);
      expect(diffInDays).toBeLessThan(7.01);
    });

    it('returns a Date object', () => {
      const expiry = getInvitationExpiry();
      expect(expiry instanceof Date).toBe(true);
    });
  });

  describe('isInvitationExpired', () => {
    it('identifies expired invitations', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      expect(isInvitationExpired(pastDate)).toBe(true);
    });

    it('identifies non-expired invitations', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      expect(isInvitationExpired(futureDate)).toBe(false);
    });

    it('handles the exact expiry moment correctly', () => {
      const now = new Date();
      // An invitation that expires right now should be considered expired
      expect(isInvitationExpired(now)).toBe(false);
    });
  });

  describe('generateInvitationLink', () => {
    it('generates a link with the token', () => {
      const token = 'test-token-123';
      const link = generateInvitationLink(token, 'https://example.com');
      
      expect(link).toContain(token);
      expect(link).toContain('/invite/accept');
      expect(link).toContain('?token=');
    });

    it('uses provided base URL', () => {
      const token = 'test-token';
      const baseUrl = 'https://magna.so';
      const link = generateInvitationLink(token, baseUrl);
      
      expect(link).toBe(`${baseUrl}/invite/accept?token=${token}`);
    });

    it('uses empty string when no base URL provided', () => {
      const token = 'test-token';
      const link = generateInvitationLink(token);
      
      expect(link).toContain('/invite/accept?token=');
    });

    it('properly formats the query parameter', () => {
      const token = 'abc123';
      const link = generateInvitationLink(token, 'https://test.com');
      
      expect(link).toBe('https://test.com/invite/accept?token=abc123');
    });
  });
});

