export interface Subscription {
  id: string;
  user_id: string;
  lemonsqueezy_customer_id: string;
  lemonsqueezy_subscription_id: string;
  lemonsqueezy_variant_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface SubscriptionWithDetails extends Subscription {
  plan_name: string;
  plan_price: number;
  plan_interval: 'month' | 'year';
}
