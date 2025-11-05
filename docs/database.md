# Database Documentation

## Overview

Rooting Routine uses Supabase (PostgreSQL) for data storage. The database stores user recovery walk sessions, including questions, answers, reflections, and analytics.

## Database Schema

### Sessions Table

Stores individual recovery walk sessions with all questions, answers, and AI-generated content.

```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  pre_walk_mood TEXT,
  pre_walk_intention TEXT,
  step_responses JSONB,
  final_reflection TEXT,
  generated_image_url TEXT,
  encouragement_message TEXT,
  insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**

- `id` - Unique session identifier (UUID)
- `user_id` - References the authenticated user (from Supabase Auth)
- `started_at` - When the user started the walk session
- `completed_at` - When the session was finished (null if in progress)
- `pre_walk_mood` - User's mood before starting the walk
- `pre_walk_intention` - User's intention for the walk
- `step_responses` - JSON object containing all Q&A from the walk
- `final_reflection` - AI-generated personalized reflection
- `generated_image_url` - URL to AI-generated nature image
- `encouragement_message` - Brief AI-generated encouragement
- `insights` - Array of key insights from the session
- `created_at` - Record creation timestamp

### Session Analytics Table

Stores metrics and analytics for completed sessions.

```sql
CREATE TABLE session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  walk_duration INTEGER,
  questions_completed INTEGER,
  step_worked TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**

- `id` - Unique analytics record identifier
- `session_id` - References the session
- `walk_duration` - Duration in minutes
- `questions_completed` - Total number of questions answered
- `step_worked` - Which step(s) were worked: 'step1', 'step2', 'step3', or 'mixed'
- `created_at` - Record creation timestamp

## Indexes

Indexes improve query performance for common access patterns:

```sql
-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);

-- Session analytics indexes
CREATE INDEX idx_session_analytics_session_id ON session_analytics(session_id);
```

## Row Level Security (RLS)

RLS policies ensure users can only access their own data.

### Sessions Policies

```sql
-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can view own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own sessions
CREATE POLICY "Users can insert own sessions"
  ON sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own sessions
CREATE POLICY "Users can update own sessions"
  ON sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own sessions
CREATE POLICY "Users can delete own sessions"
  ON sessions
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Session Analytics Policies

```sql
-- Enable RLS
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view own session analytics
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

-- Users can insert own session analytics
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
```

## Data Models (TypeScript)

### Session Interface

```typescript
interface Session {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
  pre_walk_mood: string | null
  pre_walk_intention: string | null
  step_responses: StepResponses | null
  final_reflection: string | null
  generated_image_url: string | null
  encouragement_message: string | null
  insights: string[] | null
  created_at: string
}

interface StepResponses {
  step: 'step1' | 'step2' | 'step3'
  conversation: Message[]
}

interface Message {
  role: 'user' | 'elder_tree'
  content: string
  timestamp: string
}
```

### Session Analytics Interface

```typescript
interface SessionAnalytics {
  id: string
  session_id: string
  walk_duration: number
  questions_completed: number
  step_worked: 'step1' | 'step2' | 'step3' | 'mixed'
  created_at: string
}
```

## Common Database Operations

### Create New Session

```typescript
const supabase = createClient()

const { data, error } = await supabase
  .from('sessions')
  .insert({
    user_id: user.id,
    pre_walk_mood: 'anxious',
    pre_walk_intention: 'work on powerlessness',
  })
  .select()
  .single()
