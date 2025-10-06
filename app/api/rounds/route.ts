// Rounds API - List and Create
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api/responses';
import { requireAuth, requireCompanyAuth } from '@/lib/api/auth';
import { validateRoundData, parseRequestBody } from '@/lib/api/validation';
import { auditHelpers } from '@/lib/api/audit';

// GET /api/rounds - List rounds (companies see their own, investors see all active)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    // Companies see only their rounds, investors see all active rounds
    const whereClause = session.userType === 'company'
      ? { companyId: session.userId }
      : { status: 'ACTIVE' }; // Investors only see active rounds

    const rounds = await prisma.round.findMany({
      where: whereClause,
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

    // Calculate participants for each round
    const roundsWithStats = await Promise.all(
      rounds.map(async (round) => {
        const participants = await prisma.contribution.groupBy({
          by: ['investorId'],
          where: {
            roundId: round.id,
            status: 'CONFIRMED',
          },
        });

        return {
          ...round,
          participants: participants.length,
        };
      })
    );

    return successResponse(roundsWithStats);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/rounds - Create a new round
export async function POST(request: NextRequest) {
  try {
    const company = await requireCompanyAuth(request);
    const data = await parseRequestBody(request);
    
    // Validate and get clean data
    const validated = validateRoundData({
      ...data,
      companyId: company.id,
    });

    const round = await prisma.round.create({
      data: {
        ...validated,
        status: data.status || 'DRAFT',
        raised: 0,
      },
    });

    // Audit log
    await auditHelpers.logRoundCreated(round.id, company.id, round);

    return successResponse(round, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

