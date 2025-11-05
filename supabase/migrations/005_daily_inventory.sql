-- Daily Inventory table for Step 10 practice
-- End-of-day reflection tracking

CREATE TABLE IF NOT EXISTS daily_inventories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- Responses to prompts (4 core questions)
  what_went_well TEXT,
  struggles_today TEXT,
  gratitude TEXT,
  tomorrow_intention TEXT,
  additional_notes TEXT,

  -- Elder Tree reflection
  elder_reflection TEXT,

  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Ensure one inventory per day per user
  UNIQUE(user_id, date)
);

-- Index for faster lookups by user and date
CREATE INDEX IF NOT EXISTS idx_daily_inventories_user_date
  ON daily_inventories(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE daily_inventories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own inventories"
  ON daily_inventories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventories"
  ON daily_inventories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventories"
  ON daily_inventories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventories"
  ON daily_inventories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_daily_inventories_updated_at
  BEFORE UPDATE ON daily_inventories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE daily_inventories IS 'Daily end-of-day inventory reflections (Step 10 practice)';
COMMENT ON COLUMN daily_inventories.date IS 'Date of the inventory (one per day per user)';
COMMENT ON COLUMN daily_inventories.what_went_well IS 'What went well today - recovery wins, connections, honesty';
COMMENT ON COLUMN daily_inventories.struggles_today IS 'What was hard today - urges, resentments, challenges';
COMMENT ON COLUMN daily_inventories.gratitude IS 'What are you grateful for - 1-3 things';
COMMENT ON COLUMN daily_inventories.tomorrow_intention IS 'One thing to do differently tomorrow - actionable';
COMMENT ON COLUMN daily_inventories.elder_reflection IS 'Generated Elder Tree reflection based on responses';
