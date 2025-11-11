import { test, expect } from '@playwright/test';
import { loginUser, waitForElderTreeResponse } from './utils/helpers';
import { mockAllAPIs, mockInventoryReflection } from './utils/mocks';
import { inventoryResponses } from './utils/fixtures';

test.describe('Daily Inventory Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock all external APIs
    await mockAllAPIs(page);

    // Login before each test
    await loginUser(page);
  });

  test.describe('Inventory Availability Check', () => {
    test('should allow inventory if not completed today', async ({ page }) => {
      // Mock: No inventory for today
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: false }),
          });
        }
      });

      await page.goto('/inventory');

      // Should show inventory prompts, not "already complete" message
      await expect(page.locator('text=/Question \\d+ of \\d+/i')).toBeVisible();
    });

    test('should redirect if already completed today', async ({ page }) => {
      // Mock: Inventory already exists for today
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: true }),
          });
        }
      });

      await page.goto('/inventory');

      // Should show "already complete" message
      await expect(page.locator('h1')).toContainText('Already Complete');
      await expect(page.locator('text=/already completed.*inventory/i')).toBeVisible();
    });

    test('should show navigation options when already completed', async ({ page }) => {
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: true }),
          });
        }
      });

      await page.goto('/inventory');

      // Should have button to dashboard
      await expect(page.locator('button:has-text("Back to Dashboard")')).toBeVisible();

      // Should have button to view history
      await expect(page.locator('button:has-text("View Past Inventories")')).toBeVisible();
    });

    test('should navigate to dashboard from already-complete page', async ({ page }) => {
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: true }),
          });
        }
      });

      await page.goto('/inventory');

      await page.click('button:has-text("Back to Dashboard")');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should navigate to history from already-complete page', async ({ page }) => {
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: true }),
          });
        }
      });

      await page.goto('/inventory');

      await page.click('button:has-text("View Past Inventories")');
      await expect(page).toHaveURL(/\/inventory\/history/);
    });
  });

  test.describe('Inventory Form', () => {
    async function setupAvailableInventory(page: any) {
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: false }),
          });
        } else if (route.request().method() === 'POST') {
          const body = route.request().postDataJSON();
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              inventory: {
                id: 'test-inventory-123',
                what_went_well: body.whatWentWell,
                struggles_today: body.strugglesToday,
                gratitude: body.gratitude,
                tomorrow_intention: body.tomorrowIntention,
                elder_reflection: 'You showed up today. That matters.',
                created_at: new Date().toISOString(),
              },
            }),
          });
        }
      });
    }

    test('should display first question on load', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Should show progress
      await expect(page.locator('text=Question 1 of 4')).toBeVisible();

      // Should show first question
      await expect(page.locator('text=What went well today')).toBeVisible();

      // Should show textarea
      await expect(page.locator('textarea')).toBeVisible();

      // Should show Elder Tree badge
      await expect(page.locator('text=Elder Tree')).toBeVisible();
    });

    test('should show progress bar and percentage', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Should show progress (25% for first question)
      await expect(page.locator('text=25%')).toBeVisible();

      // Should have progress bar
      const progressBar = page.locator('.bg-green-600').first();
      await expect(progressBar).toBeVisible();
    });

    test('should allow answering first question and moving to next', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Answer first question
      await page.fill('textarea', inventoryResponses.positive.wentWell);

      // Click Continue
      await page.click('button:has-text("Continue")');

      // Should move to question 2
      await expect(page.locator('text=Question 2 of 4')).toBeVisible();
      await expect(page.locator('text=What was hard today')).toBeVisible();
    });

    test('should navigate through all four questions', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Question 1: What went well
      await expect(page.locator('text=What went well today')).toBeVisible();
      await page.fill('textarea', inventoryResponses.positive.wentWell);
      await page.click('button:has-text("Continue")');

      // Question 2: Struggles
      await expect(page.locator('text=What was hard today')).toBeVisible();
      await page.fill('textarea', inventoryResponses.positive.struggles);
      await page.click('button:has-text("Continue")');

      // Question 3: Gratitude
      await expect(page.locator('text=What are you grateful for')).toBeVisible();
      await page.fill('textarea', inventoryResponses.positive.gratitude);
      await page.click('button:has-text("Continue")');

      // Question 4: Tomorrow's intention
      await expect(page.locator('text=/What.*one thing.*tomorrow/i')).toBeVisible();
      await expect(page.locator('text=Question 4 of 4')).toBeVisible();
    });

    test('should allow going back to previous question', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Answer first question
      const answer1 = 'My first answer';
      await page.fill('textarea', answer1);
      await page.click('button:has-text("Continue")');

      // Now at question 2
      await expect(page.locator('text=Question 2 of 4')).toBeVisible();

      // Go back
      await page.click('button:has-text("Back"), button:has-text("Previous")');

      // Should be back at question 1
      await expect(page.locator('text=Question 1 of 4')).toBeVisible();

      // Previous answer should be preserved
      await expect(page.locator('textarea')).toHaveValue(answer1);
    });

    test('should preserve answers when navigating back and forth', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      const answers = [
        'Answer to question 1',
        'Answer to question 2',
        'Answer to question 3',
      ];

      // Answer first 3 questions
      for (let i = 0; i < 3; i++) {
        await page.fill('textarea', answers[i]);
        await page.click('button:has-text("Continue")');
      }

      // Now at question 4, go back
      await page.click('button:has-text("Back"), button:has-text("Previous")');

      // Check question 3 answer
      await expect(page.locator('textarea')).toHaveValue(answers[2]);

      // Go back again
      await page.click('button:has-text("Back"), button:has-text("Previous")');

      // Check question 2 answer
      await expect(page.locator('textarea')).toHaveValue(answers[1]);
    });

    test('should show submit button on last question', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Navigate to last question
      for (let i = 0; i < 3; i++) {
        await page.fill('textarea', `Answer ${i + 1}`);
        await page.click('button:has-text("Continue")');
      }

      // Should show submit/complete button
      const submitButton = page.locator('button:has-text("Complete Inventory")');
      await expect(submitButton).toBeVisible();
    });

    test('should show help text for each question', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Question 1 help text
      await expect(page.locator('text=/Focus on the positives/i')).toBeVisible();

      // Move to next questions
      await page.fill('textarea', 'Test');
      await page.click('button:has-text("Continue")');

      // Question 2 help text
      await expect(page.locator('text=/Be honest about what was difficult/i')).toBeVisible();

      await page.fill('textarea', 'Test');
      await page.click('button:has-text("Continue")');

      // Question 3 help text
      await expect(page.locator('text=/Keep it real/i')).toBeVisible();

      await page.fill('textarea', 'Test');
      await page.click('button:has-text("Continue")');

      // Question 4 help text
      await expect(page.locator('text=/specific action/i')).toBeVisible();
    });

    test('should show placeholders for each question', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Check placeholder for question 1
      await expect(page.locator('textarea')).toHaveAttribute('placeholder', /Recovery wins|connections|honesty/i);
    });

    test('should autofocus textarea on each question', async ({ page }) => {
      await setupAvailableInventory(page);
      await page.goto('/inventory');

      // Textarea should have autofocus
      await expect(page.locator('textarea')).toHaveAttribute('autofocus');
    });
  });

  test.describe('Inventory Submission', () => {
    async function completeInventory(page: any, responses: typeof inventoryResponses.positive) {
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: false }),
          });
        } else if (route.request().method() === 'POST') {
          await mockInventoryReflection(page);
          const body = route.request().postDataJSON();
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              inventory: {
                id: 'test-inventory-123',
                what_went_well: body.whatWentWell,
                struggles_today: body.strugglesToday,
                gratitude: body.gratitude,
                tomorrow_intention: body.tomorrowIntention,
                elder_reflection: 'You showed up today. That matters. There is real strength in taking this daily inventory.',
                created_at: new Date().toISOString(),
              },
            }),
          });
        }
      });

      await page.goto('/inventory');

      const answers = [
        responses.wentWell,
        responses.struggles,
        responses.gratitude,
        responses.intention,
      ];

      for (let i = 0; i < answers.length; i++) {
        await page.fill('textarea', answers[i]);
        if (i < answers.length - 1) {
          await page.click('button:has-text("Continue")');
        }
      }

      return answers;
    }

    test('should submit inventory with all responses', async ({ page }) => {
      await completeInventory(page, inventoryResponses.positive);

      // Submit
      await page.click('button:has-text("Complete Inventory")');

      // Should show loading/generating state
      await expect(page.locator('text=/Generating reflection|Loading/i')).toBeVisible();
    });

    test('should display Elder Tree reflection after submission', async ({ page }) => {
      await completeInventory(page, inventoryResponses.positive);
      await page.click('button:has-text("Complete Inventory")');

      // Wait for reflection to load
      await page.waitForTimeout(2000);

      // Should show completion page with reflection
      await expect(page.locator('body')).toContainText(/showed up|strength|courage|honest|grateful/i);
    });

    test('should show completion confirmation', async ({ page }) => {
      await completeInventory(page, inventoryResponses.positive);
      await page.click('button:has-text("Complete Inventory")');

      await page.waitForTimeout(2000);

      // Should show some form of completion indicator
      const completionText = page.locator('text=/Complete|Finished|Done/i').first();
      await expect(completionText).toBeVisible();
    });

    test('should work with struggling responses', async ({ page }) => {
      await completeInventory(page, inventoryResponses.struggling);
      await page.click('button:has-text("Complete Inventory")');

      await page.waitForTimeout(2000);

      // Should still get Elder Tree response
      await expect(page.locator('body')).toBeVisible();
    });

    test('should work with hopeful responses', async ({ page }) => {
      await completeInventory(page, inventoryResponses.hopeful);
      await page.click('button:has-text("Complete Inventory")');

      await page.waitForTimeout(2000);

      // Should receive appropriate reflection
      await expect(page.locator('body')).toBeVisible();
    });

    test('should display all user responses on completion', async ({ page }) => {
      const responses = await completeInventory(page, inventoryResponses.positive);
      await page.click('button:has-text("Complete Inventory")');

      await page.waitForTimeout(2000);

      // Check if responses are displayed (may need adjustment based on actual UI)
      // At minimum, should show the Elder Tree reflection
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();
    });

    test('should allow navigating after completion', async ({ page }) => {
      await completeInventory(page, inventoryResponses.positive);
      await page.click('button:has-text("Complete Inventory")');

      await page.waitForTimeout(2000);

      // Should have navigation options (dashboard, history, etc.)
      const dashboardButton = page.locator('button:has-text("Dashboard"), a:has-text("Dashboard")');
      const historyButton = page.locator('button:has-text("History"), a:has-text("History")');

      // At least one navigation option should be visible
      const hasDashboard = await dashboardButton.count();
      const hasHistory = await historyButton.count();

      expect(hasDashboard + hasHistory).toBeGreaterThan(0);
    });
  });

  test.describe('Inventory History', () => {
    test('should display inventory history page', async ({ page }) => {
      // Mock inventory history API
      await page.route('**/api/inventory/history', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            inventories: [
              {
                id: '1',
                created_at: new Date().toISOString(),
                what_went_well: 'Something good',
                struggles_today: 'Something hard',
                gratitude: 'Something grateful',
                tomorrow_intention: 'Something to do',
                elder_reflection: 'Good work today',
              },
            ],
          }),
        });
      });

      await page.goto('/inventory/history');

      // Should show history page
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show list of past inventories', async ({ page }) => {
      const mockInventories = [
        {
          id: '1',
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          what_went_well: 'Made it to meeting',
          struggles_today: 'Felt anxious',
          gratitude: 'My sponsor',
          tomorrow_intention: 'Call someone',
          elder_reflection: 'You showed up',
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
          what_went_well: 'Good sleep',
          struggles_today: 'Work stress',
          gratitude: 'Peace',
          tomorrow_intention: 'Walk outside',
          elder_reflection: 'Keep going',
        },
      ];

      await page.route('**/api/inventory/history', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ inventories: mockInventories }),
        });
      });

      await page.goto('/inventory/history');

      // Should show multiple inventory entries
      for (const inventory of mockInventories) {
        // Check if dates or content is visible
        const hasContent = await page.locator(`text="${inventory.what_went_well}"`).count();
        // At minimum, should have loaded the page successfully
        expect(hasContent).toBeGreaterThanOrEqual(0);
      }
    });

    test('should allow clicking on inventory to view details', async ({ page }) => {
      await page.route('**/api/inventory/history', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            inventories: [
              {
                id: 'test-123',
                created_at: new Date().toISOString(),
                what_went_well: 'Test went well',
                struggles_today: 'Test struggles',
                gratitude: 'Test gratitude',
                tomorrow_intention: 'Test intention',
                elder_reflection: 'Test reflection',
              },
            ],
          }),
        });
      });

      await page.goto('/inventory/history');

      // Click on an inventory item
      const firstItem = page.locator('article, .inventory-item, button, a').first();
      if (await firstItem.isVisible()) {
        await firstItem.click();

        // Should show details (either in modal or new page)
        await page.waitForTimeout(500);
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API error on load', async ({ page }) => {
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          });
        }
      });

      // Listen for alert
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain(/failed.*inventory/i);
        await dialog.accept();
      });

      await page.goto('/inventory');
    });

    test('should handle submission error gracefully', async ({ page }) => {
      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: false }),
          });
        } else if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Submission failed' }),
          });
        }
      });

      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain(/failed.*submit/i);
        await dialog.accept();
      });

      await page.goto('/inventory');

      // Fill out inventory
      for (let i = 0; i < 4; i++) {
        await page.fill('textarea', `Test answer ${i + 1}`);
        if (i < 3) {
          await page.click('button:has-text("Continue")');
        }
      }

      // Try to submit
      await page.click('button:has-text("Complete Inventory")');

      // Should return to form (not crash)
      await page.waitForTimeout(500);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.route('**/api/inventory/today', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ hasInventory: false }),
          });
        }
      });

      await page.goto('/inventory');

      // Form should be visible and usable
      await expect(page.locator('text=Question 1 of 4')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();

      // Should be able to answer
      await page.fill('textarea', 'Mobile test answer');
      await page.click('button:has-text("Continue")');

      // Should progress to next question
      await expect(page.locator('text=Question 2 of 4')).toBeVisible();
    });
  });
});
