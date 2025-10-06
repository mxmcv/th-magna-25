// Rounds API - Single Round operations
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
import { auditHelpers, getChanges } from '@/lib/api/audit';

// GET /api/rounds/[id] - Get specific round
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await requireCompanyAuth(request);

    const round = await prisma.round.findUnique({
      where: { id },
      include: {
        contributions: {
          include: {
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
        },
        invitations: {
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!round) {
      throw new ApiError('Round not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Check ownership
    if (round.companyId !== company.id) {
      throw new ApiError('Access denied', 403, ErrorCodes.FORBIDDEN);
    }

    // Calculate participants
    const participants = await prisma.contribution.groupBy({
      by: ['investorId'],
      where: {
        roundId: id,
        status: 'CONFIRMED',
      },
    });

    return successResponse({
      ...round,
      participants: participants.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/rounds/[id] - Update round
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await requireCompanyAuth(request);
    await checkResourceOwnership(request, 'round', id);

    const data = await parseRequestBody(request);

    // Get current round data
    const currentRound = await prisma.round.findUnique({
      where: { id },
    });

    if (!currentRound) {
      throw new ApiError('Round not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Build update data
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.target !== undefined) updateData.target = parseFloat(data.target);
    if (data.minContribution !== undefined) updateData.minContribution = parseFloat(data.minContribution);
    if (data.maxContribution !== undefined) updateData.maxContribution = parseFloat(data.maxContribution);
    if (data.acceptedTokens !== undefined) updateData.acceptedTokens = data.acceptedTokens;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.status !== undefined) updateData.status = data.status;

    const updatedRound = await prisma.round.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await auditHelpers.logRoundUpdated(
      id,
      company.id,
      currentRound,
      updateData
    );

    return successResponse(updatedRound);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/rounds/[id] - Delete round
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await requireCompanyAuth(request);
    await checkResourceOwnership(request, 'round', id);

    // Check if round has contributions
    const contributionCount = await prisma.contribution.count({
      where: { roundId: id },
    });

    if (contributionCount > 0) {
      throw new ApiError(
        'Cannot delete round with existing contributions',
        409,
        ErrorCodes.INVALID_STATE
      );
    }

    await prisma.round.delete({
      where: { id },
    });

    return successResponse({ message: 'Round deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

