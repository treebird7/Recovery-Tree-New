/**
 * Security Headers Configuration
 *
 * Implements security best practices through HTTP headers:
 * - Content Security Policy (CSP)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 */

import { NextResponse } from 'next/server';

/**
 * Security headers to add to all responses
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // XSS Protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',

  // Permissions Policy (restrict browser features)
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  // Strict Transport Security (HTTPS only)
  // Only enable in production with HTTPS
  ...(process.env.NODE_ENV === 'production'
    ? {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      }
    : {}),
} as const;

/**
 * Content Security Policy directives
 *
 * Configure CSP to prevent XSS and data injection attacks
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],

  // Scripts: Allow self and Next.js inline scripts
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for Next.js dev mode
    ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
  ],

  // Styles: Allow self and inline styles
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and emotion/styled-components
  ],

  // Images: Allow self, data URIs, and external sources
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.supabase.co', // Supabase storage
  ],

  // Fonts: Allow self and data URIs
  'font-src': ["'self'", 'data:'],

  // Connect to: API endpoints and Supabase
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://api.anthropic.com', // Elder Tree AI
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:*', 'ws://localhost:*']
      : []),
  ],

  // Frames: Restrict embedding
  'frame-src': ["'none'"],

  // Objects: Disallow plugins
  'object-src': ["'none'"],

  // Base URI: Restrict base tag
  'base-uri': ["'self'"],

  // Form actions: Restrict form submissions
  'form-action': ["'self'"],

  // Frame ancestors: Prevent embedding (redundant with X-Frame-Options)
  'frame-ancestors': ["'none'"],

  // Upgrade insecure requests in production
  ...(process.env.NODE_ENV === 'production'
    ? { 'upgrade-insecure-requests': [] }
    : {}),
} as const;

/**
 * Build CSP header value from directives
 */
export function buildCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply all security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply Content Security Policy
  response.headers.set('Content-Security-Policy', buildCSPHeader());

  return response;
}

/**
 * CORS headers for API routes
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Secret',
  'Access-Control-Max-Age': '86400', // 24 hours
} as const;

/**
 * Apply CORS headers to response
 */
export function applyCORSHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Create OPTIONS response for CORS preflight
 */
export function createOptionsResponse(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCORSHeaders(response);
}

/**
 * Security headers for static assets
 */
export const STATIC_ASSET_HEADERS = {
  // Cache control for immutable assets
  'Cache-Control': 'public, max-age=31536000, immutable',

  // Security headers for static content
  'X-Content-Type-Options': 'nosniff',
} as const;

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests don't send Origin header

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:8100', // Capacitor dev
  ].filter(Boolean);

  return allowedOrigins.some((allowed) => origin.startsWith(allowed as string));
}

/**
 * Rate limit headers
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  if (remaining === 0) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

/**
 * Security headers for API responses
 */
export function secureAPIResponse(response: NextResponse): NextResponse {
  // Add security headers
  applySecurityHeaders(response);

  // Add API-specific headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent caching of API responses
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
