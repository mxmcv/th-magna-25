// Get current user endpoint
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api/responses';
import { getCurrentUser } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser(request);

    let user;
    if (session.userType === 'company') {
      user = await prisma.company.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    } else {
      user = await prisma.investor.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          status: true,
          joinedDate: true,
        },
      });
    }

    return successResponse({
      user: {
        ...user,
        userType: session.userType,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

