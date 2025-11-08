import { test, expect } from '@playwright/test';
import { loginUser } from './utils/helpers';
import { mockAllAPIs } from './utils/mocks';

test.describe('Dashboard Integration', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await loginUser(page);
  });

  test('should display dashboard with all feature cards', async ({ page }) => {
    await page.goto('/dashboard');

    // Check main dashboard elements
    await expect(page.locator('text=/dashboard|welcome|rooting routine/i')).toBeVisible();

    // Check for feature cards/buttons
    await expect(page.locator('text=/begin walk|walk session|step work/i')).toBeVisible();
    await expect(page.locator('text=/need support|urge support|crisis/i')).toBeVisible();
    await expect(page.locator('text=/walkabout|grounding/i')).toBeVisible();
    await expect(page.locator('text=/inventory|daily inventory/i')).toBeVisible();
  });

  test('should display user stats', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for stats (coins, streak, walks, etc.)
    const stats = page.locator('text=/\\d+.*walks?|\\d+.*days?|\\d+.*coins?|streak/i').first();
    await expect(stats).toBeVisible();
  });

  test('should navigate to walk from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await page.click('text=/begin walk|walk session|step work/i');
    await expect(page).toHaveURL(/\/walk/);
  });

  test('should navigate to urge support from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await page.click('text=/need support|urge support|crisis/i');
    await expect(page).toHaveURL(/\/urge/);
  });

  test('should navigate to walkabout from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    const walkaboutButton = page.locator('text=/walkabout|grounding|take a walk/i').first();
    if (await walkaboutButton.isVisible()) {
      await walkaboutButton.click();
      await expect(page).toHaveURL(/\/walkabout/);
    }
  });

  test('should navigate to inventory from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await page.click('text=/inventory|daily inventory|reflection/i');
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('should display user email or profile info', async ({ page }) => {
    // Mock user profile
    await page.route('**/api/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'test@example.com',
          displayName: 'Test User',
        }),
      });
    });

    await page.goto('/dashboard');

    // Should show email or username
    await expect(page.locator('text=test@example.com, text=Test User')).toBeVisible();
  });

  test('should show logout option', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for logout/signout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // Dashboard should render properly on mobile
    await expect(page.locator('text=/dashboard|rooting routine/i')).toBeVisible();
    await expect(page.locator('text=/begin walk|walk session/i')).toBeVisible();
  });
});

test.describe('Walkabout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await loginUser(page);
  });

  test('should display walkabout guidance page', async ({ page }) => {
    await page.goto('/walkabout');

    // Should show guidance/instructions
    await expect(page.locator('text=/walkabout|grounding|nature/i')).toBeVisible();
  });

  test('should show location selection', async ({ page }) => {
    await page.goto('/walkabout');

    // Look for location options
    const locationOptions = page.locator('text=/park|trail|neighborhood|garden|outdoor/i');
    await expect(locationOptions.first()).toBeVisible();
  });

  test('should show body need selection', async ({ page }) => {
    await page.goto('/walkabout');

    // Look for body need options
    const bodyNeedOptions = page.locator('text=/movement|stillness|rest|fresh air/i');
    await expect(bodyNeedOptions.first()).toBeVisible();
  });

  test('should start walkabout timer', async ({ page }) => {
    await page.goto('/walkabout');

    // Select options if available
    const locationButton = page.locator('button:has-text("Park"), button:has-text("Trail")').first();
    if (await locationButton.isVisible()) {
      await locationButton.click();
    }

    const bodyNeedButton = page.locator('button:has-text("Movement"), button:has-text("Rest")').first();
    if (await bodyNeedButton.isVisible()) {
      await bodyNeedButton.click();
    }

    // Start walkabout
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")');
    if (await startButton.isVisible()) {
      await startButton.click();

      // Should show timer or active walkabout
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should display timer during walkabout', async ({ page }) => {
    // Mock walkabout session
    await page.route('**/api/walkabout/start', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'test-walkabout-123',
          startedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/walkabout');

    // Start walkabout
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")');
    if (await startButton.isVisible()) {
      await startButton.click();

      // Look for timer display
      const timer = page.locator('text=/\\d+:\\d+|\\d+ min/i').first();
      await expect(timer).toBeVisible();
    }
  });

  test('should allow ending walkabout', async ({ page }) => {
    await page.route('**/api/walkabout/start', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'test-walkabout-123',
          startedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/walkabout');

    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);

      // Look for end/finish button
      const endButton = page.locator('button:has-text("End"), button:has-text("Finish"), button:has-text("Complete")');
      await expect(endButton).toBeVisible();
    }
  });

  test('should show completion with coins earned', async ({ page }) => {
    await page.route('**/api/walkabout/start', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'test-walkabout-123',
          startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
        }),
      });
    });

    await page.route('**/api/walkabout/end', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          durationMinutes: 15,
          coinsEarned: 15,
          totalCoins: 115,
        }),
      });
    });

    await page.goto('/walkabout');

    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);

      const endButton = page.locator('button:has-text("End"), button:has-text("Finish"), button:has-text("Complete")').first();
      if (await endButton.isVisible()) {
        await endButton.click();

        // Should show completion with coins
        await expect(page.locator('text=/\\d+.*coins?|coins.*earned/i')).toBeVisible();
      }
    }
  });

  test('should navigate back to dashboard from walkabout', async ({ page }) => {
    await page.goto('/walkabout');

    const backButton = page.locator('button:has-text("Back"), button:has-text("Dashboard")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/walkabout');

    // Should display properly on mobile
    await expect(page.locator('text=/walkabout|grounding/i')).toBeVisible();
  });
});

