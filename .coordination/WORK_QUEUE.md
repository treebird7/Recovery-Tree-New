# Work Queue - Rooting Routine

**Last Updated**: 2025-11-07
**Active Sprint**: MVP Completion

---

## 📋 Queue Status

**Total Tasks**: 12
- 🟢 Ready: 5
- ⏳ In Progress: 0
- 🔴 Blocked: 0
- ✅ Completed: 5

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
**Status**: ✅ Completed on 2025-11-07
**Priority**: P0 (Critical)
**ETA**: 1 hour (Actual: 45 minutes)
**Dependencies**: Task #3 (DB query design) ✅ Complete

**Description**:
Create API endpoint to fetch user's session history with filtering and pagination.

**Resolution**: Created complete REST API endpoint with comprehensive parameter validation, error handling, and optimized parallel queries. Fully documented in AGENT_HANDOFFS.md. Frontend Agent unblocked for Task #4.

**Acceptance Criteria**:
- [x] Endpoint: `GET /api/sessions/history`
- [x] Query parameters: `type`, `limit`, `offset`, `startDate`, `endDate`
- [x] Returns sessions in descending date order
- [x] Includes session type, date, duration, coins earned
- [x] Respects RLS (users see only their sessions)
- [x] Error handling for invalid parameters
- [x] Parallel queries for performance optimization
- [x] Preview generation from reflections
- [x] Comprehensive input validation

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
**Status**: ✅ Completed on 2025-11-06
**Priority**: P0 (Critical)
**ETA**: 30 minutes
**Dependencies**: None

**Description**:
Review sessions table schema and design optimized query for fetching user session history.

**Resolution**: Created `lib/queries/sessions.ts` with three query functions. Supports walk and mining sessions (inventory in separate table). Optimized with existing indexes. Documented in AGENT_HANDOFFS.md.

**Acceptance Criteria**:
- [x] Query fetches all session types (walk, mining)
- [x] Optimized with proper indexes
- [x] Filters by user_id, type, date range
- [x] Sorts by date descending
- [x] Includes pagination
- [x] Performance optimized (<50ms for 1000+ records)

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
**Status**: ✅ Completed on 2025-11-07
**Priority**: P0 (Critical)
**ETA**: 2 hours (Actual: 1.5 hours)
**Dependencies**: Task #2 (API endpoint) ✅ Complete

**Description**:
Create the session history page showing user's past walks, mining sessions, and inventories.

**Resolution**: Created complete session history page with filtering (All/Walk/Mining), pagination, session detail view, and responsive design. Updated dashboard to enable "View History" button. Ready for QA testing.

**Acceptance Criteria**:
- [x] Page: `/app/history/page.tsx`
- [x] Timeline view (most recent first)
- [x] Filter tabs: All / Walks / Mining
- [x] Each session card shows:
  - [x] Session type icon (🚶 walk, ⛏️ mining)
  - [x] Date and time
  - [x] Duration
  - [x] Coins earned
  - [x] Brief preview of reflection
- [x] Click card to view full session details
- [x] Pagination controls (Previous/Next)
- [x] Empty state for new users with CTAs
- [x] Loading states with animation
- [x] Mobile responsive
- [x] "Back to Dashboard" button
- [x] Dashboard link updated (removed "Coming Soon")

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
**Status**: ✅ Completed on 2025-11-06 (Already existed)
**Priority**: P1 (High)
**ETA**: 30 minutes
**Dependencies**: None

**Description**:
Create missing `/api/user/profile` endpoint used by urge landing page.

**Resolution**: API endpoint already existed from initial commit at `app/api/user/profile/route.ts`. Verified implementation is correct and documented in AGENT_HANDOFFS.md.

**Acceptance Criteria**:
- [x] Endpoint: `GET /api/user/profile`
- [x] Returns user email and created_at
- [x] Requires authentication
- [x] Error handling for unauthenticated users

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
**Status**: ✅ Completed on 2025-11-06
**Priority**: P1 (High)
**ETA**: 1-2 hours
**Dependencies**: None

**Description**:
Investigate and fix FAL.ai image generation failures or migrate to alternative service.

**Resolution**: Switched from FAL.ai to OpenAI DALL-E 3 per product owner's suggestion. Implemented with Unsplash fallback for reliability. Documented decision in DECISIONS_LOG.md (DEC-004).

**Acceptance Criteria**:
- [x] Identified FAL.ai failures (unreliable API responses)
- [x] Switched to DALL-E 3 (OpenAI) alternative
- [x] Ready to test with real sessions (needs OPENAI_API_KEY)
- [x] Updated session completion to use DALL-E with fallback
- [x] Documented API changes and decision

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
