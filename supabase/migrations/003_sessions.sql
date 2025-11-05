-- Create sessions table for recovery walk sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Session timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Pre-walk check-in
  pre_walk_mood TEXT,
  pre_walk_intention TEXT,

  -- Step being worked
  current_step TEXT NOT NULL CHECK (current_step IN ('step1', 'step2', 'step3')),

  -- Conversation data
  step_responses JSONB DEFAULT '[]'::jsonb,

  -- Post-walk completion
  final_reflection TEXT,
  generated_image_url TEXT,
  encouragement_message TEXT,
  insights TEXT[],

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create session_analytics table for tracking metrics
CREATE TABLE IF NOT EXISTS session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,

  -- Walk metrics
  walk_duration INTEGER, -- in minutes
  questions_completed INTEGER NOT NULL DEFAULT 0,
  step_worked TEXT NOT NULL CHECK (step_worked IN ('step1', 'step2', 'step3', 'mixed')),

  -- Response quality indicators
  vague_answers_count INTEGER DEFAULT 0,
  breakthrough_moments INTEGER DEFAULT 0,
  pushback_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_completed_at ON sessions(completed_at DESC);
CREATE INDEX idx_sessions_current_step ON sessions(current_step);
CREATE INDEX idx_session_analytics_session_id ON session_analytics(session_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions table
CREATE POLICY "Users can view own sessions"
  ON sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for session_analytics table
CREATE POLICY "Users can view own session analytics"
  ON session_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_analytics.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own session analytics"
  ON session_analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_analytics.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on sessions table
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE sessions IS 'Stores recovery walk session data including questions, answers, and AI-generated reflections';
COMMENT ON TABLE session_analytics IS 'Stores analytics and metrics for each walk session';
COMMENT ON COLUMN sessions.step_responses IS 'JSONB array of {question, answer, timestamp, hasRedFlags, isBreakthrough} objects';
COMMENT ON COLUMN sessions.insights IS 'Array of key insights identified during the session';
