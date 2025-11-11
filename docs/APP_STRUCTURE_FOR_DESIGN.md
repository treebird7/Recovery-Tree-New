# Rooting Routine - App Structure & Flow
**For Design Reference - Updated 2025-11-11**

---

## Navigation Flow Overview

```
Landing Page → Signup/Login → Dashboard → [4 Main Features + History]
                                   ├─→ Urge Support (Crisis Flow)
                                   ├─→ Walk Session (Step Work)
                                   ├─→ Walkabout (Grounding Timer)
                                   ├─→ Daily Inventory
                                   └─→ History (All Sessions)
```

---

## Screen-by-Screen Breakdown

### 1. Landing Page (`app/page.tsx`)
**Purpose:** Marketing landing page with feature overview
**Status:** ✅ Implemented

**UI Components:**
- Hero section with app name and tagline
- Feature cards (Urge Support, Walk Sessions, Daily Inventory)
- CTA buttons → Sign Up / Login
- Pricing link

**Functions:**
- Navigation to signup/login
- Marketing content display

**Notes:**
- Simple marketing page
- No authentication required

---

### 2. Signup Page (`app/signup/page.tsx`)
**Purpose:** New user account creation
**Status:** ✅ Implemented

**UI Components:**
- Email input field
- Password input field
- "Create Account" button
- Link to login page

**Functions:**
- `handleSignup()` - Creates Supabase user account
- Form validation
- Error messaging

**Implementation:**
- ✅ Supabase Auth integration
- ✅ Email/password authentication
- ✅ Redirects to dashboard on success

---

### 3. Login Page (`app/login/page.tsx`)
**Purpose:** Existing user authentication
**Status:** ✅ Implemented

**UI Components:**
- Email input field
- Password input field
- "Sign In" button
- "Welcome Back" header
- Link to signup page

**Functions:**
- `handleLogin()` - Authenticates via Supabase
- Form validation
- Error handling

**Implementation:**
- ✅ Supabase Auth integration
- ✅ Session management
- ✅ Protected route middleware

---

### 4. Dashboard (`app/dashboard/page.tsx`)
**Purpose:** Main hub - access all app features
**Status:** ✅ Implemented

**UI Components:**
- User greeting with name
- Total coins display (🪙)
- 4 main feature cards:
  1. 🌲 Start Walk (Step Work)
  2. 🆘 Urge Support (Crisis intervention)
  3. 📝 Daily Inventory (End-of-day reflection)
  4. 📚 View History (Past sessions)
- Sign Out button

**Functions:**
- `getUserProfile()` - Fetches user data and coin balance
- Navigation to feature screens
- `handleSignOut()` - Logs out user

**Implementation:**
- ✅ Displays user profile
- ✅ Shows total coins earned
- ✅ Navigation buttons to all features
- ✅ Responsive grid layout

**Notes:**
- Central navigation hub
- Shows real-time coin balance
- Clean card-based layout

---

## URGE SUPPORT FLOW (3 Screens)

### 5a. Urge Support - Initial Page (`app/urge/page.tsx`)
**Purpose:** Crisis intervention - capture urge intensity and context
**Status:** ✅ Implemented (Recently overhauled)

**UI Components:**
- 🌳 Elder Tree header
- Greeting with username and current time
- Text area: "What's happening right now?"
- Urge intensity slider (0-10) with labels:
  - 0: Just checking in
  - 3: Mild
  - 5: Moderate
  - 7: Strong
  - 9-10: Intense
- "Continue" button
- "Back to Dashboard" link
- Elder Tree AI response section (appears after submit)
- "Willing to Listen" button (progresses to solution stage)

**Functions:**
- `handleSubmit()` - Sends urge details to AI
- `fetchElderTreeResponse()` - Gets context-aware AI guidance
- `handleWillingToListen()` - Progresses to mining timer setup
- Real-time slider value display

**API Endpoints:**
- `POST /api/urge/response` - Claude AI generates response based on intensity
  - Returns: { response, readyForSolution }