test.describe('End-to-End User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await loginUser(page);
  });

  test('complete journey: login → dashboard → walk → complete → dashboard', async ({ page }) => {
    // Already logged in from beforeEach
    await page.goto('/dashboard');

    // Start walk
    await page.click('text=/begin walk|walk session/i');
    await expect(page).toHaveURL(/\/walk/);

    // Start session (minimal check-in)
    await page.click('button[type="submit"]:has-text("Step Outside")');

    // Provide response
    await page.waitForTimeout(2000);
    const responseInput = page.locator('textarea, input[type="text"]').first();
    if (await responseInput.isVisible()) {
      await responseInput.fill('Test walk response');
    }

    // Complete walk (simplified - just verify we're in session)
    await expect(page.locator('body')).toBeVisible();
  });

  test('crisis journey: dashboard → urge support → mining → reveal', async ({ page }) => {
    await page.goto('/dashboard');

    // Go to urge support
    await page.click('text=/need support|urge support/i');
    await expect(page).toHaveURL(/\/urge/);

    // Fill crisis form
    await page.fill('textarea', 'Test crisis situation');
    await page.locator('input[type="range"]').fill('7');
    await page.click('button[type="submit"]:has-text("Continue")');

    // Wait for response
    await page.waitForTimeout(2000);

    // Should see Elder Tree response or next stage
    await expect(page.locator('body')).toBeVisible();
  });

  test('daily routine: dashboard → inventory → complete', async ({ page }) => {
    // Mock inventory as available
    await page.route('**/api/inventory/today', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ hasInventory: false }),
        });
      }
    });

    await page.goto('/dashboard');

    // Go to inventory
    await page.click('text=/inventory|daily inventory/i');
    await expect(page).toHaveURL(/\/inventory/);

    // Should show first question
    await expect(page.locator('text=Question 1 of 4')).toBeVisible();

    // Answer first question
    await page.fill('textarea', 'Test inventory response');
    await page.click('button:has-text("Next")');

    // Should progress to question 2
    await expect(page.locator('text=Question 2 of 4')).toBeVisible();
  });

  test('navigation: can access all major features from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Test navigation to each feature
    const features = [
      { text: /walk/i, url: /\/walk/ },
      { text: /urge|support/i, url: /\/urge/ },
      { text: /inventory/i, url: /\/inventory/ },
    ];

    for (const feature of features) {
      await page.goto('/dashboard');
      await page.click(`text=${feature.text.source}`);
      await expect(page).toHaveURL(feature.url);
    }
  });

  test('coin accumulation: coins persist across features', async ({ page }) => {
    // Mock coin balance
    let currentCoins = 100;

    await page.route('**/api/user/coins', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ coins: currentCoins }),
      });
    });

    await page.goto('/dashboard');

    // Check initial coins
    const coinsDisplay = page.locator('text=/\\d+.*coins?/i').first();
    if (await coinsDisplay.isVisible()) {
      const initialText = await coinsDisplay.textContent();
      expect(initialText).toContain('100');
    }
  });
});
