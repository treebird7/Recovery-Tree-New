# Lemon Squeezy Integration Setup Guide

This guide will walk you through setting up Lemon Squeezy payments for Rooting Routine.

## Why Lemon Squeezy?

Lemon Squeezy is perfect for this project because:
- ✅ **Works in Israel** (and 135+ countries)
- ✅ **Merchant of Record** - They handle ALL tax compliance, VAT, sales tax globally
- ✅ **Simpler than Stripe** - Less setup, easier to maintain
- ✅ **Great UX** - Beautiful checkout experience
- ✅ **No PCI compliance worries** - They handle everything
- ✅ **Developer-friendly** - Clean API, great documentation

## Overview

The integration includes:
- **Checkout**: Secure hosted checkout page
- **Subscriptions**: Recurring monthly and yearly billing
- **Customer Portal**: Built-in self-service management
- **Webhooks**: Automatic subscription status updates
- **Database Sync**: Subscription data stored in Supabase

## Files Created

### Backend
- `lib/lemonsqueezy.ts` - Lemon Squeezy utility functions and pricing
- `app/api/lemonsqueezy/checkout/route.ts` - Create checkout URLs
- `app/api/lemonsqueezy/webhook/route.ts` - Handle webhooks
- `app/api/lemonsqueezy/subscription/route.ts` - Subscription management
- `types/subscription.ts` - TypeScript types

### Frontend
- `app/pricing/page.tsx` - Pricing page with plan selection
- `app/success/page.tsx` - Post-checkout success page
- `components/SubscriptionManager.tsx` - Subscription management UI

### Database
- `supabase/migrations/002_subscriptions.sql` - Subscriptions table schema

## Setup Instructions

### 1. Install Dependencies

Already done! The package was installed:
```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

### 2. Create Lemon Squeezy Account

1. Go to [Lemon Squeezy](https://lemonsqueezy.com)
2. Click **Sign Up** and create an account
3. Complete your store setup:
   - Store name: "Rooting Routine"
   - Store URL: Choose your subdomain
   - Accept terms

### 3. Set Up Your Store

1. Go to **Settings** > **General**
2. Fill in your store details:
   - Logo
   - Store description
   - Support email
3. Complete tax settings (Lemon Squeezy handles this automatically!)

### 4. Create Products

#### Create Monthly Subscription:

1. Go to **Products** in the sidebar
2. Click **+ New Product**
3. Fill in details:
   - **Name**: Daily Practice
   - **Description**: Unlimited guided walks, all 12 steps, and premium features
   - **Pricing**:
     - Price: $9.99 USD
     - Billing: Every 1 month
     - Type: Subscription
   - **Media**: Add product image (optional)
4. Click **Save Product**
5. Go to **Variants** tab
6. Copy the **Variant ID** (number like `123456`)

#### Create Yearly Subscription:

1. Click **+ New Product** again
2. Fill in details:
   - **Name**: Annual Journey
   - **Description**: Everything in Daily Practice plus annual benefits - save 17%!
   - **Pricing**:
     - Price: $99.99 USD
     - Billing: Every 12 months
     - Type: Subscription
3. Click **Save Product**
4. Go to **Variants** tab
5. Copy the **Variant ID**

### 5. Get API Credentials

#### API Key:
1. Go to **Settings** > **API**
2. Click **Create API Key**
3. Name it: "Production API Key"
4. Copy the API key (starts with `lemon_api_...`)
5. Keep it safe!

#### Store ID:
1. Still in **Settings** > **API**
2. Look for **Store ID** at the top
3. Copy the number (like `12345`)

#### Test Mode (optional):
- Lemon Squeezy automatically provides test mode
- Use test mode for development
- Switch to live mode when ready

### 6. Configure Environment Variables

Update your `.env.local` file:

```env
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=lemon_api_... # Your API key
LEMONSQUEEZY_STORE_ID=12345 # Your store ID
LEMONSQUEEZY_MONTHLY_VARIANT_ID=123456 # Monthly plan variant ID
LEMONSQUEEZY_YEARLY_VARIANT_ID=123457 # Yearly plan variant ID
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret # We'll set this up next

# Supabase Service Key
SUPABASE_SERVICE_KEY=your-service-key # From Supabase dashboard > Settings > API
```

### 7. Run Database Migration

Run the subscription table migration:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL from:
# supabase/migrations/002_subscriptions.sql
```

