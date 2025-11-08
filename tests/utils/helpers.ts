import { Page, expect } from '@playwright/test';
import { TEST_USER } from '../auth.setup';

/**
 * Test helper utilities for E2E tests
 */

/**
 * Login helper - authenticates a user and navigates to dashboard
 */
export async function loginUser(
  page: Page,
  email: string = TEST_USER.email,
  password: string = TEST_USER.password
) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Wait for Elder Tree AI response to complete
 */
export async function waitForElderTreeResponse(page: Page, timeout: number = 30000) {
  // Wait for loading state to appear
  await page.waitForSelector('[data-testid="loading"], .loading, [aria-busy="true"]', {
    timeout: 5000,
    state: 'visible',
  }).catch(() => {
    // Loading indicator might not appear if response is fast
  });

  // Wait for loading state to disappear
  await page.waitForSelector('[data-testid="loading"], .loading, [aria-busy="true"]', {
    timeout,
    state: 'detached',
  }).catch(() => {
    // Already disappeared
  });

  // Small delay for content to render
  await page.waitForTimeout(500);
}

/**
 * Start a walk session with specified step
 */
export async function startWalkSession(
  page: Page,
  step: 1 | 2 | 3,
  options?: {
    mood?: string;
    intention?: string;
    location?: string;
    bodyNeed?: string;
  }
) {
  // Navigate to walk page
  await page.goto('/walk');

  // Fill check-in form
  await page.selectOption('select[name="step"], [data-testid="step-selector"]', step.toString());

  if (options?.mood) {
    await page.selectOption('select[name="mood"], [data-testid="mood-selector"]', options.mood);
  }

  if (options?.intention) {
    await page.fill('input[name="intention"], [data-testid="intention-input"]', options.intention);
  }

  if (options?.location) {
    await page.selectOption('select[name="location"], [data-testid="location-selector"]', options.location);
  }

  if (options?.bodyNeed) {
    await page.selectOption('select[name="bodyNeed"], [data-testid="body-need-selector"]', options.bodyNeed);
  }

  // Submit check-in
  await page.click('button[type="submit"], [data-testid="start-walk-button"]');

  // Wait for session to start
  await waitForElderTreeResponse(page);
}

/**
 * Complete a walk session by providing responses
 */
export async function completeWalkSession(
  page: Page,
  responses: string[]
) {
  for (const response of responses) {
    // Find and fill response input
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill(response);

    // Submit response
    await page.click('button[type="submit"], [data-testid="submit-response"]');

    // Wait for Elder Tree response
    await waitForElderTreeResponse(page);
  }

  // Complete session if button exists
  const completeButton = page.locator('button:has-text("Complete"), [data-testid="complete-session"]');
  if (await completeButton.isVisible()) {
    await completeButton.click();
    await waitForElderTreeResponse(page);
  }
}

/**
 * Activate mining timer
 */
export async function activateMiningTimer(
  page: Page,
  duration?: '30min' | '1hr' | '2hr' | 'morning' | number
) {
  // Navigate to urge support
  await page.goto('/urge');

  // Fill urge description
  await page.fill('textarea, [data-testid="urge-description"]', 'Test urge description');

  // Set intensity slider
  await page.locator('input[type="range"], [data-testid="intensity-slider"]').fill('7');

  // Submit to Elder Tree
  await page.click('button[type="submit"], [data-testid="submit-urge"]');

  // Wait for Elder Tree response
  await waitForElderTreeResponse(page);

  // Click willing to listen
  await page.click('button:has-text("Willing"), [data-testid="willing-button"]');

  // Select duration if provided
  if (duration) {
    if (typeof duration === 'number') {
      // Custom duration
      await page.click('[data-testid="custom-duration"]');
      await page.fill('input[type="number"]', duration.toString());
    } else {
      // Preset duration
      const durationMap = {
        '30min': '30',
        '1hr': '60',
        '2hr': '120',
        'morning': 'until-morning',
      };
      await page.click(`[data-testid="duration-${durationMap[duration]}"]`);
    }
  }

  // Start mining
  await page.click('button:has-text("Start"), [data-testid="start-mining"]');

  // Wait for mining page to load
  await page.waitForURL('**/urge/mining', { timeout: 5000 });
}

/**
 * Get current coin balance from dashboard
 */
export async function getCoinBalance(page: Page): Promise<number> {
  await page.goto('/dashboard');

  const coinsText = await page.locator('[data-testid="coins"], .coins-display').textContent();
  const coins = parseInt(coinsText?.replace(/\D/g, '') || '0');

  return coins;
}

/**
 * Check if element is visible on page
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Wait for navigation with timeout
 */
export async function waitForNavigation(page: Page, urlPattern: string | RegExp, timeout: number = 10000) {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Clear all local storage and cookies
 */
export async function clearSessionData(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Mock time for testing timers
 */
export async function mockTime(page: Page, timestamp: Date | number) {
  await page.addInitScript(`{
    Date.now = () => ${typeof timestamp === 'number' ? timestamp : timestamp.getTime()};
  }`);
}

/**
 * Fast-forward time by specified milliseconds
 */
export async function fastForwardTime(page: Page, milliseconds: number) {
  await page.evaluate((ms) => {
    const now = Date.now();
    Date.now = () => now + ms;
  }, milliseconds);
}