**Implementation:**
- ✅ Multi-stage form (description → AI response → solution options)
- ✅ Context-aware AI based on intensity (0-10)
- ✅ Crisis-level language for high intensity (9-10)
- ✅ Smooth conversation flow with Elder Tree
- ✅ "Willing to Listen" button to progress
- ✅ Timer setup options displayed after user confirms readiness

**Notes:**
- Heavily revised flow (was simpler, now multi-step conversation)
- Elder Tree voice: Sandy B.-inspired, direct but caring
- High-intensity urges get more urgent intervention language

---

### 5b. Urge Mining Timer Setup (Embedded in `app/urge/page.tsx`)
**Purpose:** Set duration for "sleep mining" - rest period with coin rewards
**Status:** ✅ Implemented

**UI Components:**
- "How long do you want to rest?" prompt
- Duration buttons:
  - Until morning (indefinite)
  - 30 minutes
  - 1 hour
  - 2 hours
  - Set Custom Time (number input)
- End time preview (e.g., "Timer will end at 11:30 PM")
- "Start Sleep Mining Timer" button
- Alternative: "I'm OK - Take Me to Walk Session" button
- Coin earning info: "Every minute mining = 1 coin"

**Functions:**
- `handleDurationSelect(duration)` - Sets mining duration
- `calculateEndTime()` - Shows when timer will end
- `startMiningTimer()` - Initiates mining session
- `navigateToWalk()` - Alternative path for users feeling stable

**API Endpoints:**
- `POST /api/mining/start` - Creates mining session
  - Params: { durationMinutes }
  - Returns: { sessionId, startedAt }

**Implementation:**
- ✅ 4 preset durations + custom input
- ✅ End time calculation and display
- ✅ Validation (1-480 minutes for custom)
- ✅ Alternative path to walk session
- ✅ Clear coin earning messaging

---

### 5c. Urge Mining - Active Timer (`app/urge/mining/page.tsx`)
**Purpose:** Display active mining timer - user resting to earn coins
**Status:** ✅ Implemented (Recently overhauled)

**UI Components:**
- 🌳 Large tree emoji
- "You're Mining Sleep Coins" header
- Countdown/elapsed time display (MM:SS or HH:MM:SS)
- Start time ("Started at 9:45 PM")
- Duration info (if set)
- Coin earning display ("1 coin per minute")
- "Finish Mining Early" button
- Confirmation dialog before ending

**Functions:**
- `checkActiveMining()` - Verifies session exists
- `updateTimer()` - Real-time countdown/elapsed display
- `handleFinishEarly()` - Ends session before duration complete
- Auto-redirect when duration reached (if set)

**API Endpoints:**
- `GET /api/mining/status` - Check active session
- `POST /api/mining/end` - Complete mining session

**Implementation:**
- ✅ Real-time timer updates (1 second intervals)
- ✅ Displays both duration and elapsed time
- ✅ Auto-end when duration reached
- ✅ Manual "Finish Early" option
- ✅ Confirmation before ending
- ✅ Redirects to reveal page on completion

**Notes:**
- Recently overhauled UI (cleaner, more focused)
- Shows both types of time info (duration + elapsed)
- Mining can be indefinite ("Until morning") or timed

---

### 5d. Morning Reveal (`app/urge/reveal/page.tsx`)
**Purpose:** Morning check-in after mining session - assess current state
**Status:** ✅ Implemented (FIXED - State buttons working)

**UI Components:**
- 🌳 Large tree emoji
- "Good Morning" header
- Stats display:
  - "You made it through the night"
  - "You didn't act out"
  - Coins earned (+X coins)
  - Duration (e.g., "45m of sobriety")
  - Total coins
- Motivational message from Elder Tree
- **State question (appears after 2 second delay):**
  - "How are you feeling right now?"
  - Button 1: "I'm Good - Feeling Stable" (green)
  - Button 2: "Still Struggling - Need Support" (orange)
- "Back to Dashboard" link

