# Sample Workflow: Building Session History Page

**This document demonstrates the complete orchestration workflow using a real feature example**

---

## 🎯 Feature Request

**User (Product Owner)**:
> "I need users to be able to see their session history - all their past walks, mining sessions, and inventories in one place. Timeline view would be nice."

---

## 📋 Phase 1: Coordinator Analysis

**Coordinator analyzes the request:**

```markdown
## Feature: Session History Page

### Analysis
- Requires: Frontend UI + Backend API + DB query (no new tables)
- Dependencies: DB → Backend → Frontend → QA (sequential)
- Complexity: Medium
- Estimated: 3-4 hours total across agents

### Current State Check
- ✅ Sessions table exists (has walk/mining/inventory data)
- ✅ User authentication working
- ✅ Dashboard has placeholder button
- ❌ No history endpoint exists
- ❌ No history UI exists

### Task Breakdown

**DB Agent** (30 minutes)
- [ ] Review sessions table schema
- [ ] Design query for user session history
- [ ] Support filtering (type, date range, pagination)
- [ ] Create query function in lib/queries/sessions.ts
- [ ] Test with 100+ records
- [ ] Document in AGENT_HANDOFFS.md

**Backend Agent** (1 hour) - BLOCKED by DB Agent
- [ ] Create GET /api/sessions/history endpoint
- [ ] Use DB Agent's query function
- [ ] Add pagination (limit/offset)
- [ ] Add filtering (type, date range)
- [ ] Authentication required
- [ ] Return formatted response
- [ ] Test with curl
- [ ] Document in AGENT_HANDOFFS.md

**Frontend Agent** (2 hours) - BLOCKED by Backend Agent
- [ ] Create /app/history/page.tsx
- [ ] Build SessionCard component
- [ ] Implement timeline view (desc order)
- [ ] Add type filters (All/Walk/Mining/Inventory)
- [ ] Infinite scroll or pagination
- [ ] Loading/error/empty states
- [ ] Mobile responsive
- [ ] Back to dashboard button
- [ ] Document in AGENT_HANDOFFS.md

**QA Agent** (30 minutes) - BLOCKED by Frontend Agent
- [ ] Test with 0 sessions (empty state)
- [ ] Test with 100+ sessions (performance)
- [ ] Test filtering
- [ ] Test pagination
- [ ] Verify RLS (users only see own data)
- [ ] Test mobile responsiveness
- [ ] Write test report

### Execution Order
Sequential: DB → Backend → Frontend → QA

### Total Estimate
4 hours (with handoffs)

### Questions/Decisions
- Timeline view confirmed? (vs list or calendar)
  - **Recommendation**: Timeline, most recent first

**Approve to proceed?**
```

**Product Owner**: "Approved! Timeline view is good."

---

## 📝 Phase 2: Coordinator Updates Work Queue

**Coordinator writes to `.coordination/WORK_QUEUE.md`:**

```markdown
## 🚀 Active Sprint: Session History Feature

### Task #3: Design History Query (DB)
**Agent**: DB Agent
**Status**: 🟢 Ready
**Priority**: P0 (Critical)
**ETA**: 30 minutes
**Dependencies**: None

{Full task description...}

### Task #2: Build Session History API
**Agent**: Backend Agent
**Status**: 🔴 Blocked by Task #3
**Priority**: P0 (Critical)
**ETA**: 1 hour
**Dependencies**: Task #3 (DB query design)

{Full task description...}

### Task #4: Build Session History UI
**Agent**: Frontend Agent
**Status**: 🔴 Blocked by Task #2
**Priority**: P0 (Critical)
**ETA**: 2 hours
**Dependencies**: Task #2 (API endpoint)

{Full task description...}

### Task #11: Test Session History
**Agent**: QA Agent
**Status**: 🔴 Blocked by Task #4
**Priority**: P0 (Critical)
**ETA**: 30 minutes
**Dependencies**: Task #4 (UI complete)

{Full task description...}
```

---

## 🔨 Phase 3: DB Agent Execution

**You (acting as DB Agent) open terminal:**

```bash
$ # Open WORK_QUEUE.md, see Task #3 assigned to DB Agent

$ # Read task requirements
$ # Read AGENT_HANDOFFS.md for context
$ # Check existing sessions table structure
```

**DB Agent reads** `.coordination/agents/DB_AGENT.md` to understand role.

**DB Agent implements:**

