# Agent Status Coordination System

A simple system for Claude Code agents on different branches to share their current status and avoid conflicts.

## Why This Exists

When working with multiple Claude Code agents in parallel branches, they need to know:
- What are other agents working on?
- Is anyone blocked?
- What's the current status of each branch?

**Problem**: Git files don't work across branches
**Solution**: Shared Supabase table that all agents can read/write

## How It Works

1. Each agent registers itself with a unique session ID
2. Agents update their status: `idle`, `working`, `blocked`, `completed`
3. Any agent can query what others are doing
4. Works from Claude Code Web, VSCode, and Terminal

## Setup

### 1. Run the migration

```bash
# Apply to your Supabase database
# Copy contents of supabase/migrations/011_agent_status.sql
# and run in Supabase SQL Editor
```

Or use Supabase CLI:
```bash
supabase db push
```

### 2. Make sure .env.local has Supabase credentials

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-service-key
```

## Usage Examples

### From Claude Code (TypeScript/Node)

```typescript
import { createAgentStatusClient } from '@/lib/agent-status';

// Create client (auto-detects from env)
const agent = createAgentStatusClient({
  sessionId: 'claude-web-session-123',
  branchName: 'feature/auth',
  agentType: 'claude-code-web'
});

if (!agent) {
  console.error('Could not create agent status client');
  return;
}

// Update your status
await agent.updateStatus('working', 'Implementing user authentication');

// Check what others are doing
const others = await agent.getOtherAgents();
console.log('Other agents:', others);

// Check agents on your branch
const onMyBranch = await agent.getAgentsOnBranch('feature/auth');

// Mark blocked
await agent.markBlocked('Waiting for API endpoint to be ready');

// Mark complete
await agent.markComplete();

// Clean up when done
await agent.cleanup();
```

### From Terminal/CLI

```bash
# Update status
node scripts/agent-status-cli.js update "Fixing auth bug" working

# List all active agents
node scripts/agent-status-cli.js list

# See agents on specific branch
node scripts/agent-status-cli.js branch main

# Mark complete
node scripts/agent-status-cli.js complete

# Mark blocked
node scripts/agent-status-cli.js blocked "Need database migration"

# Clean up
node scripts/agent-status-cli.js cleanup
```

### Quick alias (add to ~/.bashrc or ~/.zshrc)

```bash
alias agents='node scripts/agent-status-cli.js'
```

Then:
```bash
agents update "Working on feature X" working
agents list
agents complete
```

### From VSCode Extension / Claude Code Desktop

Same as TypeScript example above. The library works anywhere with Node.js.

## Database Schema

```sql
Table: agent_status
- id: UUID (primary key)
- session_id: TEXT (unique) - your agent's ID
- branch_name: TEXT - current git branch
- agent_type: TEXT - "claude-code-web", "vscode", "terminal"
- current_task: TEXT - what you're working on
- status: TEXT - "idle", "working", "blocked", "completed"
- details: JSONB - flexible metadata
- last_updated: TIMESTAMPTZ - auto-updated on change
- created_at: TIMESTAMPTZ

View: active_agents
- Shows only agents updated in last 10 minutes
- Includes seconds_since_update field
```

## Workflow Example

**Agent 1 (Claude Code Web, branch: feature/auth)**
```typescript
await agent.updateStatus('working', 'Implementing login endpoint');
```

**Agent 2 (Terminal, branch: feature/ui)**
```bash
$ agents list

🤖 Active Agents:

  1. [claude-code-web] feature/auth
   Status: working
   Task: Implementing login endpoint
   Updated: 23s ago

👉 2. [terminal] feature/ui
   Status: working
   Task: Building dashboard UI
   Updated: 2s ago
   (This is you)
```

**Agent 2 sees Agent 1 is working on auth, so avoids conflicts**

## Best Practices

1. **Update at start**: Call `updateStatus()` when starting work
2. **Update on changes**: Update when switching tasks
3. **Check before major changes**: List agents to see what's happening
4. **Clean up**: Call `cleanup()` when done (or let it auto-expire after 10min)
5. **Use descriptive tasks**: "Fixing auth bug in login.ts" not just "fixing bug"

## Auto-cleanup

Agents not updated in 10 minutes are automatically hidden from `active_agents` view (but stay in table for history).

## Troubleshooting

**"Supabase credentials not found"**
- Make sure `.env.local` has the required env vars
- For terminal, run from project root where `.env.local` exists

**"Table doesn't exist"**
- Run the migration: `supabase/migrations/011_agent_status.sql`

**"Can't see other agents"**
- They might be on different branches - use `list` to see all
- They might have timed out (>10 min) - check database directly

## Advanced: Direct SQL

```sql
-- See all agents (including timed out)
SELECT * FROM agent_status ORDER BY last_updated DESC;

-- See only active
SELECT * FROM active_agents;

-- Clean up old sessions
DELETE FROM agent_status WHERE last_updated < NOW() - INTERVAL '1 hour';

-- See branch activity
SELECT branch_name, COUNT(*) as agent_count
FROM active_agents
GROUP BY branch_name;
```

## Future Enhancements

- Real-time subscriptions (Supabase Realtime)
- Conflict detection (multiple agents on same file)
- Automatic status updates via git hooks
- Web dashboard to visualize all agents
- Integration with Notion webhook for visibility
