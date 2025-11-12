-- Migration: Step Questions and Journal
-- Date: 2025-11-12
-- Purpose: Create tables for Steps 1-3 questions and user journal entries

-- =====================================================
-- TABLE 1: step_questions
-- Stores all questions for Steps 1-3
-- =====================================================

CREATE TABLE IF NOT EXISTS step_questions (
  id TEXT PRIMARY KEY,
  step_number INTEGER NOT NULL CHECK (step_number IN (1, 2, 3)),
  phase TEXT NOT NULL,
  phase_title TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('open_ended', 'yes_no')),
  is_required BOOLEAN DEFAULT TRUE,
  follow_up_type TEXT CHECK (follow_up_type IN ('none', 'reflection', 'continuation', 'conditional')),
  follow_up_text TEXT,
  conditional_follow_up JSONB,
  safety_flag BOOLEAN DEFAULT FALSE,
  completion_marker BOOLEAN DEFAULT FALSE,
  data_logging TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_step_questions_step_phase ON step_questions(step_number, phase, question_order);
CREATE INDEX idx_step_questions_active ON step_questions(is_active) WHERE is_active = TRUE;

-- Add RLS
ALTER TABLE step_questions ENABLE ROW LEVEL SECURITY;

-- Public read access for active questions (all users need to see them)
CREATE POLICY "Anyone can read active questions"
  ON step_questions
  FOR SELECT
  USING (is_active = TRUE);

-- Only admins can modify questions (you'll need to adjust this based on your auth setup)
-- For now, let's just prevent modifications through the app
CREATE POLICY "No modifications through app"
  ON step_questions
  FOR ALL
  USING (FALSE);

-- =====================================================
-- TABLE 2: steps_journal
-- Stores user answers to step questions
-- =====================================================

CREATE TABLE IF NOT EXISTS steps_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number IN (1, 2, 3)),
  question_id TEXT NOT NULL REFERENCES step_questions(id),
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  session_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_steps_journal_user ON steps_journal(user_id, step_number);
CREATE INDEX idx_steps_journal_session ON steps_journal(session_id);
CREATE INDEX idx_steps_journal_timestamp ON steps_journal(timestamp DESC);

-- Add RLS
ALTER TABLE steps_journal ENABLE ROW LEVEL SECURITY;

-- Users can only see their own journal entries
CREATE POLICY "Users can read own journal entries"
  ON steps_journal
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own journal entries
CREATE POLICY "Users can insert own journal entries"
  ON steps_journal
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries (for corrections/additions)
CREATE POLICY "Users can update own journal entries"
  ON steps_journal
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE 3: step_sessions
-- Tracks user progress through step work
-- =====================================================

CREATE TABLE IF NOT EXISTS step_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number IN (1, 2, 3)),
  phase TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  last_question_id TEXT REFERENCES step_questions(id),
  is_complete BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_step_sessions_user_step ON step_sessions(user_id, step_number);
CREATE INDEX idx_step_sessions_active ON step_sessions(user_id, step_number) 
  WHERE is_complete = FALSE;

-- RLS
ALTER TABLE step_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON step_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON step_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON step_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get next question for user
CREATE OR REPLACE FUNCTION get_next_step_question(
  p_user_id UUID,
  p_step_number INTEGER
)
RETURNS TABLE (
  question_id TEXT,
  question_text TEXT,
  question_type TEXT,
  phase TEXT,
  phase_title TEXT,
  follow_up_type TEXT,
  follow_up_text TEXT,
  conditional_follow_up JSONB,
  is_final_question BOOLEAN
) AS $$
DECLARE
  v_last_answered_order INTEGER;
  v_session_id UUID;
BEGIN
  -- Get the last answered question order for this user and step
  SELECT COALESCE(MAX(sq.question_order), 0)
  INTO v_last_answered_order
  FROM steps_journal sj
  JOIN step_questions sq ON sj.question_id = sq.id
  WHERE sj.user_id = p_user_id 
    AND sj.step_number = p_step_number;

  -- Return the next question
  RETURN QUERY
  SELECT 
    sq.id as question_id,
    sq.question_text,
    sq.question_type,
    sq.phase,
    sq.phase_title,
    sq.follow_up_type,
    sq.follow_up_text,
    sq.conditional_follow_up,
    sq.completion_marker as is_final_question
  FROM step_questions sq
  WHERE sq.step_number = p_step_number
    AND sq.question_order > v_last_answered_order
    AND sq.is_active = TRUE
  ORDER BY sq.question_order ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if step is complete
CREATE OR REPLACE FUNCTION check_step_completion(
  p_user_id UUID,
  p_step_number INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_completion_marker_answered BOOLEAN;
  v_min_questions_met BOOLEAN;
  v_required_phases_met BOOLEAN;
BEGIN
  -- Check if completion marker question has been answered affirmatively
  SELECT EXISTS (
    SELECT 1
    FROM steps_journal sj
    JOIN step_questions sq ON sj.question_id = sq.id
    WHERE sj.user_id = p_user_id
      AND sj.step_number = p_step_number
      AND sq.completion_marker = TRUE
      AND (
        (sq.question_type = 'yes_no' AND LOWER(sj.answer_text) IN ('yes', 'y', 'true'))
        OR sq.question_type = 'open_ended'
      )
  ) INTO v_completion_marker_answered;

  -- Check if minimum questions answered
  -- Step 1: 35, Step 2: 7, Step 3: 10
  SELECT 
    CASE p_step_number
      WHEN 1 THEN COUNT(*) >= 35
      WHEN 2 THEN COUNT(*) >= 7
      WHEN 3 THEN COUNT(*) >= 10
      ELSE FALSE
    END
  INTO v_min_questions_met
  FROM steps_journal
  WHERE user_id = p_user_id
    AND step_number = p_step_number;

  -- For now, just check marker and min questions
  -- TODO: Add required phases check
  v_required_phases_met := TRUE;

  RETURN v_completion_marker_answered 
    AND v_min_questions_met 
    AND v_required_phases_met;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE step_questions IS 'Stores all questions for Steps 1-3 of recovery program';
COMMENT ON TABLE steps_journal IS 'Stores user answers to step work questions';
COMMENT ON TABLE step_sessions IS 'Tracks user progress through step work sessions';
COMMENT ON FUNCTION get_next_step_question IS 'Returns the next unanswered question for a user on a given step';
COMMENT ON FUNCTION check_step_completion IS 'Determines if a user has completed a step based on answers given';
