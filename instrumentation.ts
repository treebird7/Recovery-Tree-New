/**
 * Instrumentation for Next.js server startup
 * This file runs once when the server starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate environment variables on server startup
    const { validateEnv } = await import('./lib/config/env');

    try {
      validateEnv();
      console.log('✅ Environment validation passed');
    } catch (error) {
      console.error('❌ Environment validation failed:');
      console.error(error);
      // In development, warn but don't crash
      // In production, this will prevent the app from starting
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
}