**Functions:**
- `checkForActiveMining()` - Load mining session stats
- `calculateStats()` - Compute duration and coins (1 coin/minute)
- `handleStateSelection(state)` - Routes based on user's current state
  - 'stable' → Dashboard
  - 'crisis' → Back to urge support

**API Endpoints:**
- `GET /api/mining/status` - Fetch session stats
- `POST /api/mining/end` - Complete session with state info

**Implementation:**
- ✅ 2-second delay before showing state question (let them see stats first)
- ✅ Simplified two-button flow (was 3 buttons before)
- ✅ Direct routing based on state
- ✅ Coin calculation (1 coin = 1 minute)
- ✅ Motivational messaging
- ✅ **RECENTLY FIXED:** State buttons now match test expectations

**Notes:**
- **CRITICAL FIX:** Changed from "I didn't act out/I acted out/I'm not sure" to "Feeling Stable/Still Struggling"
- Simplified flow - no longer shows multi-option next actions menu
- Routes directly: stable users → dashboard, struggling → urge support
- All 165 tests passing with new implementation

---

## WALK SESSION FLOW (Step Work)

### 6. Walk Session (`app/walk/page.tsx`)
**Purpose:** AI-guided step work (Steps 1, 2, 3 from 12-step program)
**Status:** ✅ Implemented

**UI Components:**
- **Pre-Walk Check-in:**
  - Step selection (Step 1, 2, or 3)
  - Current mood dropdown
  - Intention text area
  - "Start Walk" button

- **Active Walk Session:**
  - Elder Tree question display
  - User response text area
  - "Continue" button
  - Progress indicator
  - "End Walk Early" option

- **Walk Complete:**
  - Duration display
  - Coins earned (+X coins)
  - AI-generated reflection
  - Nature image (Unsplash API)
  - Insights summary
  - "Back to Dashboard" button

**Functions:**
- `startWalkSession(step, mood, intention)` - Creates session
- `fetchNextQuestion()` - Gets AI question based on step and previous responses
- `submitResponse(answer)` - Sends answer, gets next question
- `completeWalk()` - Ends session, generates reflection
- `fetchNatureImage()` - Gets Unsplash image for completion screen

**API Endpoints:**
- `POST /api/session/start` - Start step work session
- `POST /api/session/question` - Get next AI question
- `POST /api/session/complete` - End session, get reflection

**Implementation:**
- ✅ Step 1, 2, 3 question flows
- ✅ AI-guided conversation (Claude Sonnet)
- ✅ Session resumption (prevents blank question bug)
- ✅ Coin rewards (1 coin per minute)
- ✅ Walk duration tracking
- ✅ Insights extraction
- ✅ Nature imagery on completion

**Notes:**
- Elder Tree guides conversation based on chosen step
- Questions adapt to user's previous responses
- Session can be resumed if interrupted

---

## WALKABOUT FLOW

### 7. Walkabout (`app/walkabout/page.tsx`)
**Purpose:** Guided outdoor grounding timer with body awareness
**Status:** ✅ Implemented

**UI Components:**
- **Pre-Walkabout Check-in:**
  - Location selection (park, water, garden, urban, mountains, outside)
  - Body need selection (breathe, move, feel, release)
  - Duration input (minutes)
  - "Start Walkabout" button

- **Active Walkabout:**
  - Timer display (countdown)
  - Grounding instructions (based on body need)
  - Location reminder
  - "Finish Early" button

- **Walkabout Complete (Component: `components/walkabout/WalkaboutComplete.tsx`):**
  - "Welcome back" header
  - **Feeling check-in:**
    - "How are you feeling right now?"
    - Text area for response
    - "Continue" button
  - **After feeling submitted:**
    - Elder Tree response
    - Stats display (duration, coins earned)
    - Location and body need badges
    - **Next steps menu:**
      - 📝 Journal about it
      - 🧘 Sit and connect with HP
      - 📞 Reach out to someone
      - 📖 Work a step (→ Walk session)
      - 🏠 Return to dashboard

