import { NextResponse } from 'next/server';
import { ZodError, ZodIssue } from 'zod';

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export function createSuccessResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
  });
}

export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    { status }
  );
}

export function handleValidationError(error: ZodError): NextResponse<ApiResponse> {
  const fieldErrors = error.issues.reduce((acc: Record<string, string>, err: ZodIssue) => {
    const path = err.path.join('.');
    acc[path] = err.message;
    return acc;
  }, {});

  return createErrorResponse(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    { fieldErrors }
  );
}

export function handleDatabaseError(error: unknown): NextResponse<ApiResponse> {
  // Handle Prisma errors by checking error properties instead of instanceof
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message: string };
    
    switch (prismaError.code) {
      case 'P2002':
        return createErrorResponse(
          'A record with this information already exists',
          409,
          'DUPLICATE_RECORD'
        );
      case 'P2025':
        return createErrorResponse(
          'Record not found',
          404,
          'RECORD_NOT_FOUND'
        );
      case 'P2003':
        return createErrorResponse(
          'Related record not found',
          400,
          'FOREIGN_KEY_CONSTRAINT'
        );
      case 'P2014':
        return createErrorResponse(
          'Invalid data provided',
          400,
          'INVALID_DATA'
        );
      default:
        return createErrorResponse(
          'Database operation failed',
          500,
          'DATABASE_ERROR',
          { prismaCode: prismaError.code }
        );
    }
  }

  return createErrorResponse(
    'Database operation failed',
    500,
    'DATABASE_ERROR'
  );
}

export async function withErrorHandler<T>(
  operation: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await operation();
    return createSuccessResponse(result);
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return createErrorResponse(
          'Authentication required',
          401,
          'UNAUTHORIZED'
        );
      }
      
      if (error.message.includes('not found')) {
        return createErrorResponse(
          error.message,
          404,
          'NOT_FOUND'
        );
      }

      if (error.message.includes('Cannot delete')) {
        return createErrorResponse(
          error.message,
          400,
          'CONSTRAINT_VIOLATION'
        );
      }
    }

    if (error instanceof ZodError) {
      return handleValidationError(error);
    }

    if (error && typeof error === 'object' && 'code' in error) {
      return handleDatabaseError(error);
    }

    return createErrorResponse(
      'An unexpected error occurred',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}