In Supabase dashboard:
1. Go to **SQL Editor**
2. Create new query
3. Paste contents of `supabase/migrations/002_subscriptions.sql`
4. Click **Run**

### 8. Set Up Webhooks

#### Create Webhook Endpoint:

1. Deploy your app first (or use ngrok for local testing)
2. Go to **Settings** > **Webhooks** in Lemon Squeezy
3. Click **+ Create Webhook**
4. Fill in:
   - **URL**: `https://your-domain.com/api/lemonsqueezy/webhook`
   - For local testing: `https://your-ngrok-url.ngrok.io/api/lemonsqueezy/webhook`
5. **Events to subscribe to**:
   - ✅ `order_created`
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_cancelled`
   - ✅ `subscription_expired`
   - ✅ `subscription_resumed`
   - ✅ `subscription_payment_success`
   - ✅ `subscription_payment_failed`
6. Click **Save**
7. Copy the **Signing Secret** (starts with `whsec_...`)
8. Add it to `.env.local`:
   ```env
   LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...
   ```

#### For Local Testing with ngrok:

```bash
# Install ngrok if you haven't
brew install ngrok

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the HTTPS URL (like https://abc123.ngrok.io)
# Use this URL in your webhook settings
```

### 9. Customize Checkout (Optional)

1. Go to **Settings** > **Checkout**
2. Customize:
   - Logo
   - Colors to match your brand
   - Custom domain (paid feature)
   - Email notifications

### 10. Test the Integration

#### Using Test Mode:

1. In Lemon Squeezy dashboard, enable **Test Mode** (toggle at top)
2. Start your dev server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:3000/pricing`
4. Click on a plan
5. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
6. Complete checkout
7. Verify:
   - Subscription appears in Lemon Squeezy dashboard
   - Subscription appears in Supabase `subscriptions` table
   - Webhook events visible in Lemon Squeezy > Settings > Webhooks

## API Endpoints

### POST `/api/lemonsqueezy/checkout`
Create a checkout URL for subscription.

**Request:**
```json
{
  "variantId": "123456"
}
```

**Response:**
```json
{
  "url": "https://your-store.lemonsqueezy.com/checkout/..."
}
```

### GET `/api/lemonsqueezy/subscription`
Get current user's subscription.

**Response:**
```json
{
  "subscription": {
    "id": "uuid",
    "user_id": "uuid",
    "lemonsqueezy_customer_id": "123",
    "lemonsqueezy_subscription_id": "456",
    "lemonsqueezy_variant_id": "789",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "cancel_at_period_end": false
  }
}
```

### DELETE `/api/lemonsqueezy/subscription`
Cancel current user's subscription.

**Response:**
```json
{
  "message": "Subscription canceled successfully"
}
```

## Pricing Configuration

Edit pricing in `lib/lemonsqueezy.ts`:

```typescript
export const PRICING = {
  free: {
    name: 'Free Walk',
    price: 0,
    variantId: null,
    features: [/* ... */],
  },
  monthly: {
    name: 'Daily Practice',
    price: 9.99,
    variantId: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
    features: [/* ... */],
  },
  yearly: {
    name: 'Annual Journey',
    price: 99.99,
    variantId: process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID!,
    features: [/* ... */],
  },
};
```

## Usage in Your App

### Display Pricing Page
Link users to `/pricing` to show subscription options.

### Add Subscription Manager to Dashboard
```tsx
import SubscriptionManager from '@/components/SubscriptionManager';

export default function Dashboard() {
  return (
    <div>
      {/* Other dashboard content */}
      <SubscriptionManager />
    </div>
  );
}
```

### Check Subscription Status
```typescript
// In your API routes or server components
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .single();

const hasActiveSubscription = subscription?.status === 'active';
```

## Subscription Statuses

Lemon Squeezy subscription statuses:
- `on_trial` - In trial period
- `active` - Active and paid
- `paused` - Temporarily paused
- `past_due` - Payment failed
- `unpaid` - Failed to collect payment
- `cancelled` - Canceled by customer
- `expired` - Subscription has expired

## Customer Portal

Lemon Squeezy provides a built-in customer portal where users can:
- Update payment methods
- View invoices and receipts
- Cancel subscriptions
- Update billing information

The portal URL: `https://app.lemonsqueezy.com/my-orders`

Users are automatically authenticated via email when they access it.

## Advantages Over Stripe

### For You (Developer):
1. **Tax Compliance**: Lemon Squeezy handles ALL tax (VAT, sales tax) automatically
2. **Simpler Setup**: No need to configure tax rates or worry about regulations
3. **Easier Webhooks**: Simpler webhook structure, easier to test
4. **No PCI Compliance**: They're the merchant of record
5. **Works in Israel**: Full support without restrictions

### For Your Users:
1. **Smooth Checkout**: Beautiful, optimized checkout experience
2. **Trust**: Lemon Squeezy handles payments (not you)
3. **Global Support**: Works in 135+ countries
4. **Easy Management**: Simple self-service portal
5. **Proper Invoices**: Automatic VAT-compliant invoices

## Testing

### Test Checkout Flow
1. Enable test mode in Lemon Squeezy
2. Create subscription with test card
3. Verify subscription in Supabase
4. Check webhook delivery in Lemon Squeezy dashboard
5. Test customer portal access
6. Cancel subscription and verify status

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002

Any future expiry, any CVC
```

## Going Live

1. Complete store setup in Lemon Squeezy
2. Verify bank account details for payouts
3. Switch from **Test Mode** to **Live Mode**
4. Update webhook URL to production domain
5. Create live products and variants
6. Update environment variables with live variant IDs
7. Test with small real transaction
8. Launch! 🚀

## Pricing & Fees

Lemon Squeezy pricing (as of 2024):
- **5% + 50¢** per transaction
- No monthly fees
- No setup fees
- Includes:
  - Payment processing
  - VAT/tax handling
  - Fraud prevention
  - Customer portal
  - Email receipts

Compare to Stripe:
- Stripe: 2.9% + 30¢ + you handle tax compliance
- Lemon Squeezy: 5% + 50¢ + they handle everything

The extra cost is worth it for the simplified tax compliance!

## Troubleshooting

### Webhook Not Firing
- Check webhook URL is correct and publicly accessible
- Verify `LEMONSQUEEZY_WEBHOOK_SECRET` is set correctly
- Check webhook logs in Lemon Squeezy dashboard
- Ensure ngrok is running for local testing

### Subscription Not Appearing
- Check webhook was received (Settings > Webhooks > Activity)
- Verify database migration ran successfully
- Check Supabase logs for errors
- Ensure `SUPABASE_SERVICE_KEY` is correct

### Checkout Redirect Failed
- Verify variant ID is correct
- Check user is authenticated
- Ensure `LEMONSQUEEZY_STORE_ID` is set

### Can't Access Customer Portal
- Portal URL: `https://app.lemonsqueezy.com/my-orders`
- Users must use same email as subscription
- Check email for access link

## Support Resources

- [Lemon Squeezy Documentation](https://docs.lemonsqueezy.com)
- [API Reference](https://docs.lemonsqueezy.com/api)
- [Webhooks Guide](https://docs.lemonsqueezy.com/help/webhooks)
- [Discord Community](https://discord.gg/lemonsqueezy)
- Email: hello@lemonsqueezy.com

## Security Best Practices

1. **Webhook Signature Verification**: Always verify (implemented in webhook route)
2. **Environment Variables**: Never commit API keys
3. **HTTPS Only**: Always use HTTPS in production
4. **RLS Enabled**: Subscriptions table has Row Level Security
5. **Service Key**: Only use in API routes, never client-side

## Migration from Stripe (if needed)

If you had Stripe before:

1. Export customer data from Stripe
2. Create matching products in Lemon Squeezy
3. Migrate active subscriptions manually
4. Update environment variables
5. Deploy with Lemon Squeezy integration
6. Inform customers of the change

## FAQs

**Q: Does Lemon Squeezy work for Israeli customers?**
A: Yes! Works perfectly for Israeli businesses and customers.

**Q: Do I need to register for VAT?**
A: No! Lemon Squeezy is the merchant of record and handles all tax.

**Q: Can I offer discounts?**
A: Yes, create discount codes in Settings > Discounts.

**Q: Can I offer free trials?**
A: Yes, configure trials when creating products.

**Q: How do refunds work?**
A: Process refunds through Lemon Squeezy dashboard.

**Q: When do I get paid?**
A: Payouts are automatic (you can set the schedule).

---

**You're all set!** Lemon Squeezy is the simplest way to accept payments globally. Focus on building your app, let them handle the payments and compliance. 🍋
