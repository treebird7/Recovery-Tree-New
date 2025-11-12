/**
 * Centralized error handling for API routes
 *
 * Provides consistent error responses, logging, and status codes
 */

import { NextResponse } from 'next/server';

/**
 * Custom API error class with status code and error code
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Predefined error types for common scenarios
 */
export const ErrorTypes = {
  Unauthorized: (message = 'Unauthorized') =>
    new APIError(message, 401, 'UNAUTHORIZED'),

  Forbidden: (message = 'Forbidden') =>
    new APIError(message, 403, 'FORBIDDEN'),

  NotFound: (message = 'Resource not found') =>
    new APIError(message, 404, 'NOT_FOUND'),

  BadRequest: (message = 'Bad request', details?: any) =>
    new APIError(message, 400, 'BAD_REQUEST', details),

  Conflict: (message = 'Resource conflict') =>
    new APIError(message, 409, 'CONFLICT'),

  TooManyRequests: (message = 'Too many requests') =>
    new APIError(message, 429, 'RATE_LIMIT_EXCEEDED'),

  InternalError: (message = 'Internal server error') =>
    new APIError(message, 500, 'INTERNAL_ERROR'),

  ServiceUnavailable: (message = 'Service temporarily unavailable') =>
    new APIError(message, 503, 'SERVICE_UNAVAILABLE'),

  DatabaseError: (message = 'Database operation failed', details?: any) =>
    new APIError(message, 500, 'DATABASE_ERROR', details),

  ValidationError: (message = 'Validation failed', details?: any) =>
    new APIError(message, 400, 'VALIDATION_ERROR', details),
};

/**
 * Standard error response interface
 */
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  path?: string;
}

/**
 * Handle API errors and return standardized response
 */
export function handleAPIError(
  error: unknown,
  context?: { path?: string; userId?: string }
): NextResponse<ErrorResponse> {
  const timestamp = new Date().toISOString();

  // Handle APIError instances
  if (error instanceof APIError) {
    const response: ErrorResponse = {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
      path: context?.path,
    };

    // Log error with context
    logError(error, { ...context, statusCode: error.statusCode });

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    logError(error, context);

    const response: ErrorResponse = {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp,
      path: context?.path,
    };

    return NextResponse.json(response, { status: 500 });
  }

  // Handle unknown error types
  console.error('Unknown error type:', error);

  const response: ErrorResponse = {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp,
    path: context?.path,
  };

  return NextResponse.json(response, { status: 500 });
}

/**
 * Log error with context for monitoring/debugging
 */
function logError(
  error: Error | APIError,
  context?: {
    path?: string;
    userId?: string;
    statusCode?: number;
    [key: string]: any;
  }
) {
  const logLevel = getLogLevel(context?.statusCode);

  const logData = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    statusCode: context?.statusCode,
    userId: context?.userId,
    path: context?.path,
    timestamp: new Date().toISOString(),
  };

  // Use appropriate log level
  if (logLevel === 'error') {
    console.error('API Error:', logData);
  } else if (logLevel === 'warn') {
    console.warn('API Warning:', logData);
  } else {
    console.info('API Info:', logData);
  }

  // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
  // Example:
  // Sentry.captureException(error, { contexts: { api: context } });
}

/**
 * Determine log level based on status code
 */
function getLogLevel(statusCode?: number): 'error' | 'warn' | 'info' {
  if (!statusCode) return 'error';
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
}

/**
 * Async error wrapper for API route handlers
 *
 * Usage:
 * export const GET = asyncHandler(async (request) => {
 *   // Your handler code
 * });
 */
export function asyncHandler(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      const url = new URL(request.url);
      return handleAPIError(error, { path: url.pathname });
    }
  };
}

/**
 * Validate request body against schema
 * Throws ValidationError if validation fails
 */
export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): asserts body is T {
  const missing = requiredFields.filter(field => !body[field]);

  if (missing.length > 0) {
    throw ErrorTypes.ValidationError(
      'Missing required fields',
      { missing }
    );
  }
}

/**
 * Assert user is authenticated
 * Throws Unauthorized error if user is null
 */
export function assertAuthenticated(
  user: any
): asserts user is NonNullable<typeof user> {
  if (!user) {
    throw ErrorTypes.Unauthorized('Authentication required');
  }
}
