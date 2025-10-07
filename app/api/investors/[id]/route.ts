// Single Investor API
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { requireCompanyAuth, requireInvestorAuth, getCurrentUser } from '@/lib/api/auth';
import { parseRequestBody } from '@/lib/api/validation';
import { auditHelpers } from '@/lib/api/audit';

// GET /api/investors/[id] - Get investor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser(request);
    const { id } = await params;

    // Allow company to view any investor, or investor to view their own data
    if (session.userType === 'company') {
      await requireCompanyAuth(request);
    } else {
      const investor = await requireInvestorAuth(request);
      if (investor.id !== id) {
        throw new ApiError('Access denied', 403, ErrorCodes.FORBIDDEN);
      }
    }

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
    const session = await getCurrentUser(request);
    const { id } = await params;
    const data = await parseRequestBody(request);

    // Allow company to update any investor, or investor to update their own data
    if (session.userType === 'company') {
      await requireCompanyAuth(request);
    } else {
      const investor = await requireInvestorAuth(request);
      if (investor.id !== id) {
        throw new ApiError('Access denied', 403, ErrorCodes.FORBIDDEN);
      }
      // Investors can only update their wallet address
      if (Object.keys(data).some(key => key !== 'walletAddress')) {
        throw new ApiError('Investors can only update their wallet address', 403, ErrorCodes.FORBIDDEN);
      }
    }

    // Verify investor exists
    const existingInvestor = await prisma.investor.findUnique({
      where: { id },
    });

    if (!existingInvestor) {
      throw new ApiError('Investor not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Prepare update data
    const updateData: Prisma.InvestorUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.walletAddress !== undefined) updateData.walletAddress = data.walletAddress;
    if (data.status !== undefined) updateData.status = data.status;

    // Update investor
    const updatedInvestor = await prisma.investor.update({
      where: { id },
      data: updateData,
    });

    // Audit log - use appropriate userId based on who made the update
    const userId = session.userType === 'company' ? session.userId : id;
    await auditHelpers.logInvestorUpdated(
      id,
      userId,
      existingInvestor,
      updatedInvestor
    );

    return successResponse(updatedInvestor);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/investors/[id] - Delete investor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const company = await requireCompanyAuth(request);
    const { id } = await params;

    // Verify investor exists
    const existingInvestor = await prisma.investor.findUnique({
      where: { id },
      include: {
        contributions: true,
        invitations: true,
      },
    });

    if (!existingInvestor) {
      throw new ApiError('Investor not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Delete related records first
    await prisma.$transaction([
      // Delete invitations
      prisma.invitation.deleteMany({
        where: { investorId: id },
      }),
      // Delete contributions
      prisma.contribution.deleteMany({
        where: { investorId: id },
      }),
      // Delete the investor
      prisma.investor.delete({
        where: { id },
      }),
    ]);

    // Audit log
    await auditHelpers.logInvestorDeleted(id, company.id, existingInvestor);

    return successResponse({ message: 'Investor deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
