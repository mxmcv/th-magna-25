// Investor onboarding endpoint
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { parseRequestBody } from '@/lib/api/validation';
import { hashPassword, createSessionToken } from '@/lib/api/auth';

// POST /api/investors/onboard - Complete investor onboarding
export async function POST(request: NextRequest) {
  try {
    const data = await parseRequestBody(request);

    if (!data.token) {
      throw new ApiError('Invitation token is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    if (!data.password || data.password.length < 6) {
      throw new ApiError('Password must be at least 6 characters', 400, ErrorCodes.INVALID_INPUT);
    }

    // Find and validate invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token: data.token },
      include: {
        investor: true,
        round: true,
      },
    });

    if (!invitation) {
      throw new ApiError('Invalid invitation token', 404, ErrorCodes.NOT_FOUND);
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      throw new ApiError('This invitation has expired', 400, ErrorCodes.INVALID_STATE);
    }

    // Check if already used
    if (invitation.usedAt) {
      throw new ApiError('This invitation has already been used', 400, ErrorCodes.INVALID_STATE);
    }

    // Check if investor already has a password
    if (invitation.investor.password) {
      throw new ApiError('This investor account is already set up', 400, ErrorCodes.INVALID_STATE);
    }

    // Hash password and update investor
    const hashedPassword = await hashPassword(data.password);

    const updatedInvestor = await prisma.investor.update({
      where: { id: invitation.investorId },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
        walletAddress: data.walletAddress || null,
      },
    });

    // Mark invitation as used and accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        usedAt: new Date(),
        respondedAt: new Date(),
      },
    });

    // Create session token
    const sessionToken = createSessionToken(updatedInvestor.id, 'investor');

    // Return user data and set cookie
    const response = successResponse({
      user: {
        id: updatedInvestor.id,
        email: updatedInvestor.email,
        name: updatedInvestor.name,
        userType: 'investor',
      },
      round: {
        id: invitation.round.id,
        name: invitation.round.name,
      },
    });

    // Set session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
