import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
  updateSubscription,
  listSubscriptions,
  type Variant,
  type Checkout,
  type Subscription,
} from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error('Lemon Squeezy Error:', error),
});

// Pricing configuration
export const PRICING = {
  free: {
    name: 'Free Walk',
    price: 0,
    variantId: null,
    features: [
      '3 guided walks per month',
      'Steps 1-3 questions',
      'Basic reflections',
      'Nature imagery',
    ],
  },
  monthly: {
    name: 'Daily Practice',
    price: 9.99,
    variantId: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
    features: [
      'Unlimited guided walks',
      'All 12 steps',
      'Advanced AI reflections',
      'Custom nature imagery',
      'Progress tracking',
      'Session history',
    ],
  },
  yearly: {
    name: 'Annual Journey',
    price: 99.99,
    variantId: process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID!,
    features: [
      'Everything in Daily Practice',
      '2 months free',
      'Priority AI processing',
      'Extended session history',
      'Annual progress reports',
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING;

// Helper to create a checkout URL
export async function createCheckoutUrl({
  variantId,
  userId,
  userEmail,
  userName,
}: {
  variantId: string;
  userId: string;
  userEmail: string;
  userName?: string;
}): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: userEmail,
      name: userName,
      custom: {
        user_id: userId,
      },
    },
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
      desc: true,
      discount: true,
      dark: false,
      subscriptionPreview: true,
    },
    expiresAt: null,
    preview: false,
    testMode: process.env.NODE_ENV === 'development',
  });

  if (checkout.error) {
    throw new Error(`Failed to create checkout: ${checkout.error.message}`);
  }

  return checkout.data?.data.attributes.url || '';
}

// Helper to get customer portal URL
export function getCustomerPortalUrl(customerId: string): string {
  return `https://app.lemonsqueezy.com/my-orders/${customerId}`;
}

// Export Lemon Squeezy functions for use in API routes
export {
  getSubscription,
  cancelSubscription,
  updateSubscription,
  listSubscriptions,
};

// Type exports
export type { Variant, Checkout, Subscription };
