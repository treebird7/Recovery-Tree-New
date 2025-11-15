-- Agent Status Tracking for Parallel Development
-- Allows Claude Code agents on different branches to share status

CREATE TABLE IF NOT EXISTS agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE, -- e.g., "claude-web-session-123" or "vscode-session-456"
  branch_name TEXT NOT NULL,
  agent_type TEXT NOT NULL, -- "claude-code-web", "vscode", "terminal"
  current_task TEXT,
  status TEXT NOT NULL DEFAULT 'idle', -- idle, working, blocked, completed
  details JSONB DEFAULT '{}', -- flexible field for any extra info
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_agent_status_session ON agent_status(session_id);
CREATE INDEX idx_agent_status_branch ON agent_status(branch_name);
CREATE INDEX idx_agent_status_updated ON agent_status(last_updated DESC);

-- Automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION update_agent_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_status_update_timestamp
  BEFORE UPDATE ON agent_status
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_status_timestamp();

-- View for active agents (updated in last 10 minutes)
CREATE OR REPLACE VIEW active_agents AS
SELECT
  session_id,
  branch_name,
  agent_type,
  current_task,
  status,
  details,
  last_updated,
  EXTRACT(EPOCH FROM (NOW() - last_updated)) as seconds_since_update
FROM agent_status
WHERE last_updated > NOW() - INTERVAL '10 minutes'
ORDER BY last_updated DESC;

-- Enable Row Level Security (optional - adjust as needed)
ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (since this is for development coordination)
CREATE POLICY agent_status_all ON agent_status
  FOR ALL
  USING (true)
  WITH CHECK (true);
