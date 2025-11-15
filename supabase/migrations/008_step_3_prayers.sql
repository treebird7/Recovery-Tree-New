-- Step 3 Prayer Protocol tables
-- Prayer library and user-created prayers for Step 3 commitment

-- Prayer Library table (pre-populated prayers for users to select)
CREATE TABLE IF NOT EXISTS prayer_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_text TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('generated', 'traditional', 'community')),
  category TEXT DEFAULT 'step_3',
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- User Prayers table (prayers selected or created by users)
CREATE TABLE IF NOT EXISTS user_prayers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prayer_text TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('library_selected', 'custom', 'elder_tree_collaborative')),
  library_prayer_id UUID REFERENCES prayer_library(id) ON DELETE SET NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add step tracking columns to users table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'current_step') THEN
    ALTER TABLE users ADD COLUMN current_step INTEGER DEFAULT 1 CHECK (current_step IN (1, 2, 3));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'step_1_completed') THEN
    ALTER TABLE users ADD COLUMN step_1_completed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'step_2_completed') THEN
    ALTER TABLE users ADD COLUMN step_2_completed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'step_3_completed') THEN
    ALTER TABLE users ADD COLUMN step_3_completed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'primary_prayer_id') THEN
    ALTER TABLE users ADD COLUMN primary_prayer_id UUID REFERENCES user_prayers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_prayer_library_category
  ON prayer_library(category);

CREATE INDEX IF NOT EXISTS idx_prayer_library_active
  ON prayer_library(is_active);

CREATE INDEX IF NOT EXISTS idx_user_prayers_user_id
  ON user_prayers(user_id);

CREATE INDEX IF NOT EXISTS idx_user_prayers_library_id
  ON user_prayers(library_prayer_id);

-- Enable Row Level Security
ALTER TABLE prayer_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prayers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayer_library (all authenticated users can read)
CREATE POLICY "Anyone can view active prayers"
  ON prayer_library
  FOR SELECT
  USING (is_active = TRUE);

-- RLS Policies for user_prayers
CREATE POLICY "Users can view own prayers"
  ON user_prayers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayers"
  ON user_prayers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers"
  ON user_prayers
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayers"
  ON user_prayers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_prayers_updated_at
  BEFORE UPDATE ON user_prayers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE prayer_library IS 'Pre-populated prayer library for Step 3 selection';
COMMENT ON TABLE user_prayers IS 'User-selected or custom prayers for Step 3 commitment';
COMMENT ON COLUMN user_prayers.source IS 'Origin of prayer: library_selected, custom, or elder_tree_collaborative';
COMMENT ON COLUMN user_prayers.is_primary IS 'User designated primary prayer for daily practice';

-- Insert sample prayers (can be replaced with actual prayer content)
INSERT INTO prayer_library (prayer_text, source, category, author) VALUES
('God, I offer myself to Thee—to build with me and to do with me as Thou wilt. Relieve me of the bondage of self, that I may better do Thy will. Take away my difficulties, that victory over them may bear witness to those I would help of Thy Power, Thy Love, and Thy Way of life. May I do Thy will always!', 'traditional', 'step_3', 'Alcoholics Anonymous Big Book'),
('Higher Power, I surrender my will and my life to your care. I release control and trust in your guidance. Help me let go of what I cannot change and find peace in your wisdom.', 'generated', 'step_3', NULL),
('Today I choose to trust. I release my grip on outcomes and surrender to the process. I am not in control, and that is okay. My Higher Power has a plan better than anything I could design.', 'generated', 'step_3', NULL),
('I am willing to let go. I turn over my fears, my resentments, and my need to control. I trust that my Higher Power will guide me toward the next right thing.', 'generated', 'step_3', NULL),
('Higher Power, take my will. Take my life. Guide me toward truth, toward recovery, toward freedom. I am ready to follow your lead.', 'generated', 'step_3', NULL);
