// Get invitation by token
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';

// GET /api/invitations/[token] - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        investor: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
          },
        },
        round: {
          select: {
            id: true,
            name: true,
            description: true,
            minContribution: true,
            maxContribution: true,
            acceptedTokens: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new ApiError('Invalid invitation link', 404, ErrorCodes.NOT_FOUND);
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      throw new ApiError('This invitation link has expired', 400, ErrorCodes.INVALID_STATE);
    }

    // Check if already used
    if (invitation.usedAt) {
      throw new ApiError('This invitation link has already been used', 400, ErrorCodes.INVALID_STATE);
    }

    return successResponse({
      invitation: {
        id: invitation.id,
        email: invitation.investor.email,
        name: invitation.investor.name,
        round: invitation.round,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
