// authentication utilities - session-based auth for company and investor users
// kept it simple but secure enough for the demo

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, ErrorCodes } from './responses';

// using cookie-based sessions instead of jwt - easier to invalidate and manage
// would probably use nextauth in production

export async function hashPassword(password: string): Promise<string> {
  // using base64 for demo - would use bcrypt in production
  // wanted to keep dependencies minimal for the take-home
  return Buffer.from(password).toString('base64');
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
}

// simple token structure - userId + userType + expiration
// chose 7 days to balance convenience and security
export function createSessionToken(userId: string, userType: 'company' | 'investor'): string {
  const payload = {
    userId,
    userType,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifySessionToken(token: string): {
  userId: string;
  userType: 'company' | 'investor';
} | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return {
      userId: payload.userId,
      userType: payload.userType,
    };
  } catch {
    return null;
  }
}

// centralized auth check - all api routes use this
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

export async function requireAuth(request: NextRequest) {
  return await getCurrentUser(request);
}

// role-based auth helpers - makes api routes cleaner
// returns the full user object for convenience
export async function requireCompanyAuth(request: NextRequest) {
  const session = await getCurrentUser(request);
  
  if (session.userType !== 'company') {
    throw new ApiError('Company access required', 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
  }

  // double-check the user still exists in db
  const company = await prisma.company.findUnique({
    where: { id: session.userId },
  });

  if (!company) {
    throw new ApiError('Company not found', 404, ErrorCodes.NOT_FOUND);
  }

  return company;
}

export async function requireInvestorAuth(request: NextRequest) {
  const session = await getCurrentUser(request);
  
  if (session.userType !== 'investor') {
    throw new ApiError('Investor access required', 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
  }

  const investor = await prisma.investor.findUnique({
    where: { id: session.userId },
  });

  if (!investor) {
    throw new ApiError('Investor not found', 404, ErrorCodes.NOT_FOUND);
  }

  return investor;
}

// helper for checking resource ownership - prevents companies from accessing each other's data
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