```

### Update Session During Walk

```typescript
const { error } = await supabase
  .from('sessions')
  .update({
    step_responses: {
      step: 'step1',
      conversation: [
        {
          role: 'elder_tree',
          content: 'Tell me about the last time you tried to stop...',
          timestamp: new Date().toISOString(),
        },
        {
          role: 'user',
          content: 'Last week I tried to limit my usage to 30 minutes...',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  })
  .eq('id', sessionId)
```

### Complete Session

```typescript
const { error } = await supabase
  .from('sessions')
  .update({
    completed_at: new Date().toISOString(),
    final_reflection: 'Your reflection text...',
    generated_image_url: 'https://...',
    encouragement_message: 'Great work today...',
    insights: ['Recognized pattern of bargaining', 'Acknowledged powerlessness'],
  })
  .eq('id', sessionId)
```

### Fetch User's Session History

```typescript
const { data: sessions, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(10)
```

### Get Latest Incomplete Session

```typescript
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', user.id)
  .is('completed_at', null)
  .order('started_at', { ascending: false })
  .limit(1)
  .single()
```

### Create Session Analytics

```typescript
const { error } = await supabase
  .from('session_analytics')
  .insert({
    session_id: sessionId,
    walk_duration: 45,
    questions_completed: 12,
    step_worked: 'step1',
  })
```

### Get User Statistics

```typescript
// Get total sessions count
const { count } = await supabase
  .from('sessions')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .not('completed_at', 'is', null)

// Get average walk duration
const { data } = await supabase
  .from('session_analytics')
  .select('walk_duration')
  .in('session_id', sessionIds)

const avgDuration = data.reduce((sum, s) => sum + s.walk_duration, 0) / data.length
```

## Migrations

### Creating a Migration

Migrations are stored in `supabase/migrations/` directory:

```
supabase/
└── migrations/
    ├── 001_create_sessions.sql
    └── 002_subscriptions.sql
```

### Running Migrations

**Option 1: Supabase Dashboard**
1. Go to SQL Editor
2. Copy migration file contents
3. Run the SQL

**Option 2: Supabase CLI** (if installed)
```bash
supabase db push
```

## Backup and Recovery

### Manual Backup via Dashboard

1. Go to Supabase Dashboard
2. Database > Backups
3. Click "Create backup"
4. Download backup file

### Automated Backups

Supabase automatically creates daily backups (retention depends on plan):
- Free tier: 7 days
- Pro tier: 30 days
- Enterprise: Custom retention

## Performance Optimization

### Query Optimization Tips

1. **Use indexes** - Already created for common queries
2. **Select specific columns** - Don't use `SELECT *` in production
3. **Use pagination** - Limit and offset for large result sets
4. **Avoid N+1 queries** - Use joins or batch fetching

### Example Optimized Query

```typescript
// ❌ Don't fetch everything
const { data } = await supabase.from('sessions').select('*')

// ✅ Select only needed columns
const { data } = await supabase
  .from('sessions')
  .select('id, completed_at, final_reflection')
  .eq('user_id', userId)
  .range(0, 9)
```

## Data Privacy

### User Data Deletion

When a user deletes their account:
1. `ON DELETE CASCADE` automatically deletes sessions
2. Session analytics are also deleted (cascade)
3. Generated images should be deleted from storage

### GDPR Compliance

To export user data:

```typescript
// Export all user sessions
const { data: sessions } = await supabase
  .from('sessions')
  .select(`
    *,
    session_analytics (*)
  `)
  .eq('user_id', userId)

// Convert to JSON for download
const userData = JSON.stringify(sessions, null, 2)
```

## Troubleshooting

### Common Errors

**Error: "new row violates row-level security policy"**
- Ensure RLS policies are set correctly
- Check that `auth.uid()` matches the user making the request

**Error: "relation does not exist"**
- Run migrations to create tables
- Check table name spelling

**Error: "null value in column violates not-null constraint"**
- Provide all required fields (user_id, etc.)
- Check your insert/update data

### Viewing Logs

Check Supabase logs for database errors:
1. Supabase Dashboard > Logs
2. Filter by "Database" or "API"
3. Look for error messages

## Future Enhancements

- Add full-text search for sessions (PostgreSQL FTS)
- Implement data archival for old sessions
- Add materialized views for analytics
- Create stored procedures for complex operations
- Add database triggers for audit logging
