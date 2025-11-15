-- Migration: Performance Optimization Indexes
-- Date: 2025-11-12
-- Purpose: Add indexes to optimize common query patterns identified in Phase 2 audit

-- ============================================================================
-- SESSIONS TABLE INDEXES
-- ============================================================================

-- Index for user's completed sessions (used on dashboard)
CREATE INDEX IF NOT EXISTS idx_sessions_user_completed
  ON sessions(user_id, completed_at DESC)
  WHERE completed_at IS NOT NULL;

-- Index for active mining sessions (frequent query in urge flow)
CREATE INDEX IF NOT EXISTS idx_sessions_active_mining
  ON sessions(user_id, mining_started_at DESC)
  WHERE session_type = 'mining' AND mining_ended_at IS NULL;

-- Index for session type filtering (used in history queries)
CREATE INDEX IF NOT EXISTS idx_sessions_type_date
  ON sessions(user_id, session_type, started_at DESC);

-- Index for user streak calculations (daily queries)
-- Note: Indexing on timestamp, date queries will use range conditions
CREATE INDEX IF NOT EXISTS idx_sessions_user_date
  ON sessions(user_id, started_at DESC)
  WHERE completed_at IS NOT NULL;

-- ============================================================================
-- STEPS_JOURNAL TABLE INDEXES
-- ============================================================================

-- Index for user's journal entries by step (Step In queries)
CREATE INDEX IF NOT EXISTS idx_steps_journal_user_step
  ON steps_journal(user_id, step_number, created_at DESC);

-- Index for session-based queries (retrieving all answers in a session)
CREATE INDEX IF NOT EXISTS idx_steps_journal_session
  ON steps_journal(session_id, created_at ASC);

-- Index for question completion tracking
CREATE INDEX IF NOT EXISTS idx_steps_journal_question_user
  ON steps_journal(question_id, user_id);

-- Composite index for unanswered questions query
CREATE INDEX IF NOT EXISTS idx_steps_journal_user_step_question
  ON steps_journal(user_id, step_number, question_id);

-- ============================================================================
-- STEP_QUESTIONS TABLE INDEXES
-- ============================================================================

-- Index for fetching questions by step and order (primary query pattern)
CREATE INDEX IF NOT EXISTS idx_step_questions_step_order
  ON step_questions(step_number, question_order ASC)
  WHERE is_active = true;

-- Index for completion markers (step completion check)
CREATE INDEX IF NOT EXISTS idx_step_questions_completion
  ON step_questions(step_number, completion_marker)
  WHERE is_active = true AND completion_marker = true;

-- Index for phase-based queries
CREATE INDEX IF NOT EXISTS idx_step_questions_phase
  ON step_questions(step_number, phase, question_order ASC)
  WHERE is_active = true;

-- ============================================================================
-- DAILY_INVENTORIES TABLE INDEXES
-- ============================================================================

-- Index for today's inventory check (most frequent query)
-- Note: Indexing on timestamp, date queries will use range conditions
CREATE INDEX IF NOT EXISTS idx_daily_inventories_user_date
  ON daily_inventories(user_id, created_at DESC);

-- Index for inventory streak calculation
CREATE INDEX IF NOT EXISTS idx_daily_inventories_streak
  ON daily_inventories(user_id, created_at DESC);

-- ============================================================================
-- USER_COINS TABLE INDEXES
-- ============================================================================

-- Index for user coin lookups (dashboard query)
CREATE INDEX IF NOT EXISTS idx_user_coins_lookup
  ON user_coins(user_id, total_coins);

-- ============================================================================
-- URGE_RESPONSES TABLE INDEXES (if exists)
-- ============================================================================

-- Check if table exists first
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'urge_responses') THEN
    -- Index for user's urge history
    CREATE INDEX IF NOT EXISTS idx_urge_responses_user_date
      ON urge_responses(user_id, created_at DESC);

    -- Index for outcome analysis
    CREATE INDEX IF NOT EXISTS idx_urge_responses_outcome
      ON urge_responses(user_id, outcome, created_at DESC);
  END IF;
END $$;

-- ============================================================================
-- PRAYERS TABLE INDEXES (Step 3 feature)
-- ============================================================================

-- Check if table exists first
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prayers') THEN
    -- Index for user's prayers (My Prayers page)
    CREATE INDEX IF NOT EXISTS idx_prayers_user_created
      ON prayers(user_id, created_at DESC);

    -- Index for prayer library queries
    CREATE INDEX IF NOT EXISTS idx_prayers_library
      ON prayers(is_public, created_at DESC)
      WHERE is_public = true;
  END IF;
END $$;

-- ============================================================================
-- QUERY PERFORMANCE ANALYSIS
-- ============================================================================

-- Add comments documenting the optimization rationale
COMMENT ON INDEX idx_sessions_user_completed IS 'Optimizes dashboard completed sessions count query';
COMMENT ON INDEX idx_sessions_active_mining IS 'Optimizes active mining session checks in urge flow';
COMMENT ON INDEX idx_steps_journal_user_step IS 'Optimizes Step In journal entry queries';
COMMENT ON INDEX idx_step_questions_step_order IS 'Optimizes question retrieval by step and order';
COMMENT ON INDEX idx_daily_inventories_user_date IS 'Optimizes today inventory check - runs on every dashboard load';

-- ============================================================================
-- STATISTICS UPDATE
-- ============================================================================

-- Update table statistics for better query planning
ANALYZE sessions;
ANALYZE steps_journal;
ANALYZE step_questions;
ANALYZE daily_inventories;
ANALYZE user_coins;

-- Analyze prayers table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prayers') THEN
    EXECUTE 'ANALYZE prayers';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Query to verify all indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
