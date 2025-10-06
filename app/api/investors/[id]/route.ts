// Single Investor API
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

// GET /api/investors/[id] - Get investor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCompanyAuth(request);
    const { id } = await params;

    const investor = await prisma.investor.findUnique({
      where: { id },
      include: {
        contributions: {
          include: {
            round: {
              select: {
                id: true,
                name: true,
                status: true,
                raised: true,
                target: true,
                maxContribution: true,
              },
            },
          },
          orderBy: {
            contributedAt: 'desc',
          },
        },
        invitations: {
          include: {
            round: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!investor) {
      throw new ApiError('Investor not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Calculate stats
    const totalInvested = investor.contributions
      .filter((c) => c.status === 'CONFIRMED')
      .reduce((sum, c) => sum + c.amount, 0);

    return successResponse({
      ...investor,
      totalInvested,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/investors/[id] - Update investor details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const company = await requireCompanyAuth(request);
    const { id } = await params;
    const data = await parseRequestBody(request);

    // Verify investor exists
    const existingInvestor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!existingInvestor) {
      throw new ApiError('Investor not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.walletAddress !== undefined) updateData.walletAddress = data.walletAddress;
    if (data.status !== undefined) updateData.status = data.status;

    // Update investor
    const updatedInvestor = await prisma.investor.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await auditHelpers.logInvestorUpdated(
      id,
      company.id,
      existingInvestor,
      updatedInvestor
    );

    return successResponse(updatedInvestor);
  } catch (error) {
    return handleApiError(error);
  }
}

