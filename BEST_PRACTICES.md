# 🌟 Recovery Tree: Best Practices & Brilliant Innovations

**What Worked Brilliantly & Should Be Replicated**

*Last Updated: November 15, 2025*

---

## 📖 About This Document

This is our collection of practices, patterns, and workflows that **actually worked** in building Recovery Tree. These are the things that saved time, prevented bugs, improved collaboration, and made development more effective.

**Use this for:**
- Future projects and features
- Onboarding new developers
- Setting up similar AI-assisted projects
- Learning what patterns to replicate

---

## 🎯 Core Innovations That Made This Project Work

### 1. The FUCKBOARD Pattern

**What It Is:** Living documentation of mistakes, bugs, and lessons learned

**Why It's Brilliant:**
- Prevents repeating the same mistakes
- Provides searchable solutions to common errors
- Honest, memorable documentation (not corporate BS)
- Shows pattern recognition across multiple bugs
- Reduces debugging time from hours to minutes

**How To Implement:**
1. Create `FUCKBOARD.md` in project root
2. Document every non-trivial bug with:
   - What happened (honestly)
   - Why it was wrong
   - How it was fixed (code examples)
   - Lesson learned
   - Time wasted ("Stupid Tax")
3. **Update it IMMEDIATELY** after fixing bugs
4. **READ IT BEFORE** starting new features
5. Reference it in code reviews

**Key Insight:** The FUCKBOARD only works if you actually consult it. We documented the module-level client issue 3 times before learning!

**ROI:** Immeasurable - prevented production disasters, reduced repeat mistakes

---

### 2. Agent Coordination System (Multi-Agent Workflow)

**What It Is:** Supabase-based status sharing between Claude Code agents working on different branches

**Why It's Brilliant:**
- Multiple agents can work in parallel without conflicts
- Real-time visibility into what each agent is doing
- Prevents duplicate work and merge conflicts
- Works across Claude Code Web, VSCode, and Terminal
- Simple implementation (<200 lines of code)

**How To Implement:**
```sql
-- Create agent_status table in Supabase
CREATE TABLE agent_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  branch_name TEXT,
  agent_type TEXT,
  current_task TEXT,
  status TEXT, -- idle, working, blocked, completed
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE VIEW active_agents AS
  SELECT *, EXTRACT(EPOCH FROM (NOW() - last_updated)) as seconds_since_update
  FROM agent_status
  WHERE last_updated > NOW() - INTERVAL '10 minutes';
```

**Library Pattern:**
```typescript
// lib/agent-status/client.ts
export function createAgentStatusClient(config: {
  sessionId: string;
  branchName: string;
  agentType: string;
}) {
  return {
    updateStatus: async (status, task) => { /* update DB */ },
    getOtherAgents: async () => { /* query active_agents */ },
    markBlocked: async (reason) => { /* update with blocked status */ },
    cleanup: async () => { /* remove from active */ }
  };
}
```

**CLI Wrapper:**
```bash
node scripts/agent-status-cli.js update "Working on auth" working
node scripts/agent-status-cli.js list
```

**Best Practices:**
- Update status when starting work
- Check other agents before major changes
- Clean up when done (or auto-expire after 10min)
- Use descriptive task names

**ROI:** Saved hours of merge conflicts, enabled true parallel development

---

### 3. Cross-Session Memory System Design

**What It Is:** Two-tier memory architecture for AI conversations (Persistent Profile + Recent Session Summaries)

**Why It's Brilliant:**
- Users don't repeat themselves every session
- Therapeutic continuity without creepy surveillance
- Privacy-first with user control
- Token-efficient (under 600 tokens per injection)
- Supports both AI conversations and human supervision

**Architecture Pattern:**
```
user_context table (persistent profile)
  ├── Recovery identity (addiction type, current step)
  ├── Support system (sponsor, fellowship)
  ├── Zone definitions (red/yellow/green behaviors)
  └── Patterns & triggers

session_summaries table (recent context)
  ├── Last 3 sessions only
  ├── Urge intensity, triggers, outcomes
  ├── Key insights and emotional journey
  └── Follow-up needed for next session

analytics_aggregate table (weekly batch)
  └── Pattern analysis for supervision/insights
```

**LLM Extraction Pattern:**
```typescript
// After session completion
const extraction = await llm.extract({
  prompt: extractionPrompt,
  sessionTranscript: fullTranscript
});

// Update only changed fields
await upsertUserContext(userId, extraction.profile_updates);
await insertSessionSummary(userId, sessionId, extraction.session_summary);
```

