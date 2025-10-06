// Close Round API
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { requireCompanyAuth, checkResourceOwnership } from '@/lib/api/auth';
import { auditHelpers } from '@/lib/api/audit';

// POST /api/rounds/[id]/close - Close a round
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await requireCompanyAuth(request);
    await checkResourceOwnership(request, 'round', id);

    const round = await prisma.round.findUnique({
      where: { id },
    });

    if (!round) {
      throw new ApiError('Round not found', 404, ErrorCodes.NOT_FOUND);
    }

    if (round.status === 'CLOSED' || round.status === 'COMPLETED') {
      throw new ApiError(
        'Round is already closed',
        409,
        ErrorCodes.INVALID_STATE
      );
    }

    const updatedRound = await prisma.round.update({
      where: { id },
      data: {
        status: 'CLOSED',
      },
    });

    // Audit log
    await auditHelpers.logRoundClosed(id, company.id);

    return successResponse({
      ...updatedRound,
      message: 'Round closed successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