**Functions:**
- `startWalkabout(location, bodyNeed, duration)` - Start timer
- `updateTimer()` - Countdown display
- `completeWalkabout()` - End session, calculate coins
- `handleFeelingSubmit()` - Process post-walk reflection
- `handleNextAction(action)` - Route to next activity

**API Endpoints:**
- `POST /api/walkabout/start` - Create walkabout session
- `POST /api/walkabout/complete` - End session

**Implementation:**
- ✅ Location and body need customization
- ✅ Grounding instructions during walk
- ✅ Coin earning (1 coin/minute)
- ✅ Feeling check-in post-walk
- ✅ Next steps menu with multiple options
- ✅ Routes to other features (journal → inventory, step work → walk)

**Notes:**
- Different from "Walk Session" (step work)
- Focus on body grounding, not step work
- Provides nature-connection instructions

---

## DAILY INVENTORY

### 8. Daily Inventory Form (`app/inventory/page.tsx`)
**Purpose:** End-of-day reflection (10th step work)
**Status:** ✅ Implemented (⚠️ Requires DB migration)

**UI Components:**
- "Daily Inventory" header
- 4 reflection prompts:
  1. "What went well today?"
  2. "What struggles did you face?"
  3. "What are you grateful for?"
  4. "What's your intention for tomorrow?"
- Text areas for each prompt
- "Submit Inventory" button
- Elder Tree reflection (appears after submit)
- "View Past Inventories" link

**Functions:**
- `checkTodayInventory()` - Prevent multiple inventories per day
- `submitInventory(responses)` - Save to database, get AI reflection
- `generateElderTreeReflection()` - AI processes inventory

**API Endpoints:**
- `GET /api/inventory/today` - Check if today's inventory exists
- `POST /api/inventory` - Submit inventory
- `GET /api/inventory/list` - Get past inventories

**Implementation:**
- ✅ Daily reflection prompts
- ✅ Elder Tree end-of-day reflection
- ✅ One-per-day enforcement
- ⚠️ **REQUIRES DATABASE MIGRATION** (see known issues)

**Notes:**
- Migration file exists: `supabase/migrations/005_daily_inventory.sql`
- Table `daily_inventories` must be created in Supabase
- Returns 500 error until migration applied

---

### 9. Inventory History (`app/inventory/history/page.tsx`)
**Purpose:** View past daily inventories
**Status:** ✅ Implemented

**UI Components:**
- "Past Inventories" header
- List of inventory cards:
  - Date
  - Preview of responses
  - "View Details" button
- Detailed view modal/page:
  - Full responses to all 4 prompts
  - Elder Tree reflection
  - Date and time
- "Back to Dashboard" button

**Functions:**
- `fetchInventories()` - Load past inventories
- `viewInventoryDetail(id)` - Show full inventory

**Implementation:**
- ✅ List view with dates
- ✅ Detail view for each inventory
- ⚠️ Depends on database migration

---

## SESSION HISTORY

### 10. General History Page (`app/history/page.tsx`)
**Purpose:** View all sessions (walks, mining, inventories) in one place
**Status:** ✅ Implemented (NEW - from orchestrate merge)

**UI Components:**
- "Session History" header
- Filter tabs:
  - All Sessions
  - Walk Sessions
  - Mining Sessions
  - Daily Inventories
  - Walkabouts
- Session cards (sorted by date):
  - Session type icon
  - Date and time
  - Duration
  - Coins earned
  - Preview/summary
  - "View Details" button
- Pagination controls
- "Back to Dashboard" button

**Functions:**
- `fetchSessionHistory(filter)` - Load sessions with optional filter
- `filterByType(type)` - Filter by session type
- `viewSessionDetail(id)` - Show full session

**API Endpoints:**
- `GET /api/sessions/history` - Fetch all sessions
  - Query params: { type, limit, offset }
- `GET /api/sessions/[id]` - Get single session details

