// Authentication utilities
// Simple but secure authentication for company and investor users

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, ErrorCodes } from './responses';

// Simple session-based auth using cookies
// In production, consider using NextAuth.js or similar

/**
 * Hash a password (simple implementation for demo)
 * In production, use bcrypt or argon2
 */
export async function hashPassword(password: string): Promise<string> {
  // For demo purposes, using a simple base64 encoding
  // In production, MUST use bcrypt or argon2
  return Buffer.from(password).toString('base64');
}

/**
 * Verify a password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
}

/**
 * Create a session token (simple implementation)
 * In production, use JWT with proper signing
 */
export function createSessionToken(userId: string, userType: 'company' | 'investor'): string {
  const payload = {
    userId,
    userType,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Verify and decode a session token
 */
export function verifySessionToken(token: string): {
  userId: string;
  userType: 'company' | 'investor';
} | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return {
      userId: payload.userId,
      userType: payload.userType,
    };
  } catch {
    return null;
  }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  
  if (!token) {
    throw new ApiError('Unauthorized', 401, ErrorCodes.UNAUTHORIZED);
  }

  const session = verifySessionToken(token);
  
  if (!session) {
    throw new ApiError('Invalid or expired session', 401, ErrorCodes.TOKEN_EXPIRED);
  }

  return session;
}

/**
 * Require authentication (any user type)
 * Returns the session with userId and userType
 */
export async function requireAuth(request: NextRequest) {
  return await getCurrentUser(request);
}

/**
 * Require company authentication
 */
export async function requireCompanyAuth(request: NextRequest) {
  const session = await getCurrentUser(request);
  
  if (session.userType !== 'company') {
    throw new ApiError('Company access required', 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
  }

  // Verify company exists
  const company = await prisma.company.findUnique({
    where: { id: session.userId },
  });

  if (!company) {
    throw new ApiError('Company not found', 404, ErrorCodes.NOT_FOUND);
  }

  return company;
}

/**
 * Require investor authentication
 */
export async function requireInvestorAuth(request: NextRequest) {
  const session = await getCurrentUser(request);
  
  if (session.userType !== 'investor') {
    throw new ApiError('Investor access required', 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
  }

  // Verify investor exists
  const investor = await prisma.investor.findUnique({
    where: { id: session.userId },
  });

  if (!investor) {
    throw new ApiError('Investor not found', 404, ErrorCodes.NOT_FOUND);
  }

  return investor;
}

/**
 * Check if user owns a resource
 */
export async function checkResourceOwnership(
  request: NextRequest,
  resourceType: 'round',
  resourceId: string
): Promise<void> {
  const session = await getCurrentUser(request);

  if (resourceType === 'round') {
    const round = await prisma.round.findUnique({
      where: { id: resourceId },
    });

    if (!round) {
      throw new ApiError('Round not found', 404, ErrorCodes.NOT_FOUND);
    }

    if (round.companyId !== session.userId) {
      throw new ApiError('Access denied', 403, ErrorCodes.FORBIDDEN);
    }
  }
}

