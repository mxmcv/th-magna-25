// Invitations API
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { requireCompanyAuth } from '@/lib/api/auth';
import { parseRequestBody } from '@/lib/api/validation';
import { auditHelpers } from '@/lib/api/audit';

// POST /api/invitations - Send invitation(s)
export async function POST(request: NextRequest) {
  try {
    const company = await requireCompanyAuth(request);
    const data = await parseRequestBody(request);

    if (!data.roundId) {
      throw new ApiError('Round ID is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    if (!data.investorIds || !Array.isArray(data.investorIds) || data.investorIds.length === 0) {
      throw new ApiError('At least one investor ID is required', 400, ErrorCodes.INVALID_INPUT);
    }

    // Verify round ownership
    const round = await prisma.round.findUnique({
      where: { id: data.roundId },
    });

    if (!round) {
      throw new ApiError('Round not found', 404, ErrorCodes.NOT_FOUND);
    }

    if (round.companyId !== company.id) {
      throw new ApiError('Access denied', 403, ErrorCodes.FORBIDDEN);
    }

    // Create invitations for each investor
    const invitations = await Promise.all(
      data.investorIds.map(async (investorId: string) => {
        // Check if invitation already exists
        const existing = await prisma.invitation.findUnique({
          where: {
            roundId_investorId: {
              roundId: data.roundId,
              investorId,
            },
          },
        });

        if (existing) {
          return null; // Skip if already invited
        }

        const invitation = await prisma.invitation.create({
          data: {
            roundId: data.roundId,
            investorId,
            status: 'SENT',
          },
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            round: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Audit log
        await auditHelpers.logInvitationSent(invitation.id, company.id, {
          roundId: data.roundId,
          investorId,
        });

        return invitation;
      })
    );

    const created = invitations.filter((inv) => inv !== null);

    return successResponse({
      invitations: created,
      message: `Successfully sent ${created.length} invitation(s)`,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