**Implementation:**
- ✅ All session types in one view
- ✅ Filtering by type
- ✅ Pagination for long histories
- ✅ Detailed view for each session
- ✅ NEW: Recently added in orchestrate merge

**Notes:**
- Unified history across all features
- Shows comprehensive session data
- Helps users see patterns over time

---

## SUPPORTING SCREENS

### 11. Auth Code Error (`app/auth/auth-code-error/page.tsx`)
**Purpose:** Handle Supabase auth errors
**Status:** ✅ Implemented

**UI Components:**
- Error message display
- "Back to Login" button

---

### 12. Success Page (`app/success/page.tsx`)
**Purpose:** Payment/subscription success confirmation
**Status:** ✅ Implemented (Placeholder)

**UI Components:**
- Success message
- "Go to Dashboard" button

**Notes:**
- Related to pricing/LemonSqueezy integration
- Payment webhook currently disabled

---

### 13. Pricing Page (`app/pricing/page.tsx`)
**Purpose:** Subscription plans
**Status:** ✅ Implemented (Placeholder)

**UI Components:**
- Pricing tiers
- Feature comparisons
- "Subscribe" buttons

**Notes:**
- LemonSqueezy integration exists but snoozed
- Webhook disabled in production

---

## KEY COMPONENTS (Reusable)

### WalkaboutComplete (`components/walkabout/WalkaboutComplete.tsx`)
**Purpose:** Post-walkabout completion UI
**Status:** ✅ Implemented

**Props:**
- duration (number)
- coinsEarned (number)
- location (string)
- bodyNeed (string)
- onNextAction (function)

**UI:**
- Welcome back message
- Feeling check-in form
- Stats display
- Next steps menu (5 options)

**Notes:**
- Used by walkabout feature
- Handles post-session routing

---

## API ROUTES SUMMARY

### Authentication
- Handled by Supabase Auth (no custom routes)

### User Data
- `GET /api/user/profile` - Get user info and coins

### Urge Support
- `POST /api/urge/response` - AI response to urge (Claude API)
- `POST /api/mining/start` - Start mining session
- `GET /api/mining/status` - Check active mining
- `POST /api/mining/end` - Complete mining

### Walk Sessions (Step Work)
- `POST /api/session/start` - Start walk session
- `POST /api/session/question` - Get next AI question
- `POST /api/session/complete` - End session, get reflection

### Walkabout
- `POST /api/walkabout/start` - Start walkabout
- `POST /api/walkabout/complete` - Complete walkabout

### Daily Inventory
- `GET /api/inventory/today` - Check if today's exists
- `POST /api/inventory` - Submit inventory
- `GET /api/inventory/list` - Get past inventories

### Session History (NEW)
- `GET /api/sessions/history` - All sessions with filtering
- `GET /api/sessions/[id]` - Single session details

### Webhooks & External
- `POST /api/lemonsqueezy/webhook` - Payment webhooks (disabled)

---

## DATABASE SCHEMA (Supabase PostgreSQL)

### Tables

**users** (Supabase Auth)
- id (uuid)
- email
- created_at

**user_profiles**
- id (uuid) - FK to users
- username
- total_coins (integer)
- created_at

**walk_sessions**
- id (uuid)
- user_id (uuid)
- step_number (1, 2, or 3)
- mood
- intention
- started_at
- completed_at
- duration_minutes
- coins_earned
- questions (jsonb)
- responses (jsonb)
- reflection (text)
- insights (jsonb)

**mining_sessions**
- id (uuid)
- user_id (uuid)
- started_at
- completed_at
- duration_minutes
- coins_earned
- intensity (0-10)
- user_state ('stable' or 'crisis')

**daily_inventories** ⚠️ NEEDS MIGRATION
- id (uuid)
- user_id (uuid)
- date
- went_well (text)
- struggles (text)
- gratitude (text)
- intention (text)
- reflection (text)
- created_at

**walkabout_sessions** (NEW - may need migration)
- id (uuid)
- user_id (uuid)
- location
- body_need
- duration_minutes
- coins_earned
- feeling (text)
- started_at
- completed_at

