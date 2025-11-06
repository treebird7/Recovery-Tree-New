-- Add 'walkabout' to session_type check constraint
-- First, drop the existing constraint
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_session_type_check;

-- Add the new constraint with 'walkabout' included
ALTER TABLE sessions
ADD CONSTRAINT sessions_session_type_check
CHECK (session_type IN ('walk', 'mining', 'walkabout'));

-- Add walkabout-specific fields
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS body_need TEXT;

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS walkabout_duration_minutes INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN sessions.location IS 'For walkabout sessions: where the user went (park, water, garden, etc)';
COMMENT ON COLUMN sessions.body_need IS 'For walkabout sessions: what their body needed (movement, stillness, both, unsure)';
COMMENT ON COLUMN sessions.walkabout_duration_minutes IS 'Duration of walkabout session in minutes';
