// Investors API - List and Create
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api/responses';
import { requireCompanyAuth } from '@/lib/api/auth';
import { validateInvestorData, parseRequestBody } from '@/lib/api/validation';
import { auditHelpers } from '@/lib/api/audit';

// GET /api/investors - List all investors
export async function GET(request: NextRequest) {
  try {
    await requireCompanyAuth(request);

    const investors = await prisma.investor.findMany({
      include: {
        contributions: {
          where: {
            status: 'CONFIRMED',
          },
          select: {
            amount: true,
            roundId: true,
            round: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        invitations: {
          select: {
            roundId: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate total invested and get unique rounds for each investor
    const investorsWithStats = investors.map((investor) => {
      const totalContributed = investor.contributions.reduce(
        (sum, contribution) => sum + contribution.amount,
        0
      );

      // Get unique round names
      const uniqueRounds = Array.from(
        new Map(
          investor.contributions.map((c) => [c.roundId, c.round.name])
        ).values()
      );

      const activeRounds = uniqueRounds.length;

      return {
        id: investor.id,
        name: investor.name,
        email: investor.email,
        walletAddress: investor.walletAddress,
        status: investor.status,
        joinedDate: investor.joinedDate,
        createdAt: investor.createdAt,
        updatedAt: investor.updatedAt,
        totalContributed,
        activeRounds,
        rounds: uniqueRounds,
      };
    });

    return successResponse(investorsWithStats);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/investors - Create new investor
export async function POST(request: NextRequest) {
  try {
    const company = await requireCompanyAuth(request);
    const data = await parseRequestBody(request);
    
    const validated = validateInvestorData(data);

    const investor = await prisma.investor.create({
      data: validated,
    });

    // Audit log
    await auditHelpers.logInvestorCreated(investor.id, company.id, investor);

    return successResponse(investor, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

