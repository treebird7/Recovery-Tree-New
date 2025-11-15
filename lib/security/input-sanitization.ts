/**
 * Input Sanitization and Validation
 *
 * Provides utilities to sanitize user input and prevent common security vulnerabilities:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection (defense in depth - Supabase already protects)
 * - Command Injection
 * - Path Traversal
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 * Removes/escapes potentially dangerous HTML tags and attributes
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Escape remaining HTML special characters for display
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Sanitize text for safe database storage
 * Removes null bytes and control characters
 */
export function sanitizeForDatabase(input: string): string {
  if (!input) return '';

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove other control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim excessive whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  // Remove path separators and traversal attempts
  let sanitized = filename.replace(/[/\\]/g, '');
  sanitized = sanitized.replace(/\.\./g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove special shell characters
  sanitized = sanitized.replace(/[;&|`$()]/g, '');

  // Limit to alphanumeric, dash, underscore, and period
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Ensure it doesn't start with a dot (hidden file)
  if (sanitized.startsWith('.')) {
    sanitized = sanitized.substring(1);
  }

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // Basic email regex - RFC 5322 compliant
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email) && email.length <= 320;
}

/**
 * Validate URL format and ensure it's safe
 */
export function isValidURL(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Check for suspicious patterns
    if (url.includes('javascript:') || url.includes('data:')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize user-generated text content (journal entries, answers, etc.)
 * Preserves basic formatting but removes dangerous content
 */
export function sanitizeUserText(input: string, maxLength: number = 10000): string {
  if (!input) return '';

  // Sanitize for database
  let sanitized = sanitizeForDatabase(input);

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate integer within range
 */
export function isValidInteger(
  value: any,
  min?: number,
  max?: number
): boolean {
  const num = parseInt(value, 10);

  if (isNaN(num) || !Number.isInteger(num)) {
    return false;
  }

  if (min !== undefined && num < min) {
    return false;
  }

  if (max !== undefined && num > max) {
    return false;
  }

  return true;
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const key in obj) {
    // Skip dangerous keys
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
}

/**
 * Rate limit key sanitization
 * Ensures consistent, safe keys for rate limiting
 */
export function sanitizeRateLimitKey(identifier: string): string {
  if (!identifier) return 'anonymous';

  // Remove everything except alphanumeric, dash, underscore, period, colon
  let sanitized = identifier.replace(/[^a-zA-Z0-9._:-]/g, '_');

  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized;
}

/**
 * Validate step number (1, 2, or 3)
 */
export function isValidStepNumber(step: any): step is 1 | 2 | 3 {
  return [1, 2, 3].includes(parseInt(step, 10));
}

/**
 * Validate session type
 */
export function isValidSessionType(
  type: any
): type is 'walk' | 'mining' | 'walkabout' {
  return ['walk', 'mining', 'walkabout'].includes(type);
}

/**
 * Validate mood value
 */
export function isValidMood(mood: any): boolean {
  const validMoods = [
    'anxious',
    'restless',
    'down',
    'triggered',
    'neutral',
    'calm',
    'hopeful',
    'grounded',
  ];
  return validMoods.includes(mood);
}

/**
 * Sanitize and validate request headers
 */
export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {};

  // Only include safe headers
  const allowedHeaders = [
    'content-type',
    'user-agent',
    'accept',
    'accept-language',
    'x-admin-secret',
  ];

  for (const header of allowedHeaders) {
    const value = headers.get(header);
    if (value) {
      sanitized[header] = sanitizeForDatabase(value);
    }
  }

  return sanitized;
}

/**
 * Check for SQL injection patterns (defense in depth)
 * Note: Supabase/PostgreSQL already prevents SQL injection via parameterized queries
 * This is an additional check for logging and monitoring
 */
export function containsSQLInjectionPatterns(input: string): boolean {
  if (!input) return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(UNION\s+SELECT)/i,
    /(;\s*DROP)/i,
    /('|")\s*(OR|AND)\s*('|")?\s*=\s*('|")?/i,
    /(--|\*\/|\/\*)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Log suspicious input for security monitoring
 */
export function logSuspiciousInput(
  input: string,
  context: {
    userId?: string;
    endpoint?: string;
    type: 'sql_injection' | 'xss' | 'path_traversal' | 'other';
  }
): void {
  console.warn('[SECURITY] Suspicious input detected:', {
    type: context.type,
    userId: context.userId,
    endpoint: context.endpoint,
    inputLength: input.length,
    sample: input.substring(0, 100),
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to security monitoring service (Sentry, etc.)
}
