/**
 * Sentry Error Monitoring Integration
 *
 * Provides error tracking, performance monitoring, and user session recording.
 * This file contains integration points for Sentry.
 *
 * Setup instructions:
 * 1. Install: npm install @sentry/nextjs
 * 2. Set SENTRY_DSN in environment variables
 * 3. Run: npx @sentry/wizard@latest -i nextjs
 * 4. Uncomment initialization code below
 */

/**
 * Check if Sentry is enabled
 */
export const SENTRY_ENABLED =
  !!process.env.SENTRY_DSN && process.env.NODE_ENV === 'production';

/**
 * Sentry configuration
 */
export const SENTRY_CONFIG = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',

  // Ignore common errors
  ignoreErrors: [
    // Browser errors
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',

    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
  ],

  // Don't capture localhost
  beforeSend(event: any) {
    if (event.request?.url?.includes('localhost')) {
      return null;
    }
    return event;
  },
} as const;

// ============================================================================
// Sentry Initialization (Uncomment after installing @sentry/nextjs)
// ============================================================================

// import * as Sentry from '@sentry/nextjs';

// export function initSentry() {
//   if (!SENTRY_ENABLED) {
//     console.log('[Sentry] Disabled (no DSN or not in production)');
//     return;
//   }

//   Sentry.init({
//     dsn: SENTRY_CONFIG.dsn,
//     environment: SENTRY_CONFIG.environment,
//     tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,
//     debug: SENTRY_CONFIG.debug,
//     ignoreErrors: SENTRY_CONFIG.ignoreErrors,
//     beforeSend: SENTRY_CONFIG.beforeSend,
//   });

//   console.log('[Sentry] Initialized');
// }

// ============================================================================
// Error Capture Helpers
// ============================================================================

export interface ErrorContext {
  userId?: string;
  endpoint?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: ErrorContext): void {
  if (!SENTRY_ENABLED) {
    // Log to console in development
    console.error('[Error]', error, context);
    return;
  }

  // Uncomment after installing Sentry
  // Sentry.captureException(error, {
  //   user: context?.userId ? { id: context.userId } : undefined,
  //   tags: context?.tags,
  //   extra: context?.extra,
  //   contexts: {
  //     endpoint: {
  //       path: context?.endpoint,
  //     },
  //   },
  // });
}

/**
 * Capture message (non-error event)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
): void {
  if (!SENTRY_ENABLED) {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }

  // Uncomment after installing Sentry
  // Sentry.captureMessage(message, {
  //   level,
  //   user: context?.userId ? { id: context.userId } : undefined,
  //   tags: context?.tags,
  //   extra: context?.extra,
  // });
}

/**
 * Set user context
 */
export function setUser(userId: string, email?: string): void {
  if (!SENTRY_ENABLED) return;

  // Uncomment after installing Sentry
  // Sentry.setUser({
  //   id: userId,
  //   email,
  // });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (!SENTRY_ENABLED) return;

  // Uncomment after installing Sentry
  // Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
): void {
  if (!SENTRY_ENABLED) return;

  // Uncomment after installing Sentry
  // Sentry.addBreadcrumb({
  //   message,
  //   category,
  //   data,
  //   timestamp: Date.now() / 1000,
  // });
}

/**
 * Start performance transaction
 */
export function startTransaction(name: string, op: string): any {
  if (!SENTRY_ENABLED) return null;

  // Uncomment after installing Sentry
  // return Sentry.startTransaction({
  //   name,
  //   op,
  // });
}

/**
 * Capture API error with context
 */
export function captureAPIError(
  error: Error,
  request: Request,
  userId?: string
): void {
  const url = new URL(request.url);

  captureException(error, {
    userId,
    endpoint: url.pathname,
    tags: {
      method: request.method,
      path: url.pathname,
    },
    extra: {
      query: Object.fromEntries(url.searchParams),
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'content-type': request.headers.get('content-type'),
      },
    },
  });
}

/**
 * Capture database error
 */
export function captureDatabaseError(
  error: Error,
  context: {
    operation: string;
    table?: string;
    userId?: string;
  }
): void {
  captureException(error, {
    userId: context.userId,
    tags: {
      type: 'database',
      operation: context.operation,
      table: context.table || 'unknown',
    },
  });
}

/**
 * Capture AI/API integration error
 */
export function captureAIError(
  error: Error,
  context: {
    provider: 'anthropic' | 'other';
    endpoint: string;
    userId?: string;
  }
): void {
  captureException(error, {
    userId: context.userId,
    tags: {
      type: 'ai_integration',
      provider: context.provider,
    },
    extra: {
      endpoint: context.endpoint,
    },
  });
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    // Log performance metric
    if (duration > 1000) {
      console.warn(`[Performance] ${name} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[Performance] ${name} failed after ${duration}ms`, error);
    throw error;
  }
}

/**
 * Track custom metric
 */
export function trackMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  if (!SENTRY_ENABLED) {
    console.log(`[Metric] ${name}:`, value, tags);
    return;
  }

  // Log metric (Sentry will aggregate)
  // In production, you might use a dedicated metrics service
}

// ============================================================================
// Feature Flag Tracking
// ============================================================================

/**
 * Track feature flag usage
 */
export function trackFeatureFlag(
  flag: string,
  enabled: boolean,
  userId?: string
): void {
  addBreadcrumb(`Feature flag: ${flag} = ${enabled}`, 'feature_flag', {
    flag,
    enabled,
    userId,
  });
}

// ============================================================================
// Console Methods Wrappers (with Sentry integration)
// ============================================================================

/**
 * Enhanced console.error that also sends to Sentry
 */
export function logError(message: string, error?: Error, context?: ErrorContext): void {
  console.error(message, error);

  if (error) {
    captureException(error, context);
  } else {
    captureMessage(message, 'error', context);
  }
}

/**
 * Enhanced console.warn that also sends to Sentry
 */
export function logWarning(message: string, context?: ErrorContext): void {
  console.warn(message);
  captureMessage(message, 'warning', context);
}

/**
 * Enhanced console.info (doesn't send to Sentry by default)
 */
export function logInfo(message: string, data?: any): void {
  console.info(message, data);
}

// ============================================================================
// Initialization Export
// ============================================================================

/**
 * Initialize monitoring (call this in your app entry point)
 */
export function initMonitoring(): void {
  if (SENTRY_ENABLED) {
    console.log('[Monitoring] Sentry enabled');
    // initSentry(); // Uncomment after installing @sentry/nextjs
  } else {
    console.log('[Monitoring] Running without Sentry (development mode or no DSN)');
  }
}