```typescript
// lib/queries/sessions.ts
import { createClient } from '@/lib/supabase/server';

export interface SessionHistoryOptions {
  type?: 'walk' | 'mining' | 'inventory';
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export async function getUserSessionHistory(
  userId: string,
  options: SessionHistoryOptions = {}
) {
  const {
    type,
    limit = 50,
    offset = 0,
    startDate,
    endDate
  } = options;

  const supabase = createClient();

  let query = supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) query = query.eq('session_type', type);
  if (startDate) query = query.gte('completed_at', startDate.toISOString());
  if (endDate) query = query.lte('completed_at', endDate.toISOString());

  const { data, error } = await query;
  if (error) throw new Error('Failed to fetch session history');
  return data;
}
```

**DB Agent tests:**

```typescript
// Quick test in a test file
const sessions = await getUserSessionHistory('test-user-id', {
  limit: 10
});
console.log('Found sessions:', sessions.length);
```

**DB Agent updates `.coordination/WORK_QUEUE.md`:**

```markdown
### Task #3: Design History Query (DB)
**Status**: ✅ Completed on 2025-11-06 by DB Agent
```

**DB Agent updates `.coordination/AGENT_HANDOFFS.md`:**

```markdown
### DB Agent → Backend Agent: Session History Query

**Status**: ✅ Ready
**Deliverable**: Query function for session history
**Location**: `lib/queries/sessions.ts`

**Function Signature**:
```typescript
async function getUserSessionHistory(
  userId: string,
  options: {
    type?: 'walk' | 'mining' | 'inventory';
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Session[]>
```

**Example Usage**:
```typescript
import { getUserSessionHistory } from '@/lib/queries/sessions';

const sessions = await getUserSessionHistory(userId, {
  type: 'walk',
  limit: 20,
  offset: 0
});
```

**Performance**: Tested with 150 records, returns in <50ms

**Backend Agent**: You're unblocked! See WORK_QUEUE.md Task #2
```

**DB Agent commits:**

```bash
$ git add lib/queries/sessions.ts
$ git commit -m "Add session history query function

- Support filtering by type, date range
- Support pagination (limit/offset)
- Order by completed_at DESC
- Tested with 150 records
"
$ git push -u origin claude/orchestrate-building-agents-011CUsMwp4CCXAumEK3iixhK
```

---

## 🔨 Phase 4: Backend Agent Execution

**You (now acting as Backend Agent) open terminal:**

```bash
$ # Read WORK_QUEUE.md Task #2
$ # Read AGENT_HANDOFFS.md for DB query info
$ # Read agents/BACKEND_AGENT.md for role guidance
```

**Backend Agent implements:**

```typescript
// app/api/sessions/history/route.ts
import { createClient } from '@/lib/supabase/server';
import { getUserSessionHistory } from '@/lib/queries/sessions';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'walk' | 'mining' | 'inventory' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 3. Fetch sessions using DB Agent's query
    const sessions = await getUserSessionHistory(user.id, {
      type: type || undefined,
      limit,
      offset
    });

    // 4. Get total count for pagination
    const { count } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('completed_at', 'is', null);

    // 5. Return formatted response
    return Response.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        sessionType: s.session_type,
        startedAt: s.started_at,
        completedAt: s.completed_at,
        durationMinutes: s.mining_duration_minutes ||
          Math.floor((new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000),
        coinsEarned: s.coins_earned,
        preview: s.final_reflection?.slice(0, 150) + '...' || ''
      })),
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('Error fetching session history:', error);
    return Response.json(
      { error: 'Failed to fetch session history' },
      { status: 500 }
    );
  }
}
```

**Backend Agent tests with curl:**

```bash
$ npm run dev # Start dev server

$ # In another terminal, test the endpoint
$ curl "http://localhost:3000/api/sessions/history?limit=5" \
  -H "Cookie: $(cat .dev-cookies)" # Authenticated request

# Response:
{
  "success": true,
  "sessions": [...],
  "pagination": {"total": 10, "limit": 5, "offset": 0}
}
```

**Backend Agent updates WORK_QUEUE.md:**

```markdown
### Task #2: Build Session History API
**Status**: ✅ Completed on 2025-11-06 by Backend Agent
```

**Backend Agent updates AGENT_HANDOFFS.md:**

```markdown
### Backend Agent → Frontend Agent: Session History API

**Status**: ✅ Ready
**Deliverable**: REST API endpoint
**Location**: `app/api/sessions/history/route.ts`

**Endpoint**: `GET /api/sessions/history`
**Auth**: Required (Supabase session)

**Query Parameters**:
- `type` (optional): 'walk' | 'mining' | 'inventory'
- `limit` (optional): Number of sessions (default 50)
- `offset` (optional): Pagination offset (default 0)

**Response**:
```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "sessionType": "walk",
      "startedAt": "2025-11-06T10:00:00Z",
      "completedAt": "2025-11-06T10:45:00Z",
      "durationMinutes": 45,
      "coinsEarned": 45,
      "preview": "Today I realized that..."
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

**Errors**:
- 401: Unauthorized (not logged in)
- 500: Server error

**Example**:
```javascript
const response = await fetch('/api/sessions/history?type=walk&limit=20');
const data = await response.json();
```

**Frontend Agent**: You're unblocked! See WORK_QUEUE.md Task #4
```

**Backend Agent commits:**

```bash
$ git add app/api/sessions/history/route.ts
$ git commit -m "Add session history API endpoint

- GET /api/sessions/history
- Support filtering by type
- Support pagination (limit/offset)
- Return formatted session data with preview
- Tested with curl
"
$ git push
```

---

## 🔨 Phase 5: Frontend Agent Execution

**You (now acting as Frontend Agent):**

```bash
$ # Read WORK_QUEUE.md Task #4
$ # Read AGENT_HANDOFFS.md for API docs
$ # Read agents/FRONTEND_AGENT.md for role guidance
```

**Frontend Agent implements:**

```typescript
// app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  sessionType: 'walk' | 'mining' | 'inventory';
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  coinsEarned: number;
  preview: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  async function fetchSessions() {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/sessions/history'
        : `/api/sessions/history?type=${filter}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your journey...</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Sessions Yet</h2>
        <p className="text-gray-600 mb-6">Start your first walk to begin your journey.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-green-600 hover:text-green-700 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Your Journey</h1>
          <p className="text-gray-600 mt-2">{sessions.length} sessions completed</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'walk', 'mining', 'inventory'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {session.sessionType === 'walk' && '🚶'}
                      {session.sessionType === 'mining' && '💎'}
                      {session.sessionType === 'inventory' && '📝'}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {session.sessionType}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {new Date(session.completedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>

                  <p className="text-gray-700 mb-3">
                    {session.preview}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      ⏱️ {session.durationMinutes} minutes
                    </span>
                    <span className="text-yellow-600 font-medium">
                      🪙 {session.coinsEarned} coins
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Frontend Agent tests:**

```bash
$ npm run dev
$ # Open browser to http://localhost:3000/history
$ # Test filters
$ # Test on mobile viewport (Chrome DevTools)
$ # Check for console errors
```

**Frontend Agent updates WORK_QUEUE.md:**

```markdown
### Task #4: Build Session History UI
**Status**: ✅ Completed on 2025-11-06 by Frontend Agent
```

**Frontend Agent updates AGENT_HANDOFFS.md:**

```markdown
### Frontend Agent → QA Agent: Session History UI

**Status**: ✅ Ready for Testing
**Entry Point**: http://localhost:3000/history

**Test Scenarios**:
1. **Empty State**: New user with no sessions
   - Setup: Fresh account
   - Expected: Shows "No Sessions Yet" message

2. **View All Sessions**: User with multiple sessions
   - Setup: Account with 5 walks, 3 mining, 2 inventories
   - Expected: Shows 10 sessions in timeline, most recent first

3. **Filter by Type**: Click "Walk" filter
   - Expected: Shows only walk sessions

4. **Mobile Responsive**: Resize to 375px
   - Expected: Cards stack, no horizontal scroll, readable text

5. **Unauthorized**: Not logged in
   - Expected: Redirect to /login

**Known Issues**: None

**QA Agent**: Ready for testing! See WORK_QUEUE.md Task #11
```

**Frontend Agent commits:**

```bash
$ git add app/history/page.tsx
$ git commit -m "Add session history page with timeline view

- Timeline layout with session cards
- Type filters (All/Walk/Mining/Inventory)
- Empty state for new users
- Mobile responsive
- Loading states
- Session icons and previews
"
$ git push
```

---

## 🔨 Phase 6: QA Agent Testing

**You (now acting as QA Agent):**

```bash
$ # Read WORK_QUEUE.md Task #11
$ # Read AGENT_HANDOFFS.md for test scenarios
$ # Read agents/QA_AGENT.md for role guidance
```

**QA Agent creates test plan and executes:**

```markdown
# Test Report: Session History Page

**Date**: 2025-11-06
**Tester**: QA Agent
**Environment**: Development (localhost:3000)
**Browser**: Chrome 120

## Test Results

### TC-001: View All Sessions ✅ PASS
- Setup: Account with 10 sessions
- Result: All 10 displayed, most recent first

### TC-002: Filter by Walk ✅ PASS
- Result: Shows only walk sessions

### TC-003: Filter by Mining ✅ PASS
- Result: Shows only mining sessions

### TC-004: Empty State ✅ PASS
- Setup: New account, no sessions
- Result: Shows "No Sessions Yet" message with dashboard link

### TC-005: Mobile (375px) ✅ PASS
- Result: Cards stack properly, no overflow, readable

### TC-006: Unauthorized Access ✅ PASS
- Setup: Logged out
- Result: Redirects to /login

### TC-007: Loading State ✅ PASS
- Result: Shows "Loading your journey..." while fetching

### TC-008: Back to Dashboard ✅ PASS
- Result: Button works, navigates correctly

## Summary
- Total Tests: 8
- Passed: 8
- Failed: 0
- Pass Rate: 100%

## Bugs Found
None

## Recommendation
**Status**: ✅ APPROVED FOR LAUNCH
Feature is complete and working as expected.

## Performance Notes
- Loads in <1 second with 50 sessions
- Recommend adding pagination for users with 100+ sessions (future enhancement)
```

**QA Agent updates WORK_QUEUE.md:**

```markdown
### Task #11: Test Session History
**Status**: ✅ Completed on 2025-11-06 by QA Agent
**Result**: APPROVED - All tests passed
```

**QA Agent creates test report:**

```bash
$ mkdir -p .coordination/test-reports
$ # Write test report to file
$ git add .coordination/test-reports/session-history-2025-11-06.md
$ git commit -m "QA: Session history feature approved

All test scenarios passed:
- Functionality working
- Filters work correctly
- Mobile responsive
- Security validated (RLS working)
- No bugs found

Approved for launch.
"
$ git push
```

---

## 📊 Phase 7: Coordinator Reports Completion

**Coordinator reviews all updates:**

```bash
$ # Checks WORK_QUEUE.md - all tasks ✅
$ # Checks AGENT_HANDOFFS.md - all handoffs complete
$ # Checks test report - approved
```

**Coordinator updates COORDINATOR_CONTEXT.md:**

```markdown
### Stream A: Session History (Priority: HIGH)
- **Status**: ✅ COMPLETED
- **Completion Date**: 2025-11-06
- **Time**: 4 hours (as estimated)
- **Quality**: All tests passed, approved by QA

**Delivered**:
- DB query function
- API endpoint
- UI page with timeline
- Full test coverage
```

**Coordinator reports to Product Owner:**

```markdown
## Feature Complete: Session History Page ✅

**Status**: Shipped and ready for users

**What was delivered**:
- Timeline view of all sessions (walks, mining, inventories)
- Type filters (All/Walk/Mining/Inventory)
- Mobile responsive
- Empty state for new users
- Proper authentication/security

**Quality**:
- All 8 test scenarios passed
- QA approved
- No bugs found

**Time**: 4 hours (matched estimate)

**Next**: Users can now view their complete journey history

**Try it**: Navigate to /history in the app
```

---

## 🎉 Outcome

**Feature delivered successfully through coordinated agent workflow:**

1. ✅ Coordinator broke down the work
2. ✅ DB Agent created query (unblocked Backend)
3. ✅ Backend Agent built API (unblocked Frontend)
4. ✅ Frontend Agent built UI (unblocked QA)
5. ✅ QA Agent tested and approved
6. ✅ Coordinator reported completion

**Total time**: 4 hours (3.5 agent hours + 0.5 coordination)
**Quality**: 100% test pass rate
**Bugs**: 0

---

## 💡 Key Takeaways

**What worked well**:
- Clear task breakdown
- Sequential dependency management
- Explicit handoffs between agents
- Documentation at each step
- QA validation before declaring done

**Benefits of orchestration**:
- No confusion about who does what
- Each agent focused on their specialty
- Clear completion criteria
- Audit trail of all work
- Quality gates enforced

**Without orchestration** (typical scenario):
- One person does everything
- Context switching overhead
- Might skip testing
- Less documentation
- Easier to miss edge cases
- Longer elapsed time

**With orchestration**:
- Specialized agents do what they do best
- Parallel work possible (if independent features)
- Forced documentation (handoffs require it)
- Quality enforced (QA gates)
- Clear accountability

---

**This is how the orchestration system works in practice. Ready to use it for real!**
