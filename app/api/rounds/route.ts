// rounds api - handles listing and creating fundraising rounds
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api/responses';
import { requireAuth, requireCompanyAuth } from '@/lib/api/auth';
import { validateRoundData, parseRequestBody } from '@/lib/api/validation';
import { auditHelpers } from '@/lib/api/audit';

// key design decision: investors only see rounds they're invited to
// prevents them from seeing all rounds across all companies
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    let rounds;

    if (session.userType === 'company') {
      // companies see all their rounds
      rounds = await prisma.round.findMany({
        where: { companyId: session.userId },
        include: {
          _count: {
            select: {
              contributions: true,
              invitations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // investors only see rounds they have invitations for
      // prevents data leakage between companies
      const invitations = await prisma.invitation.findMany({
        where: {
          investorId: session.userId,
          status: { in: ['SENT', 'ACCEPTED', 'VIEWED'] },
        },
        select: {
          roundId: true,
        },
      });

      const roundIds = invitations.map(inv => inv.roundId);

      rounds = await prisma.round.findMany({
        where: {
          id: { in: roundIds },
          status: { in: ['ACTIVE', 'CLOSED', 'COMPLETED'] },
        },
        include: {
          _count: {
            select: {
              contributions: true,
              invitations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(rounds);
  } catch (error) {
    return handleApiError(error);
  }
}

// only companies can create rounds
export async function POST(request: NextRequest) {
  try {
    const company = await requireCompanyAuth(request);
    const data = await parseRequestBody(request);

    // validate before hitting the database
    const validatedData = validateRoundData(data);

    const round = await prisma.round.create({
      data: {
        ...validatedData,
        companyId: company.id,
        raised: 0,
        status: 'ACTIVE',
      },
    });

    // audit all round creation for compliance
    await auditHelpers.logRoundCreated(round.id, company.id, round);

    return successResponse(round);
  } catch (error) {
    return handleApiError(error);
  }
}
