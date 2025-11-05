import { test, expect } from '@playwright/test';
import { TEST_USER, TEST_USER_2, cleanupTestUsers, createTestUser } from './auth.setup';

/**
 * Authentication Flow Tests for Rooting Routine
 *
 * Tests cover:
 * - Login functionality
 * - Signup functionality
 * - Protected route access
 * - Logout functionality
 * - Form validation
 */

test.describe('Authentication Flow', () => {
  // Clean up test users before running tests
  test.beforeAll(async () => {
    // Only run cleanup if we have admin credentials
    if (process.env.SUPABASE_SERVICE_KEY) {
      await cleanupTestUsers();
    }
  });

  test.describe('Login Page', () => {
    test('should display login form with all elements', async ({ page }) => {
      await page.goto('/login');

      // Check page heading
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

      // Check form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

      // Check signup link
      await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
    });

    test('should show validation for empty form submission', async ({ page }) => {
      await page.goto('/login');

      // Try to submit empty form
      await page.getByRole('button', { name: /sign in/i }).click();

      // HTML5 validation should prevent submission
      const emailInput = page.getByLabel(/email/i);
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBe(true);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill in invalid credentials
      await page.getByLabel(/email/i).fill('nonexistent@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');

      // Submit form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for error message
      await expect(page.getByText(/invalid login credentials/i)).toBeVisible({ timeout: 10000 });
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      // Skip if no admin access to create test users
      test.skip(!process.env.SUPABASE_SERVICE_KEY, 'Requires Supabase service key');

      // Create test user first
      await createTestUser(TEST_USER.email, TEST_USER.password);

      await page.goto('/login');

      // Fill in valid credentials
      await page.getByLabel(/email/i).fill(TEST_USER.email);
      await page.getByLabel(/password/i).fill(TEST_USER.password);

      // Submit form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Should see user email on dashboard
      await expect(page.getByText(TEST_USER.email)).toBeVisible();
    });

    test('should navigate to signup page from login', async ({ page }) => {
      await page.goto('/login');

      // Click signup link
      await page.getByRole('link', { name: /sign up/i }).click();

      // Should navigate to signup page
      await expect(page).toHaveURL(/\/signup/);
      await expect(page.getByRole('heading', { name: /start your journey/i })).toBeVisible();
    });
  });

  test.describe('Signup Page', () => {
    test('should display signup form with all elements', async ({ page }) => {
      await page.goto('/signup');

      // Check page heading
      await expect(page.getByRole('heading', { name: /start your journey/i })).toBeVisible();

      // Check form elements
      await expect(page.getByLabel(/^email$/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();

      // Check login link
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with mismatched passwords
      await page.getByLabel(/^email$/i).fill('newuser@example.com');
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByLabel(/confirm password/i).fill('password456');

      // Submit form
      await page.getByRole('button', { name: /sign up/i }).click();

      // Should show error
      await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('should show error for short password', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with short password
      await page.getByLabel(/^email$/i).fill('newuser@example.com');
      await page.getByLabel(/^password$/i).fill('12345');
      await page.getByLabel(/confirm password/i).fill('12345');

      // Submit form
      await page.getByRole('button', { name: /sign up/i }).click();

      // Should show error
      await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible();
    });

    test('should show loading state during signup', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with valid data
      await page.getByLabel(/^email$/i).fill('newuser@example.com');
      await page.getByLabel(/^password$/i).fill('password123');
      await page.getByLabel(/confirm password/i).fill('password123');

      // Start watching for button text change
      const submitButton = page.getByRole('button', { name: /sign up/i });

      // Submit form
      await submitButton.click();

      // Should show loading state (button text changes)
      await expect(page.getByRole('button', { name: /creating account/i })).toBeVisible({ timeout: 2000 });
    });

    test('should successfully signup and redirect or show confirmation', async ({ page }) => {
      // Skip if no admin access
      test.skip(!process.env.SUPABASE_SERVICE_KEY, 'Requires Supabase service key');

      await page.goto('/signup');

      // Fill form with valid data
      const uniqueEmail = `test-${Date.now()}@example.com`;
      await page.getByLabel(/^email$/i).fill(uniqueEmail);
      await page.getByLabel(/^password$/i).fill('testpassword123');
      await page.getByLabel(/confirm password/i).fill('testpassword123');

      // Submit form
      await page.getByRole('button', { name: /sign up/i }).click();

      // Either redirects to dashboard (if email confirmation disabled)
      // Or shows email confirmation message
      await Promise.race([
        expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 }),
        expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10000 }),
      ]);
    });

    test('should navigate to login page from signup', async ({ page }) => {
      await page.goto('/signup');

      // Click login link
      await page.getByRole('link', { name: /sign in/i }).click();

      // Should navigate to login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without authentication', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should allow access to dashboard when authenticated', async ({ page }) => {
      // Skip if no admin access
      test.skip(!process.env.SUPABASE_SERVICE_KEY, 'Requires Supabase service key');

      // Create and login as test user
      await createTestUser(TEST_USER_2.email, TEST_USER_2.password);

      await page.goto('/login');
      await page.getByLabel(/email/i).fill(TEST_USER_2.email);
      await page.getByLabel(/password/i).fill(TEST_USER_2.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      await expect(page.getByRole('heading', { name: /rooting routine/i })).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should successfully logout and redirect to home', async ({ page }) => {
      // Skip if no admin access
      test.skip(!process.env.SUPABASE_SERVICE_KEY, 'Requires Supabase service key');

      // Create and login as test user
      const uniqueEmail = `logout-test-${Date.now()}@example.com`;
      await createTestUser(uniqueEmail, 'testpassword123');

      await page.goto('/login');
      await page.getByLabel(/email/i).fill(uniqueEmail);
      await page.getByLabel(/password/i).fill('testpassword123');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Click logout button
      await page.getByRole('button', { name: /logout|sign out/i }).click();

      // Should redirect to home or login
      await expect(page).toHaveURL(/^\/(login)?$/, { timeout: 10000 });

      // Trying to access dashboard should redirect to login
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });

  test.describe('Form Accessibility', () => {
    test('login form should be keyboard accessible', async ({ page }) => {
      await page.goto('/login');

      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.getByLabel(/email/i)).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByLabel(/password/i)).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused();
    });

    test('signup form should be keyboard accessible', async ({ page }) => {
      await page.goto('/signup');

      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.getByLabel(/^email$/i)).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByLabel(/^password$/i)).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByLabel(/confirm password/i)).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /sign up/i })).toBeFocused();
    });

    test('login form should have proper labels', async ({ page }) => {
      await page.goto('/login');

      // Check that inputs are properly labeled
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);

      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
    });

    test('signup form should have proper labels', async ({ page }) => {
      await page.goto('/signup');

      // Check that inputs are properly labeled
      const emailInput = page.getByLabel(/^email$/i);
      const passwordInput = page.getByLabel(/^password$/i);
      const confirmInput = page.getByLabel(/confirm password/i);

      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmInput).toHaveAttribute('type', 'password');
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
      await expect(confirmInput).toHaveAttribute('required');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('login page should be mobile responsive', async ({ page }) => {
      await page.goto('/login');

      // Page should be scrollable and form should be visible
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

      // Form should be usable
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('password123');

      // Button should be clickable
      const submitButton = page.getByRole('button', { name: /sign in/i });
      await expect(submitButton).toBeEnabled();
    });

    test('signup page should be mobile responsive', async ({ page }) => {
      await page.goto('/signup');

      // Page should be scrollable and form should be visible
      await expect(page.getByRole('heading', { name: /start your journey/i })).toBeVisible();
      await expect(page.getByLabel(/^email$/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    });
  });
});
