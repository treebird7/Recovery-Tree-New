-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lemonsqueezy_customer_id TEXT NOT NULL,
  lemonsqueezy_subscription_id TEXT UNIQUE NOT NULL,
  lemonsqueezy_variant_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Create index on lemonsqueezy_customer_id for webhook lookups
CREATE INDEX idx_subscriptions_lemonsqueezy_customer_id ON subscriptions(lemonsqueezy_customer_id);

-- Create index on lemonsqueezy_subscription_id for webhook lookups
CREATE INDEX idx_subscriptions_lemonsqueezy_subscription_id ON subscriptions(lemonsqueezy_subscription_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Service role can do everything (for webhooks)
CREATE POLICY "Service role has full access"
  ON subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comment to table
COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription data for users';
