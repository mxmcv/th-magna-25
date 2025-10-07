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
import { generateInvitationToken, getInvitationExpiry, generateInvitationLink } from '@/lib/invitation-utils';

// POST /api/invitations - Create invitation(s) and generate links
export async function POST(request: NextRequest) {
  try {
    const company = await requireCompanyAuth(request);
    const data = await parseRequestBody(request);

    if (!data.roundIds || !Array.isArray(data.roundIds) || data.roundIds.length === 0) {
      throw new ApiError('At least one round ID is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    if (!data.investorId) {
      throw new ApiError('Investor ID is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    // Verify investor exists
    const investor = await prisma.investor.findUnique({
      where: { id: data.investorId },
    });

    if (!investor) {
      throw new ApiError('Investor not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Verify all rounds belong to the company
    const rounds = await prisma.round.findMany({
      where: {
        id: { in: data.roundIds },
        companyId: company.id,
      },
    });

    if (rounds.length !== data.roundIds.length) {
      throw new ApiError('One or more rounds not found or access denied', 403, ErrorCodes.FORBIDDEN);
    }

    // Get base URL from request headers
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    // Create invitations for each round
    const invitations = await Promise.all(
      data.roundIds.map(async (roundId: string) => {
        // Check if invitation already exists
        const existing = await prisma.invitation.findUnique({
          where: {
            roundId_investorId: {
              roundId,
              investorId: data.investorId,
            },
          },
        });

        if (existing) {
          return {
            ...existing,
            invitationLink: generateInvitationLink(existing.token, baseUrl),
            alreadyExists: true,
          };
        }

        // Generate unique token and expiry
        const token = generateInvitationToken();
        const expiresAt = getInvitationExpiry();

        const invitation = await prisma.invitation.create({
          data: {
            roundId,
            investorId: data.investorId,
            token,
            expiresAt,
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
          roundId,
          investorId: data.investorId,
        });

        return {
          ...invitation,
          invitationLink: generateInvitationLink(token, baseUrl),
          alreadyExists: false,
        };
      })
    );

    return successResponse({
      invitations,
      investor,
      message: `Successfully created ${invitations.filter(i => !i.alreadyExists).length} invitation(s)`,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

