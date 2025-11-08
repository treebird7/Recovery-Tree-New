import { Page, Route } from '@playwright/test';

/**
 * API mocking utilities for E2E tests
 * Mocks external APIs to avoid costs and rate limits
 */

/**
 * Mock Anthropic API responses
 */
export async function mockAnthropicAPI(page: Page, responses?: string[]) {
  let responseIndex = 0;
  const defaultResponses = [
    "That's a thoughtful reflection. Let's explore this further. What specific example comes to mind when you think about that?",
    "I appreciate your honesty. Can you tell me about a time recently when this showed up in your life?",
    "That's helpful context. How did that make you feel in the moment?",
  ];

  const responsesToUse = responses || defaultResponses;

  await page.route('**/api/elder-tree**', async (route: Route) => {
    const requestBody = route.request().postDataJSON();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock response
    const response = responsesToUse[responseIndex % responsesToUse.length];
    responseIndex++;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        response,
        insights: requestBody?.extractInsights ? [
          'Recognizing patterns in behavior',
          'Willingness to change',
        ] : undefined,
        redFlag: response.includes('specific example') || response.includes('recently'),
      }),
    });
  });
}

/**
 * Mock Anthropic API for walk session completion
 */
export async function mockWalkCompletion(page: Page) {
  await page.route('**/api/walk/complete**', async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reflection: "You've shown real courage today by being honest about your struggles. The work you're doing takes guts, and I see you showing up. Keep coming back - this practice of awareness is building something strong in you.",
        encouragement: "Remember, progress isn't about being perfect. It's about showing up, being honest, and staying willing. You're doing that.",
        insights: [
          'Demonstrated willingness to examine behavior',
          'Showed honesty about struggles',
          'Recognized need for help',
        ],
        breakthroughs: 1,
        redFlags: 0,
        coinsEarned: 45,
      }),
    });
  });
}

/**
 * Mock Anthropic API for inventory reflection
 */
export async function mockInventoryReflection(page: Page) {
  await page.route('**/api/inventory/reflect**', async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reflection: "I see you showing up for yourself today. There's real strength in taking this daily inventory - in naming both what went well and where you struggled. That gratitude you expressed? That's the soil recovery grows in. And tomorrow's intention shows you're thinking ahead, planning your day with care. Keep this practice going.",
      }),
    });
  });
}

/**
 * Mock Anthropic API for urge response
 */
export async function mockUrgeResponse(page: Page, intensity?: number) {
  await page.route('**/api/urge/respond**', async (route: Route) => {
    const requestBody = route.request().postDataJSON();
    const urgeIntensity = intensity || requestBody?.intensity || 5;

    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = '';
    if (urgeIntensity >= 9) {
      response = "Hey, I hear you. What you're feeling right now - that pull, that urgency - it's real, and it's intense. But here's what I know: This feeling will pass. It always does. What won't pass is the regret if you act on it. You've got a window right here, right now, to let this wave break without you on it. Will you rest with me? Even just for a few hours?";
    } else if (urgeIntensity >= 7) {
      response = "I'm glad you reached out. That took courage. This urge you're feeling - it wants you to believe it's the only option, that you need to act now. But you don't. You've got time, and you've got choices. Would you be willing to rest this out with me? Give it a few hours and see how you feel on the other side?";
    } else if (urgeIntensity >= 4) {
      response = "Thanks for being honest about where you're at. This discomfort you're feeling - it's temporary, even if it doesn't feel that way right now. You've got options here. You could take a walk, work through a step, or just rest with this feeling for a bit. What sounds doable to you?";
    } else {
      response = "I appreciate you checking in. Sounds like you're managing this pretty well, but it's smart to stay ahead of it. Want to take a walk and talk through what's going on? Sometimes the best time to do step work is before things get harder.";
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ response }),
    });
  });
}

/**
 * Mock Unsplash API for nature images
 */
export async function mockUnsplashAPI(page: Page) {
  await page.route('**/api/unsplash**', async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        photographer: 'Test Photographer',
        photographerUrl: 'https://unsplash.com/@test',
      }),
    });
  });
}

/**
 * Mock all external APIs at once
 */
export async function mockAllAPIs(page: Page) {
  await mockAnthropicAPI(page);
  await mockWalkCompletion(page);
  await mockInventoryReflection(page);
  await mockUrgeResponse(page);
  await mockUnsplashAPI(page);
}

/**
 * Mock API error responses
 */
export async function mockAPIError(page: Page, endpoint: string, statusCode: number = 500) {
  await page.route(`**${endpoint}**`, async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'API Error',
        message: 'Something went wrong',
      }),
    });
  });
}

/**
 * Mock API timeout
 */
export async function mockAPITimeout(page: Page, endpoint: string) {
  await page.route(`**${endpoint}**`, async (route: Route) => {
    // Wait indefinitely to simulate timeout
    await new Promise(() => {});
  });
}

/**
 * Mock rate limit response
 */
export async function mockRateLimit(page: Page, endpoint: string) {
  await page.route(`**${endpoint}**`, async (route: Route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests',
      }),
    });
  });
}
