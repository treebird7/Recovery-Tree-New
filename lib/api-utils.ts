/**
 * API utility functions for timeout handling and error management
 */

/**
 * Wraps a promise with a timeout to prevent hanging requests
 * @param promise The promise to execute
 * @param timeoutMs Timeout in milliseconds (default 10 seconds)
 * @returns Promise that rejects with timeout error if not resolved in time
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ])
}

/**
 * Validates required environment variables
 * @param vars Object with variable names and their values
 * @throws Error if any required variable is missing
 */
export function validateEnvVars(vars: Record<string, string | undefined>): void {
  const missing = Object.entries(vars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

/**
 * Formats error responses consistently across API routes
 */
export function formatErrorResponse(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    // Handle timeout specifically
    if (error.message === 'Request timeout') {
      return {
        message: 'Request timed out. Please check your network connection and try again.',
        status: 504,
      }
    }

    // Handle env var errors
    if (error.message.includes('environment variables')) {
      return {
        message: 'Server configuration error. Please contact support.',
        status: 500,
      }
    }

    return {
      message: error.message,
      status: 500,
    }
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
  }
}
