-- Add mining/urge session fields to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'walk' CHECK (session_type IN ('walk', 'mining'));

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS mining_started_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS mining_ended_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS mining_duration_minutes INTEGER;

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS coins_earned INTEGER DEFAULT 0;

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS user_state_after_mining TEXT CHECK (user_state_after_mining IN ('stable', 'crisis'));

-- Create user_coins table to track total coin balance
CREATE TABLE IF NOT EXISTS user_coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_coins INTEGER DEFAULT 0 NOT NULL,
  last_earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_user_coins_user_id ON user_coins(user_id);

-- Enable Row Level Security
ALTER TABLE user_coins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_coins table
CREATE POLICY "Users can view own coins"
  ON user_coins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coins"
  ON user_coins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coins"
  ON user_coins
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to initialize user coins on first mining session
CREATE OR REPLACE FUNCTION initialize_user_coins()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_coins (user_id, total_coins)
  VALUES (NEW.user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-initialize coins when user creates first session
CREATE TRIGGER init_user_coins_on_session
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_coins();

-- Function to automatically update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user_coins updated_at
CREATE TRIGGER update_user_coins_updated_at
  BEFORE UPDATE ON user_coins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN sessions.session_type IS 'Type of session: walk (step work) or mining (sleep timer)';
COMMENT ON COLUMN sessions.mining_started_at IS 'When user activated sleep mining timer';
COMMENT ON COLUMN sessions.mining_ended_at IS 'When user opened app after mining (morning reveal)';
COMMENT ON COLUMN sessions.coins_earned IS 'Coins earned from this mining session (1 per minute)';
COMMENT ON COLUMN sessions.user_state_after_mining IS 'User state after mining: stable (celebrate) or crisis (immediate support)';
COMMENT ON TABLE user_coins IS 'Tracks total coin balance for each user across all sessions';
