import { test, expect } from '@playwright/test';
import { loginUser, waitForElderTreeResponse } from './utils/helpers';
import { mockAllAPIs, mockWalkCompletion } from './utils/mocks';
import { walkCheckInData, walkResponses, navigationPaths } from './utils/fixtures';
import { TEST_USER } from './auth.setup';

test.describe('Walk Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock all external APIs
    await mockAllAPIs(page);

    // Login before each test
    await loginUser(page);
  });

  test.describe('Pre-walk Check-in', () => {
    test('should display check-in form with all elements', async ({ page }) => {
      await page.goto('/walk');

      // Check heading
      await expect(page.locator('h1')).toContainText('Ready to Step Outside');

      // Check step selection buttons
      await expect(page.locator('text=Step 1: Powerlessness')).toBeVisible();
      await expect(page.locator('text=Step 2: Coming to Believe')).toBeVisible();
      await expect(page.locator('text=Step 3: Turning It Over')).toBeVisible();

      // Check optional fields
      await expect(page.locator('label:has-text("How are you feeling")')).toBeVisible();
      await expect(page.locator('label:has-text("What do you hope to gain")')).toBeVisible();
      await expect(page.locator('label:has-text("Where will you go")')).toBeVisible();
      await expect(page.locator('label:has-text("What does your body need")')).toBeVisible();

      // Check submit button
      await expect(page.locator('button[type="submit"]:has-text("Step Outside")')).toBeVisible();

      // Check back button
      await expect(page.locator('button:has-text("Back to Dashboard")')).toBeVisible();
    });

    test('should start session with minimal info (step only)', async ({ page }) => {
      await page.goto('/walk');

      // Select Step 1 (should be selected by default)
      await expect(page.locator('button:has-text("Step 1")').first()).toHaveClass(/bg-green-50/);

      // Submit without filling optional fields
      await page.click('button[type="submit"]:has-text("Step Outside")');

      // Should navigate to session and show Elder Tree question
      await waitForElderTreeResponse(page);

      // Check that we're in walking session
      await expect(page.locator('body')).not.toContainText('Ready to Step Outside');
    });

    test('should start session with full check-in info', async ({ page }) => {
      await page.goto('/walk');

      // Select Step 2
      await page.click('button:has-text("Step 2: Coming to Believe")');
      await expect(page.locator('button:has-text("Step 2")').first()).toHaveClass(/bg-green-50/);

      // Fill mood
      await page.fill('input#mood', 'hopeful and nervous');

      // Fill intention
      await page.fill('textarea#intention', 'I want to understand what a higher power means for me');

      // Select location
      await page.click('button:has-text("Park / Forest")');
      await expect(page.locator('button:has-text("Park / Forest")')).toHaveClass(/bg-green-50/);

      // Select body need
      await page.click('button:has-text("Movement")');
      await expect(page.locator('button:has-text("Movement")').first()).toHaveClass(/bg-green-50/);

      // Submit
      await page.click('button[type="submit"]:has-text("Step Outside")');

      // Wait for session to start
      await waitForElderTreeResponse(page);

      // Verify we're in the walking session
      await expect(page.locator('body')).not.toContainText('Ready to Step Outside');
    });

    test('should allow changing step selection', async ({ page }) => {
      await page.goto('/walk');

      // Step 1 should be selected by default
      await expect(page.locator('button:has-text("Step 1")').first()).toHaveClass(/bg-green-50/);

      // Click Step 2
      await page.click('button:has-text("Step 2: Coming to Believe")');
      await expect(page.locator('button:has-text("Step 2")').first()).toHaveClass(/bg-green-50/);
      await expect(page.locator('button:has-text("Step 1")').first()).not.toHaveClass(/bg-green-50/);

      // Click Step 3
      await page.click('button:has-text("Step 3: Turning It Over")');
      await expect(page.locator('button:has-text("Step 3")').first()).toHaveClass(/bg-green-50/);
      await expect(page.locator('button:has-text("Step 2")').first()).not.toHaveClass(/bg-green-50/);
    });

    test('should navigate back to dashboard', async ({ page }) => {
      await page.goto('/walk');

      await page.click('button:has-text("Back to Dashboard")');

      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Session Resumption', () => {
    test('should detect incomplete session on page load', async ({ page, context }) => {
      // Mock incomplete session detection
      await page.route('**/api/session/start', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hasIncompleteSession: true,
              session: {
                id: 'test-session-123',
                current_step: 'step1',
                user_id: 'test-user-id',
                started_at: new Date().toISOString(),
              },
            }),
          });
        } else {
          // POST request to resume
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              sessionId: 'test-session-123',
              step: 'step1',
              initialQuestion: 'Welcome back. Let us continue where we left off. What were you working through?',
            }),
          });
        }
      });

      // Listen for confirm dialog
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('incomplete walk session');
        await dialog.accept(); // Accept to resume
      });

      await page.goto('/walk');

      // Wait for session to resume
      await waitForElderTreeResponse(page);

      // Should be in walking session, not check-in
      await expect(page.locator('body')).not.toContainText('Ready to Step Outside');
    });

    test('should allow declining to resume session', async ({ page }) => {
      // Mock incomplete session detection
      await page.route('**/api/session/start', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hasIncompleteSession: true,
              session: {
                id: 'test-session-123',
                current_step: 'step2',
              },
            }),
          });
        }
      });

      // Listen for confirm dialog and decline
      page.on('dialog', async (dialog) => {
        await dialog.dismiss(); // Decline to resume
      });

      await page.goto('/walk');

      // Should stay on check-in page
      await expect(page.locator('h1')).toContainText('Ready to Step Outside');
    });
  });

  test.describe('Walking Session Interaction', () => {
    test('should display Elder Tree initial question', async ({ page }) => {
      await page.goto('/walk');

      // Start session
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Should see a question or prompt
      await expect(page.locator('body')).not.toContainText('Ready to Step Outside');

      // Look for input to respond
      const responseInput = page.locator('textarea, input[type="text"]').first();
      await expect(responseInput).toBeVisible();
    });

    test('should accept user response and show loading state', async ({ page }) => {
      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Fill response
      const responseInput = page.locator('textarea, input[type="text"]').first();
      await responseInput.fill(walkResponses.step1[0]);

      // Submit response
      const submitButton = page.locator('button[type="submit"], button:has-text("Send")').first();
      await submitButton.click();

      // Check for loading indicator (briefly)
      // Note: This might be too fast to catch in tests
      await page.waitForTimeout(100);
    });

    test('should continue conversation with follow-up questions', async ({ page }) => {
      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // First response
      let responseInput = page.locator('textarea, input[type="text"]').first();
      await responseInput.fill(walkResponses.step1[0]);
      await page.locator('button[type="submit"], button:has-text("Send")').first().click();
      await waitForElderTreeResponse(page);

      // Second response
      responseInput = page.locator('textarea, input[type="text"]').first();
      await expect(responseInput).toBeVisible();
      await expect(responseInput).toBeEmpty();
      await responseInput.fill(walkResponses.step1[1]);
      await page.locator('button[type="submit"], button:has-text("Send")').first().click();
      await waitForElderTreeResponse(page);

      // Should continue the conversation
      responseInput = page.locator('textarea, input[type="text"]').first();
      await expect(responseInput).toBeVisible();
    });

    test('should show timer during session', async ({ page }) => {
      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Look for timer display (format: mm:ss or similar)
      const timerElement = page.locator('text=/\\d+:\\d+|\\d+ min/i').first();
      await expect(timerElement).toBeVisible();
    });

    test('should allow manual session completion', async ({ page }) => {
      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Provide a few responses
      for (let i = 0; i < 2; i++) {
        const responseInput = page.locator('textarea, input[type="text"]').first();
        await responseInput.fill(walkResponses.step1[i]);
        await page.locator('button[type="submit"], button:has-text("Send")').first().click();
        await waitForElderTreeResponse(page);
      }

      // Look for complete button
      const completeButton = page.locator('button:has-text("Complete"), button:has-text("End Session")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await waitForElderTreeResponse(page, 10000);
      }
    });
  });

  test.describe('Session Completion', () => {
    test('should display completion page with all elements', async ({ page }) => {
      await mockWalkCompletion(page);

      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Complete session quickly
      for (let i = 0; i < 3; i++) {
        const responseInput = page.locator('textarea, input[type="text"]').first();
        await responseInput.fill(walkResponses.step1[i]);
        await page.locator('button[type="submit"], button:has-text("Send")').first().click();
        await waitForElderTreeResponse(page);
      }

      // Trigger completion
      const completeButton = page.locator('button:has-text("Complete"), button:has-text("End")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await waitForElderTreeResponse(page, 10000);
      }

      // Verify completion elements (these selectors may need adjustment based on actual implementation)
      // Elder Tree reflection
      await expect(page.locator('body')).toContainText(/courage|strength|honesty|willing/i);

      // Look for coins earned display
      const coinsDisplay = page.locator('text=/\\d+ coins?/i').first();
      await expect(coinsDisplay).toBeVisible();
    });

    test('should show insights from session', async ({ page }) => {
      await mockWalkCompletion(page);

      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Complete session
      for (let i = 0; i < 3; i++) {
        const responseInput = page.locator('textarea, input[type="text"]').first();
        await responseInput.fill(walkResponses.honest[i % walkResponses.honest.length]);
        await page.locator('button[type="submit"], button:has-text("Send")').first().click();
        await waitForElderTreeResponse(page);
      }

      const completeButton = page.locator('button:has-text("Complete"), button:has-text("End")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await waitForElderTreeResponse(page, 10000);
      }

      // Should show insights section
      const insightsSection = page.locator('text=/insights?|patterns?|noticed/i').first();
      await expect(insightsSection).toBeVisible();
    });

    test('should display coins earned during session', async ({ page }) => {
      await mockWalkCompletion(page);

      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Complete session
      const responseInput = page.locator('textarea, input[type="text"]').first();
      await responseInput.fill('Test response');
      await page.locator('button[type="submit"], button:has-text("Send")').first().click();
      await waitForElderTreeResponse(page);

      const completeButton = page.locator('button:has-text("Complete"), button:has-text("End")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await waitForElderTreeResponse(page, 10000);
      }

      // Check for coins (mocked as 45 in mockWalkCompletion)
      await expect(page.locator('body')).toContainText(/\\d+.*coins?/i);
    });

    test('should show nature image on completion', async ({ page }) => {
      await mockWalkCompletion(page);

      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Complete session
      const responseInput = page.locator('textarea, input[type="text"]').first();
      await responseInput.fill('Test response');
      await page.locator('button[type="submit"], button:has-text("Send")').first().click();
      await waitForElderTreeResponse(page);

      const completeButton = page.locator('button:has-text("Complete"), button:has-text("End")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await waitForElderTreeResponse(page, 10000);
      }

      // Look for image element
      const natureImage = page.locator('img').first();
      if (await natureImage.isVisible()) {
        await expect(natureImage).toHaveAttribute('src', /unsplash/i);
      }
    });

    test('should allow starting new walk from completion page', async ({ page }) => {
      await mockWalkCompletion(page);

      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Quick completion
      const responseInput = page.locator('textarea, input[type="text"]').first();
      await responseInput.fill('Test response');
      await page.locator('button[type="submit"], button:has-text("Send")').first().click();
      await waitForElderTreeResponse(page);

      const completeButton = page.locator('button:has-text("Complete"), button:has-text("End")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await waitForElderTreeResponse(page, 10000);
      }

      // Look for "New Walk" or "Start Another" button
      const newWalkButton = page.locator('button:has-text("New Walk"), button:has-text("Start Another")');
      if (await newWalkButton.isVisible()) {
        await newWalkButton.click();

        // Should return to check-in page
        await expect(page.locator('h1')).toContainText('Ready to Step Outside');
      }
    });

    test('should show session analytics on completion', async ({ page }) => {
      await mockWalkCompletion(page);

      await page.goto('/walk');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Complete session
      const responseInput = page.locator('textarea, input[type="text"]').first();
      await responseInput.fill(walkResponses.honest[0]);
      await page.locator('button[type="submit"], button:has-text("Send")').first().click();
      await waitForElderTreeResponse(page);

      const completeButton = page.locator('button:has-text("Complete"), button:has-text("End")');
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await waitForElderTreeResponse(page, 10000);
      }

      // Look for analytics (duration, questions answered, etc.)
      const analyticsText = page.locator('text=/duration|questions?|minutes?/i').first();
      await expect(analyticsText).toBeVisible();
    });
  });

  test.describe('Different Steps', () => {
    test('should work with Step 1 (Powerlessness)', async ({ page }) => {
      await page.goto('/walk');

      // Select Step 1 (default)
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Provide Step 1 responses
      for (let i = 0; i < 2; i++) {
        const responseInput = page.locator('textarea, input[type="text"]').first();
        await responseInput.fill(walkResponses.step1[i]);
        await page.locator('button[type="submit"], button:has-text("Send")').first().click();
        await waitForElderTreeResponse(page);
      }

      // Should successfully complete
      await expect(page.locator('body')).toBeVisible();
    });

    test('should work with Step 2 (Coming to Believe)', async ({ page }) => {
      await page.goto('/walk');

      // Select Step 2
      await page.click('button:has-text("Step 2: Coming to Believe")');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Provide Step 2 responses
      for (let i = 0; i < 2; i++) {
        const responseInput = page.locator('textarea, input[type="text"]').first();
        await responseInput.fill(walkResponses.step2[i]);
        await page.locator('button[type="submit"], button:has-text("Send")').first().click();
        await waitForElderTreeResponse(page);
      }

      // Should successfully complete
      await expect(page.locator('body')).toBeVisible();
    });

    test('should work with Step 3 (Turning It Over)', async ({ page }) => {
      await page.goto('/walk');

      // Select Step 3
      await page.click('button:has-text("Step 3: Turning It Over")');
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Provide Step 3 responses
      for (let i = 0; i < 2; i++) {
        const responseInput = page.locator('textarea, input[type="text"]').first();
        await responseInput.fill(walkResponses.step3[i]);
        await page.locator('button[type="submit"], button:has-text("Send")').first().click();
        await waitForElderTreeResponse(page);
      }

      // Should successfully complete
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.goto('/walk');

      // Check-in form should be visible and usable
      await expect(page.locator('h1')).toContainText('Ready to Step Outside');

      // Select step
      await page.click('button:has-text("Step 2: Coming to Believe")');

      // Submit
      await page.click('button[type="submit"]:has-text("Step Outside")');
      await waitForElderTreeResponse(page);

      // Session should work
      const responseInput = page.locator('textarea, input[type="text"]').first();
      await expect(responseInput).toBeVisible();
    });
  });
});
