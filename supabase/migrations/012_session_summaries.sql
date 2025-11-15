-- Create session_summaries table for recent session context
-- Stores AI-extracted insights from each completed session

CREATE TABLE IF NOT EXISTS session_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Session Context
  urge_intensity INTEGER CHECK (urge_intensity BETWEEN 0 AND 10),
  primary_trigger TEXT,
  resistance_strategy_used TEXT,
  outcome TEXT CHECK (outcome IN ('urge_passed', 'relapsed', 'ongoing_struggle', 'reflection_only')),

  -- Insights
  key_insights JSONB DEFAULT '[]'::jsonb,
  emotional_state_start TEXT,
  emotional_state_end TEXT,
  follow_up_needed TEXT,

  -- Profile Updates Detected (for tracking what changed)
  profile_updates JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX idx_session_summaries_user_id ON session_summaries(user_id);
CREATE INDEX idx_session_summaries_user_date ON session_summaries(user_id, completed_at DESC);
CREATE INDEX idx_session_summaries_session_id ON session_summaries(session_id);

-- Enable Row Level Security
ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own session summaries"
  ON session_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session summaries"
  ON session_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session summaries"
  ON session_summaries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own session summaries"
  ON session_summaries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE session_summaries IS 'AI-extracted summaries of completed sessions for recent context memory';
COMMENT ON COLUMN session_summaries.key_insights IS 'Array of 2-3 key insights extracted from the session';
COMMENT ON COLUMN session_summaries.profile_updates IS 'JSON object of profile fields updated from this session';
COMMENT ON COLUMN session_summaries.outcome IS 'Session outcome: urge_passed (success), relapsed, ongoing_struggle, or reflection_only (walk session)';