---

## EXTERNAL INTEGRATIONS

### Anthropic Claude API
**Purpose:** AI conversation generation
**Usage:**
- Urge response (context-aware based on intensity)
- Walk session questions (step-specific)
- Daily inventory reflections
- Elder Tree voice throughout

**Model:** Claude Sonnet 4.5
**Endpoints Used:** `/v1/messages`

---

### Unsplash API
**Purpose:** Nature imagery for walk completion
**Usage:**
- Fetches random nature photo on walk completion
**Status:** ✅ Configured and working

---

### DALL-E 3 (NEW - from orchestrate merge)
**Purpose:** AI image generation
**File:** `lib/services/dalle-images.ts`
**Status:** ✅ Code present, usage TBD

---

### Notion API (NEW - from orchestrate merge)
**Purpose:** Webhook routing to Notion pages
**Files:**
- `lib/notion/webhook.ts`
- `lib/notion/webhook.example.ts`
**Status:** ✅ Implemented
**Routes to 6 Notion pages:**
- Mission Control
- Design Briefs
- Build Tasks
- Design System
- Content Library
- Bug Tracker

---

### LemonSqueezy (SNOOZED)
**Purpose:** Payment processing
**Status:** ⚠️ Webhook disabled
**File:** `app/api/lemonsqueezy/webhook/route.ts`
**Notes:** Temporarily disabled for later implementation

---

## IMPLEMENTATION STATUS

### ✅ Fully Implemented
- Authentication (signup/login/logout)
- Dashboard navigation
- Urge support flow (all 4 screens)
- Walk sessions (step work)
- Walkabout (grounding timer)
- Session history (NEW)
- Coin economy (1 coin = 1 minute)
- Elder Tree AI conversations
- Unsplash nature images

