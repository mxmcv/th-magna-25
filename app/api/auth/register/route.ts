// Company registration endpoint
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  successResponse,
  handleApiError,
  ApiError,
  ErrorCodes,
} from '@/lib/api/responses';
import { hashPassword, createSessionToken } from '@/lib/api/auth';
import {
  validateCompanyRegistration,
  parseRequestBody,
} from '@/lib/api/validation';

export async function POST(request: NextRequest) {
  try {
    const data = await parseRequestBody(request);
    const validated = validateCompanyRegistration(data);

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: validated.email },
    });

    if (existingCompany) {
      throw new ApiError(
        'A company with this email already exists',
        409,
        ErrorCodes.DUPLICATE_ENTRY
      );
    }

    // Hash password and create company
    const hashedPassword = await hashPassword(validated.password);

    const company = await prisma.company.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Create session token
    const token = createSessionToken(company.id, 'company');

    // Set session cookie
    const response = successResponse(
      {
        company,
        message: 'Company registered successfully',
      },
      201
    );

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

