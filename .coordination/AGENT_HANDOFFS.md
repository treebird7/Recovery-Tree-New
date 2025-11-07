# Agent Handoffs - Rooting Routine

**Purpose**: Track integration points and dependencies between agents
**Last Updated**: 2025-11-06

---

## 🔄 Active Handoffs

### Handoff #1: Session History Feature

**Flow**: DB Agent → Backend Agent → Frontend Agent → QA Agent

**Current Stage**: DB complete, Backend ready to start

#### DB Agent → Backend Agent
**Status**: ✅ Complete (2025-11-06)
**Deliverable**: Query function for session history
**Location**: `lib/queries/sessions.ts`
**Interface**:
```typescript
async function getUserSessionHistory(
  userId: string,
  options: {
    type?: 'walk' | 'mining';
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<SessionHistoryItem[]>
```

**Functions Provided**:
1. `getUserSessionHistory()` - Main query with filtering/pagination
2. `getUserSessionCount()` - Get total count for pagination
3. `getSessionById()` - Fetch single session (bonus utility)

**Query Features**:
- ✅ Fetches completed sessions only (`completed_at` NOT NULL)
- ✅ Sorts by `completed_at` DESC (most recent first)
- ✅ Filters by session type ('walk' or 'mining')
- ✅ Filters by date range (startDate, endDate)
- ✅ Pagination via limit/offset
- ✅ Uses existing indexes (`idx_sessions_user_id`, `idx_sessions_completed_at`)
- ✅ Respects RLS (query runs with user context)

**Performance**:
- Indexed on user_id and completed_at (DESC)
- Limit default: 50 sessions per page
- Estimated query time: <50ms for 1000+ records

**Example Usage**:
```typescript
import { getUserSessionHistory, getUserSessionCount } from '@/lib/queries/sessions';

// Get first page of walk sessions
const sessions = await getUserSessionHistory(userId, {
  type: 'walk',
  limit: 20,
  offset: 0
});

// Get total count for pagination
const total = await getUserSessionCount(userId, { type: 'walk' });

// Get sessions in date range
const recent = await getUserSessionHistory(userId, {
  startDate: new Date('2025-11-01'),
  endDate: new Date('2025-11-06')
});
```

**Notes**:
- Currently supports 'walk' and 'mining' session types only
- Inventory sessions stored in separate `daily_inventories` table
- To include inventories, Backend will need to query both tables

**Backend Agent**: You're unblocked! See WORK_QUEUE.md Task #2

**Handoff Checklist**:
- [x] Function implemented and exported
- [x] Performance optimized with indexes
- [x] Documentation added
- [x] Example usage provided
- [x] Backend Agent notified in WORK_QUEUE.md

---

#### Backend Agent → Frontend Agent
**Status**: ⏸️ Pending
**Deliverable**: REST API endpoint
**Location**: `app/api/sessions/history/route.ts`
**Interface**:
```
GET /api/sessions/history
Query params: type, limit, offset, startDate, endDate
Response: {sessions: [...], pagination: {...}}
```

**Handoff Checklist**:
- [ ] Endpoint implemented
- [ ] Tested with Postman/curl
- [ ] Error cases handled
- [ ] Documentation in API_ROUTES.md
- [ ] Frontend Agent notified

---

#### Frontend Agent → QA Agent
**Status**: ⏸️ Pending
**Deliverable**: History page UI
**Location**: `app/history/page.tsx`
**URL**: `/history`

**Handoff Checklist**:
- [ ] Page accessible at /history
- [ ] All features implemented
- [ ] No console errors
- [ ] Mobile tested in dev tools
- [ ] QA Agent notified with test scenarios

---

#### QA Agent → Coordinator
**Status**: ⏸️ Pending
**Deliverable**: Test report
**Location**: `.coordination/test-reports/session-history.md`

**Handoff Checklist**:
- [ ] All test scenarios passed
- [ ] Edge cases verified
- [ ] Performance acceptable
- [ ] Issues logged if any
- [ ] Feature marked complete in WORK_QUEUE.md

---

## 📦 Handoff Templates

### Template: DB → Backend

**What Backend Needs from DB**:
- Function signature and location
- Expected input/output types
- Performance characteristics
- Error cases to handle
- Example usage

