// Contributions API
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { requireInvestorAuth, requireCompanyAuth, getCurrentUser } from '@/lib/api/auth';
import { parseRequestBody } from '@/lib/api/validation';
import { auditHelpers } from '@/lib/api/audit';

// GET /api/contributions - List contributions
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser(request);

    let contributions;
    if (session.userType === 'company') {
      // Company sees all contributions for their rounds
      const company = await requireCompanyAuth(request);
      contributions = await prisma.contribution.findMany({
        where: {
          round: {
            companyId: company.id,
          },
        },
        include: {
          round: {
            select: {
              id: true,
              name: true,
              raised: true,
              target: true,
              status: true,
              maxContribution: true,
            },
          },
          investor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          contributedAt: 'desc',
        },
      });
    } else {
      // Investor sees only their contributions
      const investor = await requireInvestorAuth(request);
      contributions = await prisma.contribution.findMany({
        where: {
          investorId: investor.id,
        },
        include: {
          round: {
            select: {
              id: true,
              name: true,
              companyId: true,
              raised: true,
              target: true,
              status: true,
              maxContribution: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          contributedAt: 'desc',
        },
      });
    }

    return successResponse(contributions);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/contributions - Create a new contribution
export async function POST(request: NextRequest) {
  try {
    const investor = await requireInvestorAuth(request);
    const data = await parseRequestBody(request);

    // Validate required fields
    if (!data.roundId || typeof data.roundId !== 'string') {
      throw new ApiError('Round ID is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    if (!data.amount || typeof data.amount !== 'number') {
      throw new ApiError('Amount is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    if (!data.token || typeof data.token !== 'string') {
      throw new ApiError('Token is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    // Check if round exists and is active
    const round = await prisma.round.findUnique({
      where: { id: data.roundId },
    });

    if (!round) {
      throw new ApiError('Round not found', 404, ErrorCodes.NOT_FOUND);
    }

    if (round.status !== 'ACTIVE') {
      throw new ApiError(
        'This round is not currently accepting contributions',
        400,
        ErrorCodes.INVALID_STATE
      );
    }

    // Check min/max contribution limits
    if (data.amount < round.minContribution) {
      throw new ApiError(
        `Contribution must be at least $${round.minContribution.toLocaleString()}`,
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Check existing contributions from this investor
    const existingContributions = await prisma.contribution.findMany({
      where: {
        roundId: data.roundId,
        investorId: investor.id,
        status: 'CONFIRMED',
      },
    });

    const totalExisting = existingContributions.reduce(
      (sum, c) => sum + c.amount,
      0
    );
    const newTotal = totalExisting + data.amount;

    if (newTotal > round.maxContribution) {
      throw new ApiError(
        `Total contribution cannot exceed $${round.maxContribution.toLocaleString()}. You have already contributed $${totalExisting.toLocaleString()}.`,
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Validate token is accepted
    if (!round.acceptedTokens.includes(data.token)) {
      throw new ApiError(
        `This round does not accept ${data.token}. Accepted tokens: ${round.acceptedTokens.join(', ')}`,
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Create contribution
    const contribution = await prisma.contribution.create({
      data: {
        roundId: data.roundId,
        investorId: investor.id,
        amount: data.amount,
        token: data.token,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        // Mock transaction hash
        transactionHash: `0x${Math.random().toString(16).substring(2)}`,
      },
    });

    // Update round raised amount
    await prisma.round.update({
      where: { id: data.roundId },
      data: {
        raised: {
          increment: data.amount,
        },
      },
    });

    // Audit log
    await auditHelpers.logContributionCreated(
      contribution.id,
      investor.id,
      contribution
    );

    return successResponse(contribution);
  } catch (error) {
    return handleApiError(error);
  }
}
