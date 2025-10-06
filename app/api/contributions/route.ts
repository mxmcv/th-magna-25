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
import { validateContributionData, parseRequestBody } from '@/lib/api/validation';
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

// POST /api/contributions - Create new contribution (investor only)
export async function POST(request: NextRequest) {
  try {
    const investor = await requireInvestorAuth(request);
    const data = await parseRequestBody(request);

    // Get round details for validation
    const round = await prisma.round.findUnique({
      where: { id: data.roundId },
    });

    if (!round) {
      throw new ApiError('Round not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Check round status
    if (round.status !== 'ACTIVE') {
      throw new ApiError(
        'This round is not currently accepting contributions',
        409,
        ErrorCodes.INVALID_STATE
      );
    }

    // Check round dates
    const now = new Date();
    if (now < round.startDate || now > round.endDate) {
      throw new ApiError(
        'This round is not within its contribution period',
        409,
        ErrorCodes.INVALID_STATE
      );
    }

    // Validate contribution data
    const validated = validateContributionData(
      {
        ...data,
        investorId: investor.id,
      },
      round
    );

    // Check if investor has already contributed and would exceed max
    const existingContributions = await prisma.contribution.findMany({
      where: {
        roundId: validated.roundId,
        investorId: validated.investorId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    const totalContributed = existingContributions.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    if (totalContributed + validated.amount > round.maxContribution) {
      throw new ApiError(
        `Total contribution would exceed maximum of $${round.maxContribution.toLocaleString()}`,
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Create contribution
    const contribution = await prisma.contribution.create({
      data: {
        ...validated,
        // In production, this would remain PENDING until blockchain confirmation
        // For demo, we'll set it to CONFIRMED
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        // Mock transaction hash
        transactionHash: `0x${Math.random().toString(16).substring(2)}`,
      },
      include: {
        round: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update round raised amount
    await prisma.round.update({
      where: { id: validated.roundId },
      data: {
        raised: {
          increment: validated.amount,
        },
      },
    });

    // Audit log
    await auditHelpers.logContributionCreated(
      contribution.id,
      investor.id,
      contribution
    );

    return successResponse(contribution, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