**Privacy Controls:**
- User can view all stored context
- User can edit/correct any field
- User can delete all context ("fresh start")
- User can export data (for sponsor/therapist)

**Best Practices:**
- Keep context injection under 600 tokens
- Extract session data AFTER completion, not during
- Error handling: log failures but don't block session
- User control: always provide view/edit/delete options

**ROI:** Better user experience, therapeutic continuity, privacy compliance

---

### 4. Elder Tree Communication Style Guide

**What It Is:** Sandy B. sponsor model - direct, compassionate, no BS

**Why It's Brilliant:**
- Short, punchy responses (2-4 sentences)
- Validates struggle BEFORE challenging
- Pushes for specifics ("What EXACTLY will you do?")
- No corporate fluff or toxic positivity
- Matches recovery culture authenticity

**Key Patterns:**
```typescript
// ❌ WRONG: Corporate/fluffy
"That's a beautiful journey you're on! I'm so proud of your growth!"

// ✅ RIGHT: Sandy B. direct
"That's real. That's the truth right there. What will you DO about it?"
```

**Response Structure:**
1. Validate first: "Yeah. I hear that." or "That's hard."
2. Challenge vague answers: "'I'll try' is what we say before we don't do something."
3. Demand specifics: "Give me a concrete example from this week."
4. Keep it brief: 2-4 sentences max
5. Action-focused: "What will you DO?" not "How do you feel?"

**Implementation:**
- Defined in `.claude/claude.md` system instructions
- Referenced in all Elder Tree API routes
- Used for encouragement prompts in Step In feature

**Best Practices:**
- Never claim to be a sponsor/therapist
- Acknowledge AI limitations
- Direct to human support when needed
- Trust the user (if they say "not deep enough", GO BACK)

**ROI:** User trust, authentic engagement, better outcomes

---

### 5. Comprehensive E2E Testing Strategy

**What It Is:** 630+ Playwright tests across 5 browsers, covering every user flow

**Why It's Brilliant:**
- Catches regressions before deployment
- Documents expected behavior
- Enables confident refactoring
- Cross-browser compatibility guaranteed
- Reduces production bugs dramatically

**Test Structure:**
```
tests/
├── auth/           # Login, signup, OAuth flows
├── dashboard/      # Main navigation, stats display
├── step-in/        # Question flow, encouragement
├── mining/         # Urge response, timer, completion
├── inventory/      # Daily check-in, streak tracking
└── walkabout/      # Nature therapy feature
```

**Key Patterns:**
```typescript
// tests/step-in.spec.ts
test('completes full Step 1 question flow', async ({ page }) => {
  await page.goto('/step-in/1');

  // Answer all questions in phase
  for (const question of expectedQuestions) {
    await expect(page.locator('[data-testid="question-text"]'))
      .toContainText(question.text);
    await page.fill('textarea', 'Detailed honest answer');
    await page.click('button:has-text("Continue")');
  }

  // Verify encouragement shown
  await expect(page.locator('[data-testid="encouragement"]')).toBeVisible();

  // Verify answers saved
  const answers = await getAnswersFromDB(userId, stepNumber);
  expect(answers).toHaveLength(expectedQuestions.length);
});
```

**Testing Best Practices:**
- Test user flows, not implementation details
- Use data-testid for stable selectors
- Test across all 5 browsers (Chromium, Firefox, Safari, Edge, Mobile)
- Include both happy path and error cases
- Verify database state, not just UI

**ROI:** Massive - caught hundreds of bugs, enabled confident deployments

---

### 6. Living Documentation Practice

**What It Is:** Multiple documentation types for different purposes, all kept up-to-date

**Why It's Brilliant:**
- FUCKBOARD.md - Mistakes and lessons
- IMPROVEMENTS.md - Suggested enhancements
- TECHNICAL_DEBT_AUDIT.md - Known issues
- SCREEN_MAP.md - UI/UX flows for designers
- 20251115_SPEC_*.md - Feature specifications with dates
- AGENT_STATUS_GUIDE.md - Workflow documentation

**Documentation Principles:**
1. **Date everything** - Know when context was valid
2. **Separate by purpose** - Don't mix specs with bugs
3. **Update immediately** - Documentation rots fast
4. **Code examples** - Show, don't just tell
5. **Searchable** - Use consistent headings and keywords

