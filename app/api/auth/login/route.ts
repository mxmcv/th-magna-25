// Login endpoint for both company and investor
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { verifyPassword, createSessionToken } from '@/lib/api/auth';
import { parseRequestBody } from '@/lib/api/validation';
import { validateEmail } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const data = await parseRequestBody(request);

    if (!data.email || !validateEmail(data.email)) {
      throw new ApiError('Valid email is required', 400, ErrorCodes.INVALID_INPUT);
    }

    if (!data.password) {
      throw new ApiError('Password is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
    }

    const email = data.email.toLowerCase().trim();
    const userType = data.userType || 'company'; // Default to company

    let user: any;
    let userData: any;

    if (userType === 'company') {
      user = await prisma.company.findUnique({
        where: { email },
      });

      if (!user || !(await verifyPassword(data.password, user.password))) {
        throw new ApiError(
          'Invalid email or password',
          401,
          ErrorCodes.INVALID_CREDENTIALS
        );
      }

      userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: 'company',
      };
    } else {
      // For investors, we'll use email as password for simplicity in this demo
      user = await prisma.investor.findUnique({
        where: { email },
      });

      if (!user) {
        throw new ApiError(
          'Invalid email or password',
          401,
          ErrorCodes.INVALID_CREDENTIALS
        );
      }

      userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: 'investor',
      };
    }

    // Create session token
    const token = createSessionToken(user.id, userType);

    // Set session cookie
    const response = successResponse({
      user: userData,
      message: 'Login successful',
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

