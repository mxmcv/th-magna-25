// API response utilities
// Standardized response formats for consistency

import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Creates a successful API response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Creates an error API response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Auth errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Permission errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Business logic errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_STATE: 'INVALID_STATE',
  
  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

/**
 * API Error class for throwing structured errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details
    );
  }

  if (error instanceof Error) {
    // Check for Prisma errors
    if (error.message.includes('Unique constraint')) {
      return errorResponse(
        'A record with this information already exists',
        409,
        ErrorCodes.DUPLICATE_ENTRY
      );
    }

    return errorResponse(
      process.env.NODE_ENV === 'production'
        ? 'An error occurred processing your request'
        : error.message,
      500,
      ErrorCodes.INTERNAL_ERROR
    );
  }

  return errorResponse(
    'An unexpected error occurred',
    500,
    ErrorCodes.INTERNAL_ERROR
  );
}

