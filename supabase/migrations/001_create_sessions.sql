-- Create sessions table for recovery walk sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  pre_walk_mood TEXT,
  pre_walk_intention TEXT,
  step_responses JSONB, -- Stores all Q&A for the session
  final_reflection TEXT,
  generated_image_url TEXT,
  encouragement_message TEXT,
  insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session analytics table (optional, for future use)
CREATE TABLE IF NOT EXISTS session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  walk_duration INTEGER, -- in minutes
  questions_completed INTEGER,
  step_worked TEXT, -- 'step1', 'step2', 'step3', or 'mixed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_session_analytics_session_id ON session_analytics(session_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions table
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

-- Create policies for session_analytics table
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

-- Add comments to tables
COMMENT ON TABLE sessions IS 'Stores recovery walk session data including questions, answers, and generated reflections';
COMMENT ON TABLE session_analytics IS 'Stores analytics data for completed walk sessions';