**Format**:
```markdown
### [Feature Name] DB Handoff

**Function**: `functionName` in `path/to/file.ts`
**Purpose**: {What it does}
**Parameters**: {List with types}
**Returns**: {Type and shape}
**Errors**: {Possible error cases}
**Example**:
```typescript
const result = await functionName(params);
```
```

---

### Template: Backend → Frontend

**What Frontend Needs from Backend**:
- API endpoint URL and method
- Request format (body, query, headers)
- Response format (success and error)
- Authentication requirements
- Rate limits or constraints

**Format**:
```markdown
### [Feature Name] API Handoff

**Endpoint**: `METHOD /api/path`
**Auth**: Required/Optional
**Request**:
```json
{request format}
```
**Response**:
```json
{response format}
```
**Errors**: {Error codes and meanings}
**Example**:
```javascript
const response = await fetch('/api/path', {options});
```
```

---

### Template: Frontend → QA

**What QA Needs from Frontend**:
- Feature URL or entry point
- Test scenarios to verify
- Known limitations
- Required setup (auth, data, etc.)
- Expected behaviors

**Format**:
```markdown
### [Feature Name] QA Handoff

**Entry Point**: URL or component path
**Test Scenarios**:
1. {Scenario description}
   - Setup: {How to set up}
   - Steps: {What to do}
   - Expected: {What should happen}

**Known Issues**: {Any known limitations}
**Setup**: {Pre-requisites for testing}
```

---

## 📋 Completed Handoffs

### Backend Agent → Frontend: User Profile API

**Status**: ✅ Complete (existed from initial commit)
**Deliverable**: User profile endpoint
**Location**: `app/api/user/profile/route.ts`

**Endpoint**: `GET /api/user/profile`
**Auth**: Required (returns 401 if not logged in)

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "user",
  "createdAt": "2025-11-01T12:00:00Z"
}
```

**Error Responses**:
- 401: Unauthorized (not logged in)
- 500: Internal server error

**Usage Example**:
```typescript
// In a React component
const response = await fetch('/api/user/profile');
if (response.ok) {
  const profile = await response.json();
  console.log(`Hello ${profile.displayName}!`);
}
```

**Notes**:
- Display name automatically extracted from email (before @ symbol)
- Falls back to "friend" if email unavailable
- Used by urge landing page to personalize greeting

**Verified**: 2025-11-06

---

## 🚨 Blocked Handoffs

**None currently**

---

## 💡 Handoff Best Practices

**For Delivering Agent**:
1. ✅ Complete your task fully before handing off
2. ✅ Test your deliverable in isolation
3. ✅ Document the interface clearly
4. ✅ Provide examples
5. ✅ Update this file with handoff details
6. ✅ Notify receiving agent in WORK_QUEUE.md
7. ✅ Be available for questions

**For Receiving Agent**:
1. ✅ Read handoff documentation before starting
2. ✅ Test the deliverable you received
3. ✅ Ask questions if interface unclear
4. ✅ Report issues immediately
5. ✅ Acknowledge receipt in WORK_QUEUE.md
6. ✅ Update handoff status when you start

**For All Agents**:
- 🔍 Verify integration points work before moving on
- 📝 Document assumptions and constraints
- 🤝 Communicate blockers early
- ✨ Keep interfaces clean and simple

---

## 🔗 Cross-Agent Dependencies

### Current Dependencies Map

```
Task #3 (DB: History Query)
    ↓
Task #2 (Backend: History API)
    ↓
Task #4 (Frontend: History UI)
    ↓
Task #7 (Frontend: History Detail)

Task #1 (DB: Inventory Migration)
    ↓
Task #8 (Frontend: Inventory History)

Task #5 (Backend: Profile API)
    ↓
{No dependencies, standalone}

Task #6 (AI: Image Generation)
    ↓
{No dependencies, fix existing}

Task #9 (Pattern Recognition)
    → DB Agent (table design)
    → Backend Agent (analysis API)
    → AI Agent (algorithm)
    → Frontend Agent (UI display)
```

---

## 📊 Integration Status

**Healthy Integrations** ✅:
- Auth system → All protected routes
- Session service → Walk/Mining features
- Coin service → Session completion
- Supabase client → All API routes

**Needs Attention** ⚠️:
- Image generation → Session completion (failing)

**Not Yet Built** 🔨:
- Session history → Dashboard
- Inventory history → Inventory complete page
- Pattern insights → Dashboard

---

**End of Handoffs Document**
