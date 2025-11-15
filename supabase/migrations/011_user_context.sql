-- Create user_context table for cross-session memory
-- Stores persistent recovery profile and context for Elder Tree

CREATE TABLE IF NOT EXISTS user_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Recovery Identity
  preferred_name TEXT,
  addiction_type TEXT,
  recovery_start_date DATE,
  current_step INTEGER CHECK (current_step BETWEEN 1 AND 12),

  -- Step Progress (JSONB for flexibility)
  -- Format: [{"step": 1, "started": "2024-08-01", "completed": "2024-09-15"}, ...]
  step_progress JSONB DEFAULT '[]'::jsonb,

  -- Support System
  has_sponsor BOOLEAN DEFAULT false,
  sponsor_name TEXT,
  in_fellowship BOOLEAN DEFAULT false,
  fellowship_name TEXT,
  has_therapist BOOLEAN DEFAULT false,
  other_support JSONB DEFAULT '[]'::jsonb,

  -- Zone Definitions
  red_zone_behaviors JSONB DEFAULT '[]'::jsonb,
  yellow_zone_behaviors JSONB DEFAULT '[]'::jsonb,
  green_zone_behaviors JSONB DEFAULT '[]'::jsonb,

  -- Patterns & Triggers
  known_triggers JSONB DEFAULT '[]'::jsonb,
  vulnerability_windows JSONB DEFAULT '[]'::jsonb,
  successful_strategies JSONB DEFAULT '[]'::jsonb,

  -- Preferences
  spiritual_framework TEXT,
  prayer_comfort_level TEXT,

  -- Contextual Memory (Auto-updated)
  recent_themes TEXT[],
  context_summary TEXT, -- AI-generated summary for prompt injection
  last_summary_update TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_context_user_id ON user_context(user_id);
CREATE INDEX idx_user_context_updated_at ON user_context(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own context"
  ON user_context
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context"
  ON user_context
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context"
  ON user_context
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own context"
  ON user_context
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_user_context_updated_at
  BEFORE UPDATE ON user_context
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE user_context IS 'Stores persistent user recovery profile and context for Elder Tree cross-session memory';
COMMENT ON COLUMN user_context.step_progress IS 'JSONB array of step work history: [{step, started, completed}, ...]';
COMMENT ON COLUMN user_context.context_summary IS 'AI-generated summary injected into Elder Tree prompts (~200 words max)';
COMMENT ON COLUMN user_context.recent_themes IS 'Top 5 recurring themes from recent conversations';
