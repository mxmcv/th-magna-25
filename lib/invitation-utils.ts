// invitation token utilities - secure one-time links for investor onboarding
// using crypto.randomBytes instead of uuid for better security

import crypto from 'crypto';

// 32 bytes = 64 hex chars, should be unique enough for this use case
// storing tokens in db with unique constraint just in case
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 7 day expiry felt like a good balance - not too short but not indefinite
// forces companies to manage their invitations actively
export function getInvitationExpiry(): Date {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  return expiryDate;
}

export function isInvitationExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

// dynamically constructs invite link - works across different environments
// baseUrl parameter lets us use the actual deployment url instead of env var
export function generateInvitationLink(token: string, baseUrl?: string): string {
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || '';
  return `${url}/invite/accept?token=${token}`;
}
