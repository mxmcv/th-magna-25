// invitation acceptance - public endpoint for investor onboarding
// validates token, sets password, activates investor, auto-logs in
// critical flow: this is how investors get into the system
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { hashPassword, createSessionToken } from '@/lib/api/auth';
import { parseRequestBody } from '@/lib/api/validation';
import { isInvitationExpired } from '@/lib/invitation-utils';

// POST /api/invitations/accept - Accept invitation and set password
export async function POST(request: NextRequest) {
  try {
    const data = await parseRequestBody(request);

    if (!data.token) {
      throw new ApiError('Invitation token is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    if (!data.password || data.password.length < 6) {
      throw new ApiError('Password must be at least 6 characters', 400, ErrorCodes.INVALID_INPUT);
    }

    // find invitation - includes investor and round for context
    const invitation = await prisma.invitation.findUnique({
      where: { token: data.token },
      include: {
        investor: true,
        round: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new ApiError('Invalid invitation token', 404, ErrorCodes.NOT_FOUND);
    }

    // validate expiration - 7 day window from creation
    if (isInvitationExpired(invitation.expiresAt)) {
      throw new ApiError('Invitation has expired', 400, ErrorCodes.INVALID_INPUT);
    }

    // prevent double-acceptance
    if (invitation.status === 'ACCEPTED') {
      throw new ApiError('Invitation has already been accepted', 400, ErrorCodes.INVALID_INPUT);
    }

    // set password and activate investor account
    const hashedPassword = await hashPassword(data.password);
    
    const updatedInvestor = await prisma.investor.update({
      where: { id: invitation.investorId },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
      },
    });

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // Create session token for auto-login
    const token = createSessionToken(updatedInvestor.id, 'investor');

    // Set session cookie
    const response = successResponse({
      investor: {
        id: updatedInvestor.id,
        email: updatedInvestor.email,
        name: updatedInvestor.name,
      },
      message: 'Invitation accepted successfully',
    });

    response.cookies.set('session', token, {
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

// GET /api/invitations/accept - Validate invitation token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      throw new ApiError('Invitation token is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        investor: {
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          },
        },
        round: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new ApiError('Invalid invitation token', 404, ErrorCodes.NOT_FOUND);
    }

    // Check if expired
    if (isInvitationExpired(invitation.expiresAt)) {
      throw new ApiError('Invitation has expired', 400, ErrorCodes.INVALID_INPUT);
    }

    // Check if already accepted and investor has password
    if (invitation.status === 'ACCEPTED' && invitation.investor.password) {
      throw new ApiError('Invitation has already been accepted', 400, ErrorCodes.INVALID_INPUT);
    }

    // Get all invitations for this investor to show all rounds they're invited to
    const allInvitations = await prisma.invitation.findMany({
      where: {
        investorId: invitation.investorId,
        status: 'SENT',
      },
      include: {
        round: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return successResponse({
      investor: {
        id: invitation.investor.id,
        email: invitation.investor.email,
        name: invitation.investor.name,
      },
      rounds: allInvitations.map(inv => inv.round),
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

