// Confirm Contribution API (Company only)
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { requireCompanyAuth } from '@/lib/api/auth';
import { auditHelpers } from '@/lib/api/audit';

// POST /api/contributions/[id]/confirm - Confirm a pending contribution
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const company = await requireCompanyAuth(request);
    const { id } = await params;

    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        round: true,
      },
    });

    if (!contribution) {
      throw new ApiError('Contribution not found', 404, ErrorCodes.NOT_FOUND);
    }

    // Check ownership
    if (contribution.round.companyId !== company.id) {
      throw new ApiError('Access denied', 403, ErrorCodes.FORBIDDEN);
    }

    if (contribution.status === 'CONFIRMED') {
      throw new ApiError(
        'Contribution already confirmed',
        409,
        ErrorCodes.INVALID_STATE
      );
    }

    // Confirm contribution
    const updated = await prisma.contribution.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Update round raised amount if not already counted
    if (contribution.status !== 'CONFIRMED') {
      await prisma.round.update({
        where: { id: contribution.roundId },
        data: {
          raised: {
            increment: contribution.amount,
          },
        },
      });
    }

    // Audit log
    await auditHelpers.logContributionConfirmed(id, company.id, updated);

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

