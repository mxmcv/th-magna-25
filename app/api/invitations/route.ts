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

    // Support both single investor (investorId) and bulk (investorIds)
    const investorIds = data.investorIds || (data.investorId ? [data.investorId] : []);
    
    if (!investorIds || investorIds.length === 0) {
      throw new ApiError('At least one investor ID is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    // Verify all investors exist
    const investors = await prisma.investor.findMany({
      where: { id: { in: investorIds } },
    });

    if (investors.length !== investorIds.length) {
      throw new ApiError('One or more investors not found', 404, ErrorCodes.NOT_FOUND);
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

    // Create invitations for each investor-round combination
    const allInvitations: any[] = [];
    
    for (const investorId of investorIds) {
      for (const roundId of data.roundIds) {
        // Check if invitation already exists
        const existing = await prisma.invitation.findUnique({
          where: {
            roundId_investorId: {
              roundId,
              investorId,
            },
          },
        });

        if (existing) {
          allInvitations.push({
            ...existing,
            invitationLink: generateInvitationLink(existing.token, baseUrl),
            alreadyExists: true,
          });
          continue;
        }

        // Generate unique token and expiry
        const token = generateInvitationToken();
        const expiresAt = getInvitationExpiry();

        const invitation = await prisma.invitation.create({
          data: {
            roundId,
            investorId,
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
          investorId,
        });

        allInvitations.push({
          ...invitation,
          invitationLink: generateInvitationLink(token, baseUrl),
          alreadyExists: false,
        });
      }
    }

    const newInvitationsCount = allInvitations.filter(i => !i.alreadyExists).length;
    
    return successResponse({
      invitations: allInvitations,
      investors,
      message: `Successfully created ${newInvitationsCount} invitation(s) for ${investors.length} investor(s)`,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

