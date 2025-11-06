-- Add nature therapy fields to sessions table
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS body_need TEXT,
  ADD COLUMN IF NOT EXISTS session_type TEXT;

-- Add comments for documentation
COMMENT ON COLUMN sessions.location IS 'Where the user chose to go for nature therapy (park, water, garden, urban, mountains, outside)';
COMMENT ON COLUMN sessions.body_need IS 'What the body needed (movement, stillness, both, unsure)';
COMMENT ON COLUMN sessions.session_type IS 'Type of nature session (walking, sitting, lying, standing, wandering)';
