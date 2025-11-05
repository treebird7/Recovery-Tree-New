# Rooting Routine - E2E Tests

This directory contains end-to-end tests for the Rooting Routine application using Playwright.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Environment Variables

The tests require the following environment variables to be set in your `.env.local` file:

```env
# Required for all tests
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Required for tests that create/delete test users
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

**Note:** Some tests will be skipped if `SUPABASE_SERVICE_KEY` is not provided. These tests require admin access to create and delete test users.

## Running Tests

### Run all tests (headless mode)
```bash
npm test
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run specific test file
```bash
npx playwright test tests/authentication.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "should display login form"
```

### View test report
```bash
npm run test:report
```

## Test Coverage

### Authentication Tests (`authentication.spec.ts`)

#### Login Page Tests
- ✅ Display login form with all elements
- ✅ Show validation for empty form submission
- ✅ Show error for invalid credentials
- ✅ Successfully login with valid credentials
- ✅ Navigate to signup page from login

#### Signup Page Tests
- ✅ Display signup form with all elements
- ✅ Show error when passwords do not match
- ✅ Show error for short password (< 6 characters)
- ✅ Show loading state during signup
- ✅ Successfully signup and redirect or show confirmation
- ✅ Navigate to login page from signup

#### Protected Routes Tests
- ✅ Redirect to login when accessing dashboard without authentication
- ✅ Allow access to dashboard when authenticated

#### Logout Tests
- ✅ Successfully logout and redirect to home

#### Form Accessibility Tests
- ✅ Login form keyboard accessibility
- ✅ Signup form keyboard accessibility
- ✅ Login form proper labels and attributes
- ✅ Signup form proper labels and attributes

#### Mobile Responsiveness Tests
- ✅ Login page mobile responsive
- ✅ Signup page mobile responsive

## Test Structure

```
tests/
├── README.md                    # This file
├── auth.setup.ts               # Authentication utilities and test user management
└── authentication.spec.ts      # Authentication flow tests
```

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/path');

  // Your test code here
  await expect(page.getByRole('heading')).toBeVisible();
});
```

### Using Test Utilities

```typescript
import { TEST_USER, createTestUser } from './auth.setup';

test('should test authenticated flow', async ({ page }) => {
  // Create a test user
  await createTestUser(TEST_USER.email, TEST_USER.password);

  // Login
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Test authenticated features
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## CI/CD Integration

To run tests in CI/CD, ensure:

1. All environment variables are set
2. The dev server is running or use the built-in web server
3. Playwright browsers are installed

Example GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## Debugging Tests

### Visual debugging with UI mode
```bash
npm run test:ui
```

### Step through tests
```bash
npm run test:debug
```

### Generate trace
Tests automatically generate traces on first retry. View them with:
```bash
npx playwright show-trace trace.zip
```

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for elements**: Use Playwright's auto-waiting instead of manual waits
3. **Clean up test data**: Use `beforeAll`/`afterAll` hooks to clean up test users
4. **Test in isolation**: Each test should be independent and not rely on other tests
5. **Use descriptive test names**: Test names should clearly describe what they test
6. **Test accessibility**: Include keyboard navigation and screen reader tests

## Troubleshooting

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify Supabase credentials are correct

### Tests failing on CI but passing locally
- Ensure all environment variables are set in CI
- Check if browsers are installed with `--with-deps` flag
- Review CI logs for specific errors

### Authentication tests failing
- Verify `SUPABASE_SERVICE_KEY` is set correctly
- Check that test users are being created and cleaned up properly
- Review Supabase dashboard for any auth configuration issues

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
