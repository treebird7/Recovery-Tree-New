/**
 * Rate Limiting Implementation
 *
 * In-memory rate limiting using sliding window algorithm.
 * For production, consider using Redis-based rate limiting (Upstash, etc.)
 *
 * Features:
 * - Per-IP rate limiting
 * - Per-user rate limiting
 * - Different limits for different endpoints
 * - Sliding window algorithm for smooth rate limiting
 */

interface RateLimitEntry {
  requests: number[];
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private windowMs: number, private maxRequests: number) {
    // Start cleanup timer
    this.startCleanup();
  }

  /**
   * Check if request is allowed
   * Returns { allowed: boolean, remaining: number, reset: number }
   */
  check(
    identifier: string
  ): { allowed: boolean; remaining: number; reset: number; limit: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create entry
    let entry = this.store.get(identifier);

    if (!entry) {
      entry = {
        requests: [],
        resetTime: now + this.windowMs,
      };
      this.store.set(identifier, entry);
    }

    // Remove requests outside the window
    entry.requests = entry.requests.filter((time) => time > windowStart);

    // Check if limit exceeded
    const allowed = entry.requests.length < this.maxRequests;

    if (allowed) {
      // Add current request
      entry.requests.push(now);
      entry.resetTime = now + this.windowMs;
    }

    const remaining = Math.max(0, this.maxRequests - entry.requests.length);
    const reset = entry.resetTime;

    return {
      allowed,
      remaining,
      reset,
      limit: this.maxRequests,
    };
  }

  /**
   * Reset rate limit for specific identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Get current usage for identifier
   */
  getUsage(identifier: string): {
    requests: number;
    remaining: number;
    limit: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const entry = this.store.get(identifier);

    if (!entry) {
      return {
        requests: 0,
        remaining: this.maxRequests,
        limit: this.maxRequests,
      };
    }

    // Filter to current window
    const requests = entry.requests.filter((time) => time > windowStart);

    return {
      requests: requests.length,
      remaining: Math.max(0, this.maxRequests - requests.length),
      limit: this.maxRequests,
    };
  }

  /**
   * Start cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();

      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Stop cleanup and clear store
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// ============================================================================
// Rate Limiter Instances
// ============================================================================

/**
 * Global rate limiter: 100 requests per 15 minutes
 */
export const globalLimiter = new RateLimiter(900000, 100);

/**
 * API rate limiter: 60 requests per minute
 */
export const apiLimiter = new RateLimiter(60000, 60);

/**
 * Auth rate limiter: 5 login attempts per 15 minutes
 */
export const authLimiter = new RateLimiter(900000, 5);

/**
 * AI rate limiter: 20 Elder Tree requests per hour
 */
export const aiLimiter = new RateLimiter(3600000, 20);

/**
 * Admin rate limiter: 10 admin operations per hour
 */
export const adminLimiter = new RateLimiter(3600000, 10);

/**
 * Step In rate limiter: 100 questions per hour
 */
export const stepInLimiter = new RateLimiter(3600000, 100);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get user ID from authenticated session
  // For now, use IP address

  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    // x-forwarded-for can be comma-separated list
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Get identifier for user-based rate limiting
 */
export function getUserRateLimitIdentifier(
  userId: string,
  endpoint?: string
): string {
  return endpoint ? `user:${userId}:${endpoint}` : `user:${userId}`;
}

/**
 * Check rate limit and return result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Apply rate limit check
 */
export function checkRateLimit(
  limiter: RateLimiter,
  identifier: string
): RateLimitResult {
  return limiter.check(identifier);
}

/**
 * Create rate limit error response data
 */
export function createRateLimitError(result: RateLimitResult) {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return {
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: `${retryAfter} seconds`,
  };
}

// ============================================================================
// Rate Limit Configurations
// ============================================================================

export const RateLimitConfig = {
  GLOBAL: {
    windowMs: 900000, // 15 minutes
    max: 100,
  },
  API: {
    windowMs: 60000, // 1 minute
    max: 60,
  },
  AUTH: {
    windowMs: 900000, // 15 minutes
    max: 5,
  },
  AI: {
    windowMs: 3600000, // 1 hour
    max: 20,
  },
  ADMIN: {
    windowMs: 3600000, // 1 hour
    max: 10,
  },
  STEP_IN: {
    windowMs: 3600000, // 1 hour
    max: 100,
  },
} as const;

/**
 * Get appropriate rate limiter for endpoint
 */
export function getRateLimiterForEndpoint(pathname: string): RateLimiter {
  if (pathname.startsWith('/api/auth')) {
    return authLimiter;
  }

  if (pathname.startsWith('/api/admin')) {
    return adminLimiter;
  }

  if (pathname.includes('encouragement') || pathname.includes('prayer')) {
    return aiLimiter;
  }

  if (pathname.startsWith('/api/step-in')) {
    return stepInLimiter;
  }

  if (pathname.startsWith('/api')) {
    return apiLimiter;
  }

  return globalLimiter;
}

/**
 * Check if endpoint should be rate limited
 */
export function shouldRateLimit(pathname: string): boolean {
  // Skip rate limiting for health checks and static assets
  const skipPatterns = [
    '/health',
    '/_next',
    '/favicon.ico',
    '/api/health',
  ];

  return !skipPatterns.some((pattern) => pathname.startsWith(pattern));
}

// ============================================================================
// Cleanup on process exit
// ============================================================================

if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    console.log('[RateLimit] Shutting down rate limiters...');
    globalLimiter.destroy();
    apiLimiter.destroy();
    authLimiter.destroy();
    aiLimiter.destroy();
    adminLimiter.destroy();
    stepInLimiter.destroy();
  });
}

// ============================================================================
// Advanced Features
// ============================================================================

/**
 * Whitelist for bypassing rate limits
 */
const rateLimitWhitelist = new Set<string>();

/**
 * Add identifier to whitelist
 */
export function addToWhitelist(identifier: string): void {
  rateLimitWhitelist.add(identifier);
}

/**
 * Remove identifier from whitelist
 */
export function removeFromWhitelist(identifier: string): void {
  rateLimitWhitelist.delete(identifier);
}

/**
 * Check if identifier is whitelisted
 */
export function isWhitelisted(identifier: string): boolean {
  return rateLimitWhitelist.has(identifier);
}

/**
 * Dynamic rate limiting based on user tier
 */
export interface UserTier {
  tier: 'free' | 'premium' | 'admin';
  multiplier: number; // Multiply base limits
}

export function getRateLimitForTier(
  baseLimiter: RateLimiter,
  tier: UserTier['tier']
): RateLimiter {
  const multipliers = {
    free: 1,
    premium: 3,
    admin: 10,
  };

  // In a real implementation, you'd create custom limiters per tier
  // For now, just return the base limiter
  return baseLimiter;
}