### ⚠️ Needs Database Migration
- Daily Inventory (table doesn't exist yet)
- Migration file ready: `supabase/migrations/005_daily_inventory.sql`

### 📋 Placeholder/Future
- Pricing page (exists but payment disabled)
- Meditation/prayer feature (mentioned in walkabout next steps)
- Contacts/reach out feature (mentioned in walkabout next steps)
- Pattern recognition (analyze urge patterns)
- Streak tracking (daily walk/inventory streaks)
- PWA offline support
- Voice-to-text input

---

## COIN ECONOMY

**Earning Rules:**
- 1 coin = 1 minute of activity
- Activities that earn coins:
  - Walk sessions (step work)
  - Mining sessions (urge support rest)
  - Walkabout (grounding timer)
  - Daily inventory (future)

**Display:**
- Total coins shown on dashboard
- Individual coins earned shown on completion screens

**Database:**
- Tracked in `user_profiles.total_coins`
- Session-specific coins in each session table

---

## DESIGN SYSTEM NOTES

### Color Palette
- Primary: Green (#10B981, #059669) - Growth, recovery
- Warning: Orange (#F97316, #EA580C) - Urgency, crisis
- Accent: Yellow (#F59E0B) - Coins, rewards
- Background: Dark gray (#111827, #1F2937) - Urge/mining screens
- Background: White (#FFFFFF) - Walk/inventory screens

### Typography
- Headers: Bold, 2xl-4xl
- Body: Base size, relaxed leading
- Elder Tree voice: Slightly larger, medium weight

### Icons/Emojis
- 🌳 Elder Tree (primary branding)
- 🪙 Coins
- 🌲 Walk sessions
- 🆘 Urge support
- 📝 Daily inventory
- 📚 History
- 🧘 Meditation
- 📞 Reach out
- 📖 Step work

### Layout Patterns
- Card-based navigation (dashboard)
- Full-screen forms (urge, inventory)
- Centered content, max-width containers
- Sticky headers on scrolling screens

---

## TECHNICAL NOTES FOR DESIGN

### Responsive Design
- Mobile-first approach
- All screens tested on:
  - Desktop (Chrome, Firefox, Safari)
  - Mobile (Chrome, Safari, WebKit)
- Viewport sizes: 375px (iPhone SE) and up

### Animations
- Fade-in for Elder Tree responses
- Smooth transitions between form stages
- Timer updates (1 second intervals)

### Form Patterns
- Disabled buttons until valid input
- Loading states ("Saving...", "Listening...")
- Error messaging (red text)
- Success feedback (green highlights)

### AI Response Display
- Left-bordered boxes (green/orange)
- Larger text for readability
- Spaced for breathing room

---

## USER FLOW PATHS

### Crisis Intervention Path
```
Dashboard → Urge Support → (AI Response) → Mining Timer → Active Mining → Morning Reveal → [Dashboard or Loop Back]
```

### Step Work Path
```
Dashboard → Walk Session → (Pre-check) → (AI Questions) → Walk Complete → Dashboard
```

### Grounding Path
```
Dashboard → Walkabout → (Setup) → Active Timer → Complete → [Next Action Menu] → Dashboard/Walk/Inventory
```

### Reflection Path
```
Dashboard → Daily Inventory → (4 Prompts) → Elder Tree Reflection → [View History] → Dashboard
```

### History Review Path
```
Dashboard → History → [Filter by Type] → [View Details] → Dashboard
```

---

## TESTING STATUS

### E2E Tests (Playwright)
**Total:** 165 tests across 5 browsers
**Status:** ✅ All passing (as of 2025-11-11)

**Test Suites:**
- `tests/urge-support.spec.ts` (33 tests)
- `tests/walk-session.spec.ts`
- `tests/dashboard-walkabout.spec.ts`
- `tests/daily-inventory.spec.ts`
- `tests/authentication.spec.ts`

**Browsers:**
- Chromium
- Firefox
- WebKit
- Mobile Chrome
- Mobile Safari

---

## KNOWN ISSUES / TECH DEBT

1. **Daily Inventory Database Migration**
   - Table doesn't exist yet
   - Migration file ready, needs manual application
   - Affects inventory form and history

2. **LemonSqueezy Webhook Disabled**
   - Payment processing snoozed
   - Will need re-enabling for production

3. **Morning Reveal Flow**
   - ✅ FIXED (2025-11-11)
   - Changed from 3-button outcome to 2-button state
   - All tests now passing

---

## RECENT CHANGES (Orchestrate Merge - 2025-11-11)

### Added
- ✅ Session history page (`app/history/page.tsx`)
- ✅ Multi-agent orchestration system (`.coordination/`)
- ✅ DALL-E 3 integration (`lib/services/dalle-images.ts`)
- ✅ Notion webhook routing (`lib/notion/webhook.ts`)
- ✅ Comprehensive documentation (COMPONENT_ARCHITECTURE.md, etc.)

### Fixed
- ✅ Morning reveal state buttons (now "Feeling Stable" / "Still Struggling")
- ✅ Mining double-call bug
- ✅ Elder Tree conversation button logic
- ✅ Test compatibility issues

### Changed
- ✅ Urge support flow (multi-stage conversation)
- ✅ Mining timer UI (cleaner, more focused)
- ✅ 56 commits merged from orchestrate branch

---

## ELDER TREE VOICE GUIDELINES

**Tone:**
- Direct, no bullshit
- Caring but firm (Sandy B.-inspired)
- Recovery-focused, not clinical
- Present-focused ("right now", "this moment")

**Language:**
- Short sentences
- Active voice
- Avoids therapy jargon
- Uses "you" and "I" (conversational)

**Crisis Response:**
- Acknowledges intensity
- Offers immediate action (rest, timer)
- Emphasizes "this will pass"
- No shame or judgment

**Example Phrases:**
- "You made it through. That's the work."
- "That obsession that felt impossible? You got through it."
- "Acting out doesn't erase the time you spent trying."
- "Recovery isn't perfect. It's just showing up again."

---

**End of Design Reference**
**For questions or clarifications, contact the dev team.**
