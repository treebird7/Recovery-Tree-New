/**
 * Environment variable validation
 *
 * Validates required environment variables at startup to fail fast
 * rather than encountering runtime errors.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY', // Required for admin operations
  'ANTHROPIC_API_KEY',          // Required for Elder Tree AI features
  'ADMIN_SECRET_KEY',            // Required for admin endpoints
] as const;

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate required environment variables
 * @throws Error if any required variables are missing
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check optional variables and warn if missing
  for (const key of optionalEnvVars) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  const isValid = missing.length === 0;

  if (!isValid) {
    const error = new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nPlease check your .env.local file.`
    );
    error.name = 'EnvironmentValidationError';
    throw error;
  }

  // Log warnings for optional variables
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Optional environment variables not set:');
    warnings.forEach(key => {
      console.warn(`   - ${key}`);
    });
    console.warn('   Some features may not work correctly.\n');
  }

  return { isValid, missing, warnings };
}

/**
 * Get a required environment variable
 * @throws Error if variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get an optional environment variable with default
 */
export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Check if a specific feature is available based on env vars
 */
export const features = {
  hasElderTree: !!process.env.ANTHROPIC_API_KEY,
  hasAdmin: !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.ADMIN_SECRET_KEY,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
