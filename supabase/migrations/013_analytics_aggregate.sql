-- Create analytics_aggregate table for Dr. Silkworth supervision sessions
-- Stores weekly aggregated, anonymized metrics and patterns

CREATE TABLE IF NOT EXISTS analytics_aggregate (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_ending DATE NOT NULL,

  -- Activity Metrics
  total_sessions_completed INTEGER DEFAULT 0,
  total_mining_sessions INTEGER DEFAULT 0,
  total_walk_sessions INTEGER DEFAULT 0,
  total_mining_minutes INTEGER DEFAULT 0,
  average_urge_intensity DECIMAL(3,1),
  streak_length INTEGER DEFAULT 0,

  -- Outcomes
  urge_passed_count INTEGER DEFAULT 0,
  relapse_count INTEGER DEFAULT 0,
  overall_success_rate DECIMAL(3,2),

  -- Pattern Analysis
  common_triggers JSONB DEFAULT '[]'::jsonb, -- [{trigger: 'loneliness', count: 15}, ...]
  successful_strategies JSONB DEFAULT '[]'::jsonb, -- [{strategy: 'called_sponsor', success_rate: 0.85}, ...]
  vulnerability_times JSONB DEFAULT '[]'::jsonb, -- [{time: 'late_night', frequency: 12}, ...]

  -- Progress Indicators
  step_work_progress JSONB DEFAULT '{}'::jsonb,
  zone_violations JSONB DEFAULT '[]'::jsonb,
  breakthrough_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, week_ending)
);

-- Indexes
CREATE INDEX idx_analytics_aggregate_user_id ON analytics_aggregate(user_id);
CREATE INDEX idx_analytics_aggregate_week ON analytics_aggregate(week_ending DESC);
CREATE INDEX idx_analytics_aggregate_user_week ON analytics_aggregate(user_id, week_ending DESC);

-- Enable Row Level Security
ALTER TABLE analytics_aggregate ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analytics"
  ON analytics_aggregate
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_aggregate
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE analytics_aggregate IS 'Weekly aggregated user analytics for personal insights and Dr. Silkworth supervision';
COMMENT ON COLUMN analytics_aggregate.week_ending IS 'Sunday date ending the week';
COMMENT ON COLUMN analytics_aggregate.common_triggers IS 'Ranked list of triggers with occurrence counts';
COMMENT ON COLUMN analytics_aggregate.successful_strategies IS 'Strategies with success rates calculated from outcomes';
COMMENT ON COLUMN analytics_aggregate.overall_success_rate IS 'Percentage of sessions where urge passed (0.00 to 1.00)';
