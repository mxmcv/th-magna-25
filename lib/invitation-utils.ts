// Invitation Token Utilities
// Handles generation and validation of secure invitation tokens

import crypto from 'crypto';

/**
 * Generate a secure random invitation token
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get expiration date for invitation (7 days from now)
 */
export function getInvitationExpiry(): Date {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days
  return expiryDate;
}

/**
 * Check if invitation token is expired
 */
export function isInvitationExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Generate invitation link
 */
export function generateInvitationLink(token: string, baseUrl?: string): string {
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || '';
  return `${url}/invite/accept?token=${token}`;
}

