import { test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Authentication setup utilities for Playwright tests
 */

// Test user credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};

export const TEST_USER_2 = {
  email: 'test2@example.com',
  password: 'testpassword456',
};

/**
 * Create a Supabase admin client for test setup/teardown
 * Note: This requires SUPABASE_SERVICE_KEY to be set in environment
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Clean up test users before running tests
 * This ensures a clean state for testing
 */
export async function cleanupTestUsers() {
  try {
    const admin = getSupabaseAdmin();

    // Get all users and delete test users
    const { data: { users }, error } = await admin.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return;
    }

    const testEmails = [TEST_USER.email, TEST_USER_2.email];
    const testUsers = users?.filter(user => testEmails.includes(user.email || ''));

    for (const user of testUsers || []) {
      await admin.auth.admin.deleteUser(user.id);
    }

    console.log('Test users cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test users:', error);
    // Don't throw - we want tests to continue even if cleanup fails
  }
}

/**
 * Create a test user for authentication tests
 */
export async function createTestUser(email: string, password: string) {
  try {
    const admin = getSupabaseAdmin();

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for testing
    });

    if (error) {
      console.error('Error creating test user:', error);
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Error in createTestUser:', error);
    throw error;
  }
}
