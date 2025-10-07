// Logout endpoint
import { NextRequest } from 'next/server';
import { successResponse, handleApiError } from '@/lib/api/responses';

export async function POST(_request: NextRequest) {
  try {
    const response = successResponse({
      message: 'Logged out successfully',
    });

    // Clear session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

