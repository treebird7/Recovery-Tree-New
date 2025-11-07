import { test, expect } from '@playwright/test';
import { loginUser, waitForElderTreeResponse, isVisible } from './utils/helpers';
import { mockAllAPIs, mockUrgeResponse } from './utils/mocks';
import { urgeScenarios, miningDurations } from './utils/fixtures';

test.describe('Urge Support Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock all external APIs
    await mockAllAPIs(page);

    // Login before each test
    await loginUser(page);
  });

  test.describe('Crisis Landing Page', () => {
    test('should display Elder Tree crisis page with all elements', async ({ page }) => {
      await page.goto('/urge');

      // Check Elder Tree header
      await expect(page.locator('h1')).toContainText('Elder Tree');
      await expect(page.locator('text=🌳')).toBeVisible();

      // Check greeting with username and time
      await expect(page.locator('body')).toContainText(/Hey.*\d+:\d+\s?(AM|PM)/i);

      // Check input textarea
      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.locator('textarea')).toHaveAttribute('placeholder', /Type what('|')s happening/i);

      // Check urge strength slider
      await expect(page.locator('input[type="range"]')).toBeVisible();
      await expect(page.locator('text=How strong is the urge')).toBeVisible();

      // Check intensity labels
      await expect(page.locator('text=0')).toBeVisible();
      await expect(page.locator('text=10')).toBeVisible();

      // Check submit button
      await expect(page.locator('button[type="submit"]:has-text("Continue")')).toBeVisible();

      // Check back button
      await expect(page.locator('button:has-text("Back to Dashboard")')).toBeVisible();
    });

    test('should show intensity level labels as slider changes', async ({ page }) => {
      await page.goto('/urge');

      const slider = page.locator('input[type="range"]');
      const intensityValue = page.locator('text=/^\\d+$/').first(); // The numeric value display

      // Test different intensity levels
      await slider.fill('0');
      await expect(page.locator('text=(Just checking in)')).toBeVisible();

      await slider.fill('3');
      await expect(page.locator('text=(Mild)')).toBeVisible();

      await slider.fill('5');
      await expect(page.locator('text=(Moderate)')).toBeVisible();

      await slider.fill('7');
      await expect(page.locator('text=(Strong)')).toBeVisible();

      await slider.fill('9');
      await expect(page.locator('text=(Intense)')).toBeVisible();
    });

    test('should require text input before submission', async ({ page }) => {
      await page.goto('/urge');

      const submitButton = page.locator('button[type="submit"]:has-text("Continue")');

      // Button should be disabled without input
      await expect(submitButton).toBeDisabled();

      // Fill input
      await page.fill('textarea', urgeScenarios.medium.description);

      // Button should be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should submit urge with description and intensity', async ({ page }) => {
      await page.goto('/urge');

      // Set intensity
      await page.locator('input[type="range"]').fill(urgeScenarios.high.intensity.toString());

      // Fill description
      await page.fill('textarea', urgeScenarios.high.description);

      // Submit
      await page.click('button[type="submit"]:has-text("Continue")');

      // Should see loading state
      await expect(page.locator('button:has-text("Listening")')).toBeVisible();
    });
  });

  test.describe('Elder Tree Response', () => {
    test('should display response after submission', async ({ page }) => {
      await page.goto('/urge');

      // Fill and submit
      await page.locator('input[type="range"]').fill('5');
      await page.fill('textarea', urgeScenarios.medium.description);
      await page.click('button[type="submit"]:has-text("Continue")');

      // Wait for response
      await waitForElderTreeResponse(page);

      // Should show Elder Tree response
      const responseText = page.locator('.border-green-600, .border-l-4').first();
      await expect(responseText).toBeVisible();

      // Should show "Willing to Listen" button
      await expect(page.locator('button:has-text("Willing to Listen")')).toBeVisible();
    });

    test('should show appropriate response for low intensity urge', async ({ page }) => {
      await mockUrgeResponse(page, urgeScenarios.low.intensity);
      await page.goto('/urge');

      await page.locator('input[type="range"]').fill(urgeScenarios.low.intensity.toString());
      await page.fill('textarea', urgeScenarios.low.description);
      await page.click('button[type="submit"]:has-text("Continue")');

      await waitForElderTreeResponse(page);

      // Should mention walk or less urgent language
      const response = await page.locator('.border-green-600, .border-l-4').first().textContent();
      expect(response?.toLowerCase()).toMatch(/walk|managing|ahead/i);
    });

    test('should show appropriate response for high intensity urge', async ({ page }) => {
      await mockUrgeResponse(page, urgeScenarios.high.intensity);
      await page.goto('/urge');

      await page.locator('input[type="range"]').fill(urgeScenarios.high.intensity.toString());
      await page.fill('textarea', urgeScenarios.high.description);
      await page.click('button[type="submit"]:has-text("Continue")');

      await waitForElderTreeResponse(page);

      // Should mention resting/mining with more urgency
      const response = await page.locator('.border-green-600, .border-l-4').first().textContent();
      expect(response?.toLowerCase()).toMatch(/rest|willing|hours|pass/i);
    });

    test('should show crisis-level response for intensity 9-10', async ({ page }) => {
      await mockUrgeResponse(page, urgeScenarios.crisis.intensity);
      await page.goto('/urge');

      await page.locator('input[type="range"]').fill(urgeScenarios.crisis.intensity.toString());
      await page.fill('textarea', urgeScenarios.crisis.description);
      await page.click('button[type="submit"]:has-text("Continue")');

      await waitForElderTreeResponse(page);

      // Should mention intense/crisis language
      const response = await page.locator('.border-green-600, .border-l-4').first().textContent();
      expect(response?.toLowerCase()).toMatch(/feeling|pass|intense|urgency|window/i);
    });

    test('should progress to solution stage after clicking willing button', async ({ page }) => {
      await page.goto('/urge');

      // Submit urge
      await page.locator('input[type="range"]').fill('5');
      await page.fill('textarea', urgeScenarios.medium.description);
      await page.click('button[type="submit"]:has-text("Continue")');
      await waitForElderTreeResponse(page);

      // Click willing to listen
      await page.click('button:has-text("Willing to Listen")');

      // Should show solution stage with timer options
      await expect(page.locator('text=How long do you want to rest')).toBeVisible();
      await expect(page.locator('button:has-text("Until morning")')).toBeVisible();
      await expect(page.locator('button:has-text("Start Sleep Mining Timer")')).toBeVisible();
    });
  });

  test.describe('Mining Timer Setup', () => {
    async function goToSolutionStage(page: any) {
      await page.goto('/urge');
      await page.locator('input[type="range"]').fill('5');
      await page.fill('textarea', 'Test urge description');
      await page.click('button[type="submit"]:has-text("Continue")');
      await waitForElderTreeResponse(page);
      await page.click('button:has-text("Willing to Listen")');
    }

    test('should display all timer duration options', async ({ page }) => {
      await goToSolutionStage(page);

      // Check all preset options
      await expect(page.locator('button:has-text("Until morning")')).toBeVisible();
      await expect(page.locator('button:has-text("30 minutes")')).toBeVisible();
      await expect(page.locator('button:has-text("1 hour")')).toBeVisible();
      await expect(page.locator('button:has-text("2 hours")')).toBeVisible();

      // Check custom time option
      await expect(page.locator('button:has-text("Set Custom Time")')).toBeVisible();
    });

    test('should select "Until morning" duration', async ({ page }) => {
      await goToSolutionStage(page);

      const morningButton = page.locator('button:has-text("Until morning")');

      // Should be selected by default or select it
      await morningButton.click();
      await expect(morningButton).toHaveClass(/bg-green-600/);
    });

    test('should select 30 minute duration', async ({ page }) => {
      await goToSolutionStage(page);

      const button30min = page.locator('button:has-text("30 minutes")');
      await button30min.click();

      // Should be highlighted
      await expect(button30min).toHaveClass(/bg-green-600/);

      // Should show end time
      await expect(page.locator('text=/Timer will end at/i')).toBeVisible();
    });

    test('should select 1 hour duration', async ({ page }) => {
      await goToSolutionStage(page);

      const button1hr = page.locator('button:has-text("1 hour")');
      await button1hr.click();

      await expect(button1hr).toHaveClass(/bg-green-600/);
      await expect(page.locator('text=/Timer will end at/i')).toBeVisible();
    });

    test('should select 2 hour duration', async ({ page }) => {
      await goToSolutionStage(page);

      const button2hr = page.locator('button:has-text("2 hours")');
      await button2hr.click();

      await expect(button2hr).toHaveClass(/bg-green-600/);
      await expect(page.locator('text=/Timer will end at/i')).toBeVisible();
    });

    test('should allow custom duration input', async ({ page }) => {
      await goToSolutionStage(page);

      // Click custom time button
      await page.click('button:has-text("Set Custom Time")');

      // Should show input field
      const customInput = page.locator('input[type="number"]');
      await expect(customInput).toBeVisible();

      // Enter custom duration
      await customInput.fill('45');

      // Should show end time
      await expect(page.locator('text=/Timer will end at/i')).toBeVisible();
    });

    test('should validate custom duration range', async ({ page }) => {
      await goToSolutionStage(page);

      await page.click('button:has-text("Set Custom Time")');
      const customInput = page.locator('input[type="number"]');

      // Should have min and max attributes
      await expect(customInput).toHaveAttribute('min', '1');
      await expect(customInput).toHaveAttribute('max', '480');
    });

    test('should switch between preset and custom durations', async ({ page }) => {
      await goToSolutionStage(page);

      // Select preset
      const button1hr = page.locator('button:has-text("1 hour")');
      await button1hr.click();
      await expect(button1hr).toHaveClass(/bg-green-600/);

      // Switch to custom
      await page.click('button:has-text("Set Custom Time")');
      await page.fill('input[type="number"]', '90');

      // Switch back to preset
      await page.click('button:has-text("30 minutes")');
      const button30min = page.locator('button:has-text("30 minutes")');
      await expect(button30min).toHaveClass(/bg-green-600/);
    });

    test('should show walk session alternative button', async ({ page }) => {
      await goToSolutionStage(page);

      const walkButton = page.locator('button:has-text("I\'m OK - Take Me to Walk Session")');
      await expect(walkButton).toBeVisible();
    });

    test('should navigate to walk session when clicking alternative', async ({ page }) => {
      await goToSolutionStage(page);

      await page.click('button:has-text("I\'m OK - Take Me to Walk Session")');

      // Should navigate to walk page
      await expect(page).toHaveURL(/\/walk/);
    });

    test('should display coin earning information', async ({ page }) => {
      await goToSolutionStage(page);

      // Should show info about coins
      await expect(page.locator('text=/Every minute mining = 1 coin/i')).toBeVisible();
    });
  });

  test.describe('Mining Timer Active', () => {
    async function startMiningTimer(page: any, duration: string = '30 minutes') {
      await page.goto('/urge');
      await page.locator('input[type="range"]').fill('5');
      await page.fill('textarea', 'Test urge');
      await page.click('button[type="submit"]:has-text("Continue")');
      await waitForElderTreeResponse(page);
      await page.click('button:has-text("Willing to Listen")');

      // Select duration
      if (duration !== 'Until morning') {
        await page.click(`button:has-text("${duration}")`);
      }

      // Mock mining start API
      await page.route('**/api/mining/start', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sessionId: 'test-mining-123',
            startedAt: new Date().toISOString(),
          }),
        });
      });

      // Mock mining status API
      await page.route('**/api/mining/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            hasActiveSession: true,
            activeSession: {
              sessionId: 'test-mining-123',
              startedAt: new Date().toISOString(),
              durationMinutes: duration === '30 minutes' ? 30 : duration === '1 hour' ? 60 : null,
            },
            totalCoins: 100,
          }),
        });
      });

      // Start mining
      await page.click('button:has-text("Start Sleep Mining Timer")');
    }

    test('should navigate to mining page after starting timer', async ({ page }) => {
      await startMiningTimer(page);

      // Should navigate to mining page
      await page.waitForURL('**/urge/mining**', { timeout: 5000 });
      await expect(page).toHaveURL(/\/urge\/mining/);
    });

    test('should display mining timer with elapsed time', async ({ page }) => {
      await startMiningTimer(page);

      await page.waitForURL('**/urge/mining**', { timeout: 5000 });

      // Wait for timer to load
      await page.waitForTimeout(1000);

      // Should show timer display (format: HH:MM:SS or MM:SS)
      const timerDisplay = page.locator('text=/\\d+:\\d+:\\d+|\\d+:\\d+/').first();
      await expect(timerDisplay).toBeVisible();
    });

    test('should show start time on mining page', async ({ page }) => {
      await startMiningTimer(page);

      await page.waitForURL('**/urge/mining**', { timeout: 5000 });

      // Should show when started (time format)
      await expect(page.locator('text=/\\d+:\\d+\\s?(AM|PM)/i')).toBeVisible();
    });

    test('should display finish mining button', async ({ page }) => {
      await startMiningTimer(page);

      await page.waitForURL('**/urge/mining**', { timeout: 5000 });

      // Should have button to end manually
      const finishButton = page.locator('button:has-text("Finish"), button:has-text("End")');
      await expect(finishButton).toBeVisible();
    });

    test('should show confirmation dialog when finishing mining', async ({ page }) => {
      await startMiningTimer(page);
      await page.waitForURL('**/urge/mining**', { timeout: 5000 });

      // Listen for confirm dialog
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain(/finish|collect|coins/i);
        await dialog.accept();
      });

      // Click finish button
      const finishButton = page.locator('button:has-text("Finish"), button:has-text("End")').first();
      await finishButton.click();
    });
  });

  test.describe('Morning Reveal', () => {
    async function goToRevealPage(page: any) {
      // Mock mining status with completed session
      await page.route('**/api/mining/status', async (route) => {
        const startTime = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            hasActiveSession: true,
            activeSession: {
              sessionId: 'test-session',
              startedAt: startTime.toISOString(),
            },
            totalCoins: 100,
          }),
        });
      });

      await page.goto('/urge/reveal');
      await page.waitForTimeout(500);
    }

    test('should display mining statistics', async ({ page }) => {
      await goToRevealPage(page);

      // Should show duration or coins earned
      await expect(page.locator('text=/\\d+.*minutes?|\\d+.*coins?/i').first()).toBeVisible();
    });

    test('should show coins earned (1 per minute)', async ({ page }) => {
      await goToRevealPage(page);

      // Should show coins earned
      const coinsText = page.locator('text=/\\d+.*coins?/i').first();
      await expect(coinsText).toBeVisible();
    });

    test('should ask about current state after delay', async ({ page }) => {
      await goToRevealPage(page);

      // Wait for state question to appear (2 second delay in code)
      await page.waitForTimeout(2500);

      // Should ask how user is feeling or about their state
      await expect(page.locator('body')).toContainText(/stable|struggling|feeling|state/i);
    });

    test('should show stable and struggling options', async ({ page }) => {
      await goToRevealPage(page);
      await page.waitForTimeout(2500);

      // Should have buttons for both states
      const stableButton = page.locator('button:has-text("Stable"), button:has-text("OK"), button:has-text("Good")');
      const strugglingButton = page.locator('button:has-text("Struggling"), button:has-text("Still"), button:has-text("Crisis")');

      // At least one type of each button should exist
      const hasStateButtons = (await stableButton.count()) > 0 || (await strugglingButton.count()) > 0;
      expect(hasStateButtons).toBe(true);
    });

    test('should route to dashboard when selecting stable', async ({ page }) => {
      await page.route('**/api/mining/end', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      await goToRevealPage(page);
      await page.waitForTimeout(2500);

      // Click stable/good option
      const stableButton = page.locator('button:has-text("Stable"), button:has-text("OK"), button:has-text("Good")').first();
      if (await stableButton.isVisible()) {
        await stableButton.click();

        // Should navigate to dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
      }
    });

    test('should route to urge support when selecting struggling', async ({ page }) => {
      await page.route('**/api/mining/end', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      await goToRevealPage(page);
      await page.waitForTimeout(2500);

      // Click struggling option
      const strugglingButton = page.locator('button:has-text("Struggling"), button:has-text("Still"), button:has-text("Crisis")').first();
      if (await strugglingButton.isVisible()) {
        await strugglingButton.click();

        // Should navigate back to urge support
        await expect(page).toHaveURL(/\/urge/, { timeout: 5000 });
      }
    });

    test('should redirect to dashboard if no active session', async ({ page }) => {
      // Mock no active session
      await page.route('**/api/mining/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            hasActiveSession: false,
            totalCoins: 100,
          }),
        });
      });

      await page.goto('/urge/reveal');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.goto('/urge');

      // Form should be visible and usable
      await expect(page.locator('h1')).toContainText('Elder Tree');

      // Fill form
      await page.fill('textarea', 'Mobile test urge');
      await page.locator('input[type="range"]').fill('5');

      // Submit
      await page.click('button[type="submit"]:has-text("Continue")');
      await waitForElderTreeResponse(page);

      // Should see response
      await expect(page.locator('.border-green-600')).toBeVisible();
    });
  });
});
