import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(body).digest('hex');

    if (signature !== digest) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const eventName = event.meta.event_name;

    // Handle different event types
    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(event);
        break;

      case 'subscription_created':
        await handleSubscriptionCreated(event);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(event);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(event);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(event);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(event);
        break;

      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleOrderCreated(event: any) {
  const { data, meta } = event;
  const userId = data.attributes.custom_data?.user_id;

  if (!userId) {
    console.log('No user ID found in order');
    return;
  }

  console.log(`Order created for user ${userId}`);
}

async function handleSubscriptionCreated(event: any) {
  const { data } = event;
  const attributes = data.attributes;
  const userId = attributes.custom_data?.user_id;

  if (!userId) {
    throw new Error('No user ID found in subscription');
  }

  // Upsert subscription in database
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: userId,
    lemonsqueezy_customer_id: attributes.customer_id.toString(),
    lemonsqueezy_subscription_id: data.id,
    lemonsqueezy_variant_id: attributes.variant_id.toString(),
    status: attributes.status,
    current_period_start: attributes.renews_at,
    current_period_end: attributes.ends_at || attributes.renews_at,
    cancel_at_period_end: attributes.status === 'cancelled',
    updated_at: new Date().toISOString(),
  });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(event: any) {
  const { data } = event;
  const attributes = data.attributes;
  const userId = attributes.custom_data?.user_id;

  if (!userId) {
    console.log('No user ID found in subscription update');
    return;
  }

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: attributes.status,
      lemonsqueezy_variant_id: attributes.variant_id.toString(),
      current_period_start: attributes.renews_at,
      current_period_end: attributes.ends_at || attributes.renews_at,
      cancel_at_period_end: attributes.status === 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  console.log(`Subscription updated for user ${userId}`);
}

async function handleSubscriptionCancelled(event: any) {
  const { data } = event;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  console.log(`Subscription cancelled: ${data.id}`);
}

async function handleSubscriptionResumed(event: any) {
  const { data } = event;
  const attributes = data.attributes;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: attributes.status,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  console.log(`Subscription resumed: ${data.id}`);
}

async function handlePaymentSuccess(event: any) {
  const { data } = event;
  console.log(`Payment succeeded for subscription ${data.id}`);
}

async function handlePaymentFailed(event: any) {
  const { data } = event;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  console.log(`Payment failed for subscription ${data.id}`);
}
