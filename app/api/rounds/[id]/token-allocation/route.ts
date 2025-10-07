// Token Allocation API
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { requireCompanyAuth, checkResourceOwnership } from '@/lib/api/auth';
import { parseRequestBody } from '@/lib/api/validation';
import { calculateTokenAllocations, exportToMagnaCSV, exportToJSON, AllocationReport } from '@/lib/token-allocation';
import { createAuditLog } from '@/lib/api/audit';

// POST /api/rounds/[id]/token-allocation - Generate token allocation report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await requireCompanyAuth(request);
    await checkResourceOwnership(request, 'round', id);

    const data = await parseRequestBody(request);

    // Validate input
    if (!data.tokenPrice || data.tokenPrice <= 0) {
      throw new ApiError('Valid token price is required', 400, ErrorCodes.VALIDATION_ERROR);
    }

    // Optional vesting configuration
    const vestingConfig = data.vestingConfig ? {
      cliff: parseInt(data.vestingConfig.cliff) || 0,
      duration: parseInt(data.vestingConfig.duration) || 0,
      tge: parseFloat(data.vestingConfig.tge) || 0,
    } : undefined;

    // Get round with all confirmed contributions
    const round = await prisma.round.findUnique({
      where: { id },
      include: {
        contributions: {
          where: {
            status: 'CONFIRMED',
          },
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
                walletAddress: true,
              },
            },
          },
        },
      },
    });

    if (!round) {
      throw new ApiError('Round not found', 404, ErrorCodes.NOT_FOUND);
    }

    if (round.contributions.length === 0) {
      throw new ApiError('No confirmed contributions in this round', 400, ErrorCodes.VALIDATION_ERROR);
    }

    // group contributions by investor - handles multiple contributions per person
    // Map ensures one entry per investor with summed amounts for correct allocation
    const investorContributions = new Map();
    round.contributions.forEach((contrib) => {
      const existing = investorContributions.get(contrib.investorId);
      if (existing) {
        existing.amount += contrib.amount;
      } else {
        investorContributions.set(contrib.investorId, {
          investorId: contrib.investor.id,
          investorName: contrib.investor.name,
          investorEmail: contrib.investor.email,
          walletAddress: contrib.investor.walletAddress,
          amount: contrib.amount,
        });
      }
    });

    const contributions = Array.from(investorContributions.values());

    // Calculate allocations
    const allocations = calculateTokenAllocations(
      contributions,
      data.tokenPrice,
      vestingConfig
    );

    const totalTokens = allocations.reduce((sum, a) => sum + a.tokenAmount, 0);

    const report: AllocationReport = {
      roundId: round.id,
      roundName: round.name,
      totalRaised: round.raised,
      totalTokens,
      tokenPrice: data.tokenPrice,
      allocations,
      generatedAt: new Date(),
    };

    // Audit log
    await createAuditLog({
      entityType: 'Round',
      entityId: round.id,
      action: 'TOKEN_ALLOCATION',
      userId: company.id,
      userType: 'company',
      metadata: {
        tokenPrice: data.tokenPrice,
        totalTokens,
        investorCount: allocations.length,
        roundName: round.name,
      },
    });

    return successResponse(report);
  } catch (error) {
    return handleApiError(error);
  }
}
