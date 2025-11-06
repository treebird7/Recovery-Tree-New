# Work Queue - Rooting Routine

**Last Updated**: 2025-11-06
**Active Sprint**: MVP Completion

---

## 📋 Queue Status

**Total Tasks**: 12
- 🟢 Ready: 4
- ⏳ In Progress: 0
- 🔴 Blocked: 0
- ✅ Completed: 0

---

## 🚀 High Priority - Launch Blockers

### Task #1: Apply Inventory Database Migration
**Agent**: DB Agent
**Status**: 🟢 Ready
**Priority**: P0 (Critical)
**ETA**: 10 minutes
**Dependencies**: None

**Description**:
Apply the existing migration file `supabase/migrations/005_daily_inventory.sql` to enable the daily inventory feature.

**Acceptance Criteria**:
- [ ] Migration applied to Supabase database
- [ ] `daily_inventories` table exists
- [ ] RLS policies active
- [ ] Test with sample inventory submission
- [ ] Update STATUS.md to remove warning

**Files Involved**:
- `supabase/migrations/005_daily_inventory.sql`

**Notes**:
- Migration file already exists, just needs application
- See DATABASE_SETUP.md for instructions

---

### Task #2: Build Session History API
**Agent**: Backend Agent
**Status**: 🔴 Blocked by Task #3
**Priority**: P0 (Critical)
**ETA**: 1 hour
**Dependencies**: Task #3 (DB query design)