**File Naming Convention:**
```
YYYYMMDD_TYPE_Description.md
20251115_SPEC_Cross-Session-Memory-System.md
20251115_DECISIONS_Cross-Session-Memory-System.md
```

**Best Practices:**
- Create docs BEFORE implementing (specs)
- Update docs DURING implementation (decisions)
- Archive old docs to docs/archive/ (don't delete)
- Reference docs in commit messages
- Use docs in code reviews

**ROI:** Better team coordination, knowledge retention, onboarding speed

---

### 7. JSDoc API Documentation Pattern

**What It Is:** Comprehensive API route documentation with examples

**Why It's Brilliant:**
- Self-documenting code
- Better IDE autocomplete
- Clear request/response contracts
- Easier testing and debugging

**Pattern:**
```typescript
/**
 * POST /api/session/start
 *
 * Starts a new Elder Tree session for urge response
 *
 * @param {Object} request
 * @param {string} request.userId - The authenticated user's ID
 * @param {number} request.urgeIntensity - Intensity rating (1-10)
 * @param {string} [request.trigger] - Optional trigger description
 *
 * @returns {Object} response
 * @returns {string} response.sessionId - Unique session identifier
 * @returns {string} response.firstQuestion - Initial Elder Tree question
 * @returns {string} response.miningDuration - Calculated session duration
 *
 * @throws {401} If user is not authenticated
 * @throws {500} If session creation fails
 *
 * @example
 * // Request
 * POST /api/session/start
 * { "userId": "123", "urgeIntensity": 8, "trigger": "stress at work" }
 *
 * // Response
 * { "sessionId": "abc-def", "firstQuestion": "What's happening right now?", ... }
 */
export async function POST(request: NextRequest) {
  // Implementation
}
```

**Best Practices:**
- Document ALL API routes
- Include auth requirements
- Show example requests/responses
- Document error codes
- Keep docs updated with code changes

**ROI:** Faster development, fewer API bugs, easier collaboration

---

### 8. Privacy-First Architecture

**What It Is:** Complete separation of billing identity from recovery content

**Why It's Brilliant:**
- User anonymity preserved
- Billing happens through LemonSqueezy (separate from content DB)
- Recovery data stored under pseudonymous UUID only
- User owns and controls their data
- Export/delete features built-in

**Architecture:**
```
LemonSqueezy (Billing)
  ├── Real name, email, payment
  └── customer_id only shared with app

Supabase (Content)
  ├── Pseudonymous user_id (UUID)
  ├── Recovery content under UUID
  ├── No PII in content database
  └── User can export/delete anytime

Link: customer_id ↔ user_id mapping
  └── Stored securely, used only for subscription checks
```

**Implementation Best Practices:**
- Never log PII in application logs
- Separate billing queries from content queries
- Provide user data export (JSON + PDF)
- Implement "fresh start" data deletion
- Clear privacy policy explaining what's stored

**ROI:** User trust, GDPR/CCPA compliance, ethical foundation

---

### 9. Progressive Feature Unlocking Pattern

**What It Is:** Features revealed based on user readiness, not just access control

**Why It's Brilliant:**
- Reduces overwhelm for new users
- Encourages engagement and progression
- Respects recovery timeline (Step 5 requires meetings)
- Gamification that serves therapeutic purpose

**Implementation:**
```typescript
// lib/features/unlock-logic.ts
export function getAvailableFeatures(userContext: UserContext) {
  const features = ['urge_mining', 'walkabout']; // Always available

  if (userContext.step_1_completed) {
    features.push('step_in_step_2');
  }

  if (userContext.step_4_completed && userContext.has_sponsor) {
    features.push('step_5_prep'); // Prep for Step 5 WITH SPONSOR
  }

  if (userContext.sobriety_days >= 30) {
    features.push('milestone_reflections');
  }

  return features;
}
```

**UI Pattern:**
```typescript
// Show locked features with explanation
{!hasAccess('step_5_prep') && (
  <LockedFeature
    name="Step 5 Preparation"
    unlockCondition="Complete Step 4 and connect with a sponsor"
    reason="Step 5 requires human connection - Elder Tree will help you prepare for that conversation"
  />
)}
```

**Best Practices:**
- Explain WHY features are locked (not arbitrary gatekeeping)
- Show clear path to unlock
- Respect therapeutic boundaries (AI can't do Step 5)
- Celebrate unlocks as milestones

**ROI:** Better UX, therapeutic alignment, engagement progression

---

## 🛠️ Technical Patterns That Saved Us

### 10. Runtime vs Build-Time Pattern

**The Problem:** Next.js 15 aggressively pre-renders at build time, causing env var issues

**The Solution:**
```typescript
// ❌ WRONG: Module-level initialization
const supabase = createClient(process.env.SUPABASE_URL); // Build-time!
export async function POST() { ... }

// ✅ RIGHT: Inside route handler
export async function POST(request: NextRequest) {
  const supabase = createClient(process.env.SUPABASE_URL); // Runtime!
}

// ✅ ALSO RIGHT: Force dynamic rendering
export const dynamic = 'force-dynamic';
```

**Apply To:**
- Supabase clients
- Anthropic AI clients
- Any external service client
- Environment variable access

**Best Practice:** If it uses env vars, initialize it INSIDE the function, not at module level

---

### 11. React Event Listener Cleanup Pattern

**The Problem:** Memory leaks from listeners added repeatedly

**The Solution:**
```typescript
// ❌ WRONG: Listener inside click handler
function handleOAuthClick() {
  App.addListener('appUrlOpen', callback); // NEW LISTENER EVERY CLICK!
}

// ✅ RIGHT: Listener at component mount
useEffect(() => {
  const listener = App.addListener('appUrlOpen', callback);
  return () => listener.remove(); // CLEANUP!
}, []); // Empty deps = once on mount
```

**Pattern:**
1. Add listeners in useEffect with empty deps
2. Always return cleanup function
3. Never add listeners inside event handlers
4. Test by clicking repeatedly - memory should stay stable

---

### 12. Database Migration Safety Pattern

**The Problem:** Migrations fail on index creation, table dependencies

**The Solution:**
```sql
-- ❌ WRONG: Function call in index
CREATE INDEX idx_inventory_date ON daily_inventory(user_id, DATE(created_at));

-- ✅ RIGHT: Immutable expression only
CREATE INDEX idx_inventory_date ON daily_inventory(user_id, created_at);

-- ❌ WRONG: Assume table exists
CREATE INDEX idx_prayers_user ON prayers(user_id);

-- ✅ RIGHT: Check existence
CREATE INDEX IF NOT EXISTS idx_prayers_user ON prayers(user_id)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prayers');
```

**Best Practices:**
- Test migrations locally with Supabase CLI
- No function calls in index expressions
- Check table dependencies
- Use IF NOT EXISTS for safety
- Keep migrations idempotent (can run multiple times)

---

### 13. Parallel Query Optimization

**The Problem:** Sequential database queries slow down page loads

**The Solution:**
```typescript
// ❌ WRONG: Sequential
const sessions = await getTotalSessions(userId);
const streak = await getUserStreak(userId);
const coins = await getUserCoins(userId);

// ✅ RIGHT: Parallel
const [sessions, streak, coins] = await Promise.all([
  getTotalSessions(userId),
  getUserStreak(userId),
  getUserCoins(userId)
]);
```

**Best Practice:** If queries are independent, run them in parallel with Promise.all()

---

### 14. Error Handling Consistency

**The Pattern:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Validate auth
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();

    // Business logic
    const result = await doSomething(body);

    return NextResponse.json({ data: result });

  } catch (error) {
    console.error('Error in /api/route-name:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Best Practices:**
- Always wrap in try/catch
- Log errors with route name for debugging
- Return consistent error format
- Use appropriate status codes
- Don't leak error details to client

---

## 📋 Workflow Practices That Worked

### 15. Branch Naming with Session IDs

**Pattern:** `claude/feature-description-sessionId`

**Why It's Brilliant:**
- Unique branch per Claude Code session
- Easy to track which session created what
- Prevents branch conflicts
- Git hosting (GitHub) validates session ID

**Example:**
```bash
claude/oauth-implementation-011eAjUofcayHrgR3wSemaio
claude/cross-session-memory-01M5Ymm3ycjdtaYnLNnmDa11
```

---

### 16. Commit Message Convention

**Pattern:**
```
<type>: <concise description>

<optional longer explanation>
<reference to docs/issues>
```

**Examples:**
```
Add cross-agent status coordination system

Implements Supabase-based status sharing for parallel Claude Code sessions.
See AGENT_STATUS_GUIDE.md for usage.

---

Fix migration: Remove DATE() function from index expressions

Supabase requires immutable expressions in indexes. Changed to index
full timestamp instead of date-only.
See FUCKBOARD.md #14
```

**Best Practice:** Reference documentation in commits - creates knowledge trail

---

### 17. Pre-Push Checklist

**Before Every Push:**
```bash
# 1. Test build locally
npm run build

# 2. Check git status
git status

# 3. Review changes
git diff

# 4. Verify commit message
git log -1

# 5. Push with upstream tracking
git push -u origin branch-name
```

**Why:** Catches 80% of deployment errors before they reach Vercel

---

## 🎨 UX/Design Patterns

### 18. Collapsible Timer Pattern

**What It Is:** Timer that collapses to small indicator during mining, preventing "clock watching"

**Why It's Brilliant:**
- Reduces urge intensity anxiety
- Keeps user focused on reflection, not countdown
- Still provides progress awareness
- Optional expand for users who want to see it

**Implementation:**
```typescript
const [isExpanded, setIsExpanded] = useState(false);

return (
  <div className={isExpanded ? 'timer-expanded' : 'timer-collapsed'}>
    {isExpanded ? (
      <div className="text-4xl">{formatTime(remainingSeconds)}</div>
    ) : (
      <div className="text-sm text-gray-500">Mining in progress...</div>
    )}
    <button onClick={() => setIsExpanded(!isExpanded)}>
      {isExpanded ? 'Collapse' : 'Show timer'}
    </button>
  </div>
);
```

---

### 19. Crisis-Mode Visual Design

**What It Is:** Black/green color scheme for urgent situations, earth tones for calm reflection

**Why It's Brilliant:**
- Visual context matches emotional state
- Urge page: Black/green (focused, urgent)
- Dashboard: Earth tones (calm, grounded)
- Walkabout: Nature imagery (peaceful)

**Color System:**
```typescript
// Urge/Crisis Mode
bg-black, bg-gray-900
text-green-400, border-green-600
Crisis elements: bg-red-900/30, text-red-400

// Calm/Reflection Mode
bg-amber-50, bg-stone-100
text-amber-900, text-stone-700
Grounding elements: bg-green-100, text-green-800
```

**Best Practice:** UI design should support emotional regulation, not just look pretty

---

## 🚀 Future Project Recommendations

### What To Replicate:

1. **FUCKBOARD from Day 1** - Start documenting mistakes immediately
2. **Agent coordination system** - If using multi-agent workflow
3. **Comprehensive E2E tests** - Write tests alongside features
4. **Living documentation** - Multiple doc types for different purposes
5. **Privacy-first architecture** - Separate billing from content
6. **Runtime pattern enforcement** - Linter rules for client initialization
7. **Pre-push build checks** - Catch errors before deployment

### What To Improve:

1. **Environment variable validation** - Add startup validation script
2. **Centralized error handling** - Create error handling library
3. **API response types** - Full TypeScript coverage
4. **Feature flags** - Enable gradual rollouts
5. **Rate limiting** - Protect APIs from abuse

---

## 🎓 Key Learnings

### Technical:
- Next.js 15 build-time vs runtime is tricky - initialize clients inside handlers
- React event listeners need cleanup - always return removal function
- Database indexes must be immutable - no function calls
- Parallel queries >> sequential queries for performance
- E2E tests prevent production disasters

### Process:
- Document mistakes immediately (FUCKBOARD)
- Read your own docs before coding (avoid repeat mistakes)
- Test builds locally before pushing
- Multi-agent coordination enables parallel development
- Living documentation beats stale wikis

### Philosophy:
- Privacy-first builds user trust
- AI should augment, not replace, human connection
- Authenticity beats corporate speak
- Progressive unlocking reduces overwhelm
- Mistakes are valuable if documented

---

## 📊 Metrics of Success

**Development Velocity:**
- 630+ E2E tests written
- 15+ major features implemented
- 5+ agents coordinated in parallel
- Zero production-breaking deployments (thanks to FUCKBOARD)

**Code Quality:**
- Comprehensive API documentation
- Consistent error handling patterns
- Privacy-first architecture
- Minimal technical debt (tracked in TECHNICAL_DEBT_AUDIT.md)

**Knowledge Sharing:**
- 10+ major documentation files
- All mistakes documented in FUCKBOARD
- Feature specs created before implementation
- Agent coordination guide for parallel work

---

## 🎯 The Golden Rule

**"If you made a mistake worth fixing, it's worth documenting so you never make it again."**

Read the FUCKBOARD. Update the FUCKBOARD. Learn from the FUCKBOARD.

---

*Last Updated: November 15, 2025*
*Next Review: When we launch a new major project*
*Status: Living document - add brilliant patterns as we discover them*
