-- Create supervision_sessions tables for Dr. Silkworth sessions with Fritz
-- Stores weekly supervision session conversations and action items

CREATE TABLE IF NOT EXISTS supervision_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_ending DATE NOT NULL UNIQUE,

  -- Session data
  conversation_turns JSONB DEFAULT '[]'::jsonb, -- [{speaker: 'fritz'|'silkworth', message, timestamp}]
  key_insights TEXT[], -- Insights surfaced during this session
  fritz_rating INTEGER CHECK (fritz_rating BETWEEN 1 AND 5),
  fritz_notes TEXT, -- Fritz's private notes from the session

  -- Session context (snapshot of aggregate data at time of session)
  aggregate_data JSONB, -- Snapshot of metrics discussed

  -- Metadata
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS supervision_action_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES supervision_sessions(id) ON DELETE CASCADE,

  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'monitor')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'deferred')),
  notes TEXT,

  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_supervision_sessions_week ON supervision_sessions(week_ending DESC);
CREATE INDEX idx_supervision_action_items_session ON supervision_action_items(session_id);
CREATE INDEX idx_supervision_action_items_status ON supervision_action_items(status);

-- Admin-only access (no user_id, these are Fritz's private sessions)
-- Note: Will need separate admin_users table or role check for RLS

-- Trigger to update updated_at
CREATE TRIGGER update_supervision_sessions_updated_at
  BEFORE UPDATE ON supervision_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supervision_action_items_updated_at
  BEFORE UPDATE ON supervision_action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE supervision_sessions IS 'Dr. Silkworth weekly supervision sessions with Fritz - admin only';
COMMENT ON COLUMN supervision_sessions.conversation_turns IS 'Full chat history: [{speaker, message, timestamp}, ...]';
COMMENT ON COLUMN supervision_sessions.aggregate_data IS 'Snapshot of anonymized aggregate metrics discussed in this session';
COMMENT ON TABLE supervision_action_items IS 'Action items generated from Dr. Silkworth supervision sessions';