**Description**:
Create API endpoint to fetch user's session history with filtering and pagination.

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/sessions/history`
- [ ] Query parameters: `type`, `limit`, `offset`, `startDate`, `endDate`
- [ ] Returns sessions in descending date order
- [ ] Includes session type, date, duration, coins earned
- [ ] Respects RLS (users see only their sessions)
- [ ] Error handling for invalid parameters

**API Response Schema**:
```json
{
  "sessions": [
    {
      "id": "uuid",
      "session_type": "walk|mining|inventory",
      "started_at": "timestamp",
      "completed_at": "timestamp",
      "duration_minutes": 45,
      "coins_earned": 45,
      "preview": "Brief reflection preview..."
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

**Files to Create**:
- `app/api/sessions/history/route.ts`

**Files to Reference**:
- `lib/services/session.ts` (existing session logic)
- `app/api/session/start/route.ts` (example API pattern)

---

### Task #3: Design History Query (DB)
**Agent**: DB Agent
**Status**: 🟢 Ready
**Priority**: P0 (Critical)
**ETA**: 30 minutes
**Dependencies**: None

**Description**:
Review sessions table schema and design optimized query for fetching user session history.

**Acceptance Criteria**:
- [ ] Query fetches all session types (walk, mining, inventory)
- [ ] Optimized with proper indexes
- [ ] Filters by user_id, type, date range
- [ ] Sorts by date descending
- [ ] Includes pagination
- [ ] Performance tested with 100+ records

**Deliverable**:
Create function in `lib/queries/sessions.ts` with signature:
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

**Files to Create**:
- `lib/queries/sessions.ts`

**Files to Reference**:
- `lib/services/session.ts`
- `supabase/migrations/003_sessions.sql`

---

### Task #4: Build Session History UI
**Agent**: Frontend Agent
**Status**: 🔴 Blocked by Task #2
**Priority**: P0 (Critical)
**ETA**: 2 hours
**Dependencies**: Task #2 (API endpoint)

**Description**:
Create the session history page showing user's past walks, mining sessions, and inventories.

**Acceptance Criteria**:
- [ ] Page: `/app/history/page.tsx`
- [ ] Timeline view (most recent first)
- [ ] Filter tabs: All / Walks / Mining / Inventories
- [ ] Each session card shows:
  - Session type icon
  - Date and time
  - Duration
  - Coins earned
  - Brief preview of reflection
- [ ] Click card to view full session details
- [ ] Infinite scroll or pagination
- [ ] Empty state for new users
- [ ] Loading states
- [ ] Mobile responsive
- [ ] "Back to Dashboard" button

**Design Notes**:
- Use Tailwind for styling (consistent with app)
- Card layout similar to SessionComplete component
- Icons: 🚶 (walk), 💎 (mining), 📝 (inventory)

**Files to Create**:
- `app/history/page.tsx`
- `components/history/SessionCard.tsx`
- `components/history/SessionFilters.tsx`

**Files to Reference**:
- `components/walk/SessionComplete.tsx` (card design)
- `app/dashboard/page.tsx` (layout pattern)

---

## 🔧 Medium Priority - Bug Fixes

### Task #5: Create User Profile API
**Agent**: Backend Agent
**Status**: 🟢 Ready
**Priority**: P1 (High)
**ETA**: 30 minutes
**Dependencies**: None

**Description**:
Create missing `/api/user/profile` endpoint used by urge landing page.

**Acceptance Criteria**:
- [ ] Endpoint: `GET /api/user/profile`
- [ ] Returns user email and created_at
- [ ] Requires authentication
- [ ] Error handling for unauthenticated users

**API Response**:
```json
{
  "email": "user@example.com",
  "created_at": "2025-11-01T12:00:00Z"
}
```

**Files to Create**:
- `app/api/user/profile/route.ts`

**Files to Reference**:
- `app/api/session/start/route.ts` (auth pattern)

---

### Task #6: Debug Image Generation
**Agent**: AI Agent
**Status**: 🟢 Ready
**Priority**: P1 (High)
**ETA**: 1-2 hours
**Dependencies**: None

**Description**:
Investigate and fix FAL.ai image generation failures or migrate to alternative service.

**Acceptance Criteria**:
- [ ] Identify root cause of FAL.ai failures
- [ ] Either: Fix FAL.ai integration OR switch to alternative
- [ ] Test image generation with real sessions
- [ ] Update session completion to show images
- [ ] Document any API changes

**Investigation Areas**:
- FAL.ai API key validity
- Request format
- Response parsing
- Error handling

**Alternative Options**:
- Unsplash only (currently working)
- DALL-E 3 via OpenAI
- Stability AI

**Files to Review**:
- `lib/services/fal-ai.ts`
- `app/api/session/complete/route.ts`

---

## 📊 Lower Priority - Enhancements

### Task #7: Session History Detail View
**Agent**: Frontend Agent
**Status**: 🔴 Blocked by Task #4
**Priority**: P2 (Medium)
**ETA**: 1 hour
**Dependencies**: Task #4 (History page)

**Description**:
Create detail page for viewing full session content.

**Acceptance Criteria**:
- [ ] Page: `/app/history/[sessionId]/page.tsx`
- [ ] Shows full session details:
  - All questions and answers
  - Full reflection
  - Generated image
  - Insights
  - Timestamps
  - Coins earned
- [ ] "Back to History" button
- [ ] Mobile responsive

**Files to Create**:
- `app/history/[sessionId]/page.tsx`

---

### Task #8: Inventory History Page
**Agent**: Frontend Agent
**Status**: 🔴 Blocked by Task #1
**Priority**: P2 (Medium)
**ETA**: 1.5 hours
**Dependencies**: Task #1 (Migration)

**Description**:
Create dedicated page for viewing past daily inventories.

**Acceptance Criteria**:
- [ ] Page: `/app/inventory/history/page.tsx`
- [ ] Calendar view showing days with inventories
- [ ] List view of past inventories
- [ ] Click to view full inventory
- [ ] Streak visualization
- [ ] Empty state for new users

**Files to Create**:
- `app/inventory/history/page.tsx`
- `components/inventory/InventoryCalendar.tsx`
- `components/inventory/InventoryListItem.tsx`

---

### Task #9: Pattern Recognition (Urge Tracking)
**Agent**: AI Agent + Backend Agent
**Status**: 🟢 Ready
**Priority**: P3 (Low)
**ETA**: 3-4 hours
**Dependencies**: None

**Description**:
Build pattern recognition system to identify when urges commonly occur.

**Acceptance Criteria**:
- [ ] Analyze mining sessions by day/time
- [ ] Identify patterns (e.g., "Most urges on Friday 10-11pm")
- [ ] Generate insights
- [ ] Store patterns in database
- [ ] Create API to fetch user patterns

**Implementation Plan**:
1. **DB Agent**: Create `urge_patterns` table
2. **Backend Agent**: Build analysis endpoint
3. **AI Agent**: Design pattern recognition algorithm
4. **Frontend Agent**: Display insights on dashboard

**Files to Create**:
- `supabase/migrations/006_urge_patterns.sql`
- `app/api/patterns/analyze/route.ts`
- `lib/services/pattern-recognition.ts`

---

### Task #10: Progress Tracker Detail Page
**Agent**: Frontend Agent
**Status**: 🟢 Ready
**Priority**: P3 (Low)
**ETA**: 2-3 hours
**Dependencies**: None

**Description**:
Replace "Coming Soon" placeholder on dashboard with actual progress tracker.

**Acceptance Criteria**:
- [ ] Page: `/app/progress/page.tsx`
- [ ] Show timeline of user's journey
- [ ] Milestones reached (first walk, 10 walks, etc.)
- [ ] Charts: walks over time, coins over time
- [ ] Streak tracking
- [ ] Growth visualization

**Files to Create**:
- `app/progress/page.tsx`
- `components/progress/Timeline.tsx`
- `components/progress/MilestoneCard.tsx`
- `components/progress/ProgressChart.tsx`

---

## ✅ Recently Completed

*No completed tasks yet - queue just initialized*

---

## 🔄 Task Handoff Log

**Task → Agent Assignments**:
- Waiting for initial assignments

**Completed Handoffs**:
- None yet

---

## 📝 Notes for Agents

**Task Selection Guidelines**:
1. Check your agent type (Frontend, Backend, DB, AI, QA)
2. Find tasks marked for your type
3. Verify status is 🟢 Ready (not blocked)
4. Read full task description
5. Check files to reference
6. Mark task as ⏳ In Progress when starting
7. Update this file when complete

**Updating Task Status**:
```markdown
**Status**: ⏳ In Progress → {Your GitHub username}
```

**Marking Complete**:
```markdown
**Status**: ✅ Completed on 2025-11-06 by {Agent}
```

**Reporting Blockers**:
```markdown
**Status**: 🔴 Blocked
**Blocker**: {Description of what's blocking}
**Needs**: {What's needed to unblock}
```

---

**End of Work Queue**
