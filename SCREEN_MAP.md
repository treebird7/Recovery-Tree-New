# Rooting Routine - Screen Map & User Flows

**For Design Review by Maude & Figgy**

Last Updated: 2025-01-13
Current Branch: `claude/review-sancho-prompt-step-in-011CV3v1SkALvum1ThUfk9WR`

---

## 🎨 Current Design System

### Color Scheme
**Primary Theme: Black/Green (Urge Page Aesthetic)**
- Background: `bg-black`, `bg-gray-900`
- Cards: `bg-gray-800`, borders `border-gray-700`
- Primary Accent: `text-green-400`, `bg-green-600`
- Secondary: `text-yellow-400` (coins)
- Crisis/Urgent: `bg-red-900/30`, `border-red-600`, `text-red-400`
- Text Hierarchy:
  - Headings: `text-green-400`, `text-gray-100`
  - Body: `text-gray-300`
  - Subtle: `text-gray-400`, `text-gray-500`

### Typography
- Headings: Bold, 2xl-4xl
- Body: Base-lg, light-regular weight
- Monospace: Used for timers

### Components
- Cards: Rounded-lg/2xl with shadows
- Buttons: Full-width, rounded-lg, green-600 primary
- Inputs: Dark bg (gray-900), light text (gray-100), green focus rings

---

## 📱 Screen Inventory

### 1. Landing/Marketing Pages

#### `/` - Landing Page
**Route:** `app/page.tsx`
**Purpose:** First screen for unauthenticated users
**Key Elements:**
- App introduction
- Value proposition
- CTA to signup/login

**User Actions:**
- Navigate to `/signup`
- Navigate to `/login`

---

#### `/signup` - Sign Up
**Route:** `app/signup/page.tsx`
**Purpose:** New user registration
**Key Elements:**
- Email input
- Password input
- Display name input
- Signup button
- Link to login

**User Actions:**
- Create account
- Navigate to `/login`

**Flow:** → `/auth-callback` → `/dashboard`

---

#### `/login` - Login
**Route:** `app/login/page.tsx`
**Purpose:** User authentication
**Key Elements:**
- Email input
- Password input
- Login button
- Link to signup

**User Actions:**
- Login
- Navigate to `/signup`

**Flow:** → `/auth-callback` → `/dashboard`

---

#### `/auth-callback` - Auth Callback
**Route:** `app/auth-callback/page.tsx`
**Purpose:** Handle Supabase auth redirect
**Key Elements:**
- Loading state
- Auto-redirect

**Flow:** → `/dashboard`

---

### 2. Main Dashboard

#### `/dashboard` - Main Dashboard
**Route:** `app/dashboard/page.tsx`
**Purpose:** Central hub after login - main navigation point
**Current Design:** Black background, gray-900 nav, gray-800 cards

**Key Elements:**

**Navigation Bar:**
- App title: "🌳 Rooting Routine" (green-400)
- User email (gray-400)
- Logout button

**Hero Section:**
- "Welcome to Your Journey" heading (green-400, 3xl)
- Subtitle: "Ready for today's recovery walk?" (gray-300)

**Stats Cards Grid (4 columns):**
1. Completed Walks (green-400 number)
2. Day Streak 🔥 (green-400 number)
3. Coins 🪙 (yellow-400 number)
4. Inventory Streak 📝 (green-400 number)

**Feature Cards Grid (3 columns):**
1. **Need Help Now?** (Crisis - red-900/30 bg, red-600 border, red-400 accent)
   - Icon: Warning triangle
   - CTA: "I Need Support"
   - Links to: `/urge`

2. **Step Outside** (green accent)
   - Icon: Globe/nature
   - Description: "Ground yourself through nature and movement"
   - CTA: "Step Outside"
   - Links to: `/walkabout`

3. **Step In** (green accent)
   - Icon: Arrow right
   - Description: "Work through your 12-step journal questions"
   - CTA: "Step In"
   - Links to: `/step-in`

4. **Daily Inventory** (green accent)
   - Icon: Document
   - Description: "Take a few minutes to reflect on your day"
   - CTA: "Complete Today's Inventory"
   - Links to: `/inventory`
   - **Completed State:** green-500 border, checkmark icon

5. **Session History** (green accent)
   - Icon: Clock
   - Description: "Review your past walks and reflections"
   - CTA: "View History"
   - Links to: `/history`

6. **My Prayers** (green accent)
   - Icon: Sparkles
   - Description: "View and manage your Step 3 prayers"
   - CTA: "View Prayers"
   - Links to: `/my-prayers`

7. **Progress Tracker** (disabled - gray, 50% opacity)
   - Icon: Bar chart
   - Status: "Coming Soon"

**About Section:**
- Green-600 left border
- Gray-800 card background
- Description of Elder Tree

**User Actions:**
- Navigate to any feature
- View stats
- Logout

---

### 3. Crisis/Urge Flow (CRITICAL PATH)

#### `/urge` - Crisis Support (Stage 1: Initial)
**Route:** `app/urge/page.tsx`
**Purpose:** Immediate crisis intervention - Elder Tree conversation
**Current Design:** Black background, gray-800 cards, green-600 accents

**Key Elements:**

**Stage 1: Initial Check-in**
- Current time display
- Greeting: "Hey {username}, it's {time}"
- Elder Tree opening message
- **Textarea:** "What's going on right now?" (gray-900 bg, gray-100 text)
- **Urge Strength Slider:** 0-10 scale (green-400 accent)
  - 0: "Just checking in"
  - 1-3: "Mild"
  - 4-6: "Moderate"
  - 7-8: "Strong"
  - 9-10: "Intense"
- **Button:** "Continue" (green-600)

**User Actions:**
- Input current feelings
- Set urge strength
- Submit to Elder Tree

**Flow:** → Stage 2 (Response)

---

#### `/urge` - Crisis Support (Stage 2: Response)
**Purpose:** Elder Tree responds with empathy and questions

**Key Elements:**
- **Conversation History:**
  - User messages: gray-700 bg, right-aligned
  - Elder Tree messages: gray-800 bg, green-600 left border
- **Elder Tree Response:** Personalized based on input
- **Follow-up Input:** (If needed) gray-900 textarea
- **Button:** "I'm Willing to Listen" (green-600, xl, bold)

**User Actions:**
- Continue conversation (if prompted)
- Proceed to solution options

**Flow:** → Stage 3 (Solution)

---

#### `/urge` - Crisis Support (Stage 3: Solution)
**Purpose:** Offer mining session to help user through crisis

**Key Elements:**

**Elder Tree Explanation Box:** (green-900/30 bg, green-600 border)
- "You can put your phone down, close your eyes, and let your tree mine coins while you rest"
- Emphasis: "Even if you can't sleep - just lying there in the dark counts"

**Alternative Warning:**
- Gray text: "Or you can keep white-knuckling this alone..."
- Bold challenge: "What's it going to be, {username}?"

**Intent Choice:** (What do you need help with?)
- 😴 Going to sleep
- 📵 Putting screen down

**Timer Duration Selector:**
- Until I wake up
- 2 hours
- 4 hours
- 8 hours
- Custom minutes input

**Button:** "Start Mining Session" (green-600, xl, bold)

**User Actions:**
- Choose intent (sleep/screen)
- Select duration
- Start mining session

**Flow:** → `/urge/mining`

---

#### `/urge/mining` - Active Mining Session
**Route:** `app/urge/mining/page.tsx`
**Purpose:** Locked screen during mining - prevents acting out
**Current Design:** Full screen black with green accents

**Key Elements:**
- **Tree Emoji:** Large, centered (animated pulse)
- **Status Message:** "Your tree is mining coins..."
- **Timer Display:** Large countdown/up (green-400, monospace)
- **Coins Earned:** Running total (yellow-400)
- **Lock Message:** "Screen locked. Rest now."
- **Breathing Reminders:** Subtle, fading in/out

**User Actions:**
- VIEW ONLY - no interactions except:
- **Emergency Button:** Small, "End Session" (bottom, gray text)

**Flow:** → `/urge/reveal` (auto when timer ends OR user ends)

---

#### `/urge/reveal` - Mining Complete
**Route:** `app/urge/reveal/page.tsx`
**Purpose:** Celebrate completion, show rewards
**Current Design:** Gray-800 cards, green accents

**Key Elements:**
- **Celebration Header:** "You Made It Through" (green-400, 4xl)
- **Stats Card:** (green-900/30 bg, green-600 border)
  - Duration: X hours/minutes
  - Coins earned: 🪙 X (yellow-400)
- **Elder Tree Message:** Personalized encouragement (gray-900/50 bg, green-600 left border)
- **Next Steps Menu:**
  - 📝 Journal about it
  - 🧘 Sit and connect with HP
  - 📞 Reach out to someone
  - 📖 Work a step → `/step-in`
  - 🏠 Return to dashboard

**User Actions:**
- Choose next action
- Navigate to chosen feature

**Flow:** → User's choice (dashboard, step-in, etc.)

---

### 4. Step Outside Flow (Grounding Walk)

#### `/walkabout` - Step Outside (Stage 1: Guidance)
**Route:** `app/walkabout/page.tsx`
**Component:** `components/walkabout/WalkaboutGuidance.tsx`
**Purpose:** Prepare user for grounding walk
**Current Design:** Black bg, gray-800 card, green accents

**Key Elements:**
- **Back Button:** "← Back to Dashboard" (gray-400)
- **Title:** "🌿 Step Outside" (green-400, 4xl)
- **Elder Tree Guidance Box:** (gray-900/50 bg, green-600 left border)
  - "You've chosen to step outside. That's good."
  - Explanation: Not about making craving disappear, about connecting with HP
  - **Bulleted List:** (green-400 bullets)
    - Feel your feet on the ground
    - Notice the air, sounds, what you can see
    - When waves come, return to what's physically real
    - Talk to your HP - honest conversation
    - Sit if you find the right place
- **Button:** "START WALK" (green-600, full-width, lg)

**User Actions:**
- Read guidance
- Start walk

**Flow:** → Stage 2 (Walking Timer)

---

#### `/walkabout` - Step Outside (Stage 2: Walking Timer)
**Component:** `components/walkabout/WalkaboutTimer.tsx`
**Purpose:** Timer runs while user walks outside
**Current Design:** Full screen gradient gray-900 to black

**Key Elements:**

**Toggle Button:** (top-right, gray-400)
- "Show Timer" / "Hide Timer"

**Conditional Display:**
- **If Timer Hidden (DEFAULT):**
  - 🌳 Large tree emoji (9xl, animated pulse)
  - "Rooted and present" (green-300, subtle)

- **If Timer Shown:**
  - Timer: XX:XX (green-400, 8xl, monospace)

**Always Visible:**
- 🌿 Header icon
- "Walking..." text (xl, light)
- **Grounding Reminders:** (gray-300, centered)
  - Divider lines (gray-700)
  - "Feel your feet on the ground."
  - "Notice what's physically real."
  - "When waves come, return to your breath."
- **End Walk Button:** (bottom, green-600 border, small)
- **Coins Indicator:** "{X} coins earned" (gray-500, xs, bottom)

**User Actions:**
- Toggle timer visibility
- End walk when ready

**Flow:** → Stage 3 (Completion)

---

#### `/walkabout` - Step Outside (Stage 3: Completion)
**Component:** `components/walkabout/WalkaboutComplete.tsx`
**Purpose:** Check-in after walk, offer next steps
**Current Design:** Gray-800 card, green accents

**Key Elements:**

**Part 1: Feeling Check-in**
- **Title:** "Welcome back" (green-400, 4xl)
- **Prompt Box:** (gray-900/50 bg, green-600 left border)
  - "How are you feeling right now?"
  - **Textarea:** (gray-900 bg, gray-100 text, green-500 focus ring)
- **Button:** "Continue" (green-600)

**Part 2: Celebration & Next Steps**
- **Elder Tree Response:** (gray-900/50 bg, green-600 left border)
  - Echoes user's feeling
  - "You stepped outside when you were in crisis, and you came back more grounded. That matters."
- **Stats Card:** (green-900/30 bg, green-600 border)
  - "✨ Walk Complete"
  - Duration: X minutes (green-400)
  - Coins: 🪙 X (yellow-400)
- **Next Steps Menu:** (Same as mining reveal)
  - 📝 Journal about it
  - 🧘 Sit and connect with HP
  - 📞 Reach out to someone
  - 📖 Work a step → `/step-in`
  - 🏠 Return to dashboard

**User Actions:**
- Share feeling
- Choose next action

**Flow:** → User's choice

---

### 5. Step In Flow (12-Step Journal)

#### `/step-in` - Step Work Journal
**Route:** `app/step-in/page.tsx`
**Purpose:** Deep step work with Watson's 65-question database
**Current Design:** Black background, gray-900 cards, green accents

**Key Elements:**

**Header:**
- **Back Button:** "← Back to Dashboard" (gray-400)
- **Title:** "Step In" (green-400, 3xl)
- **Subtitle:** "12 Steps Journal and Questionnaire" (gray-400, lg)
- **Timer Toggle:** (top-right, gray-400)
  - "Show Timer" / "Hide Timer"
  - Timer: XX:XX (gray-300, 2xl, monospace) - if shown

**Step Selector:** (3 buttons)
- Step 1 / Step 2 / Step 3
- Active: green-600 bg, white text
- Inactive: gray-800 bg, gray-400 text

**Question Display Area:** (gray-900 card, gray-800 border)
- **Phase Badge:** "{PHASE} - STEP {N}" (green-400, sm, bold)
- **Question Text:** (white, 3xl, bold, pre-wrap)
- **Follow-up Text:** (gray-400, sm, italic) - if present
- **Progress:** "{N} answered this session" (gray-500, xs)

**Answer Input Area:**
- **Textarea:** (gray-900 bg, gray-100 text, green-600 focus ring, 6 rows)
  - Placeholder: "Your response here..."
  - Auto-focus

**Save Entry Toggle:** (Switch component)
- ON: "Save this entry" (green-600 bg)
- OFF: "Don't save" (gray-700 bg)
- Explanation text: "Response will be saved to journal..." / "Live conversation only..."

**Submit Button:**
- "Submit Answer" (green-600, full-width, xl, bold)
- Loading state: "Saving..."

**Finished Button:** (gray-800, bottom, separated by border)
- "Finished for today" (gray-800 bg, gray text)

**All Questions Answered State:**
- Celebration message (green-400)
- Completion text
- Step 3 only: "Go to Prayer Protocol" button → `/prayers`

**Encouragement Modal:** (Appears on "Finished for today")
- Gray-900 background overlay
- Card with Elder Tree response
- Step complete badge (if applicable)
- Safety flag warning (if triggered)
- Elder Tree personalized message
- Next step hint
- Buttons: "Go to Prayer Protocol" (Step 3 only) / "Return to Dashboard"

**About Box:** (bottom, gray-900/50 bg)
- Explanation of Step In feature

**User Actions:**
- Select step (1, 2, or 3)
- Toggle timer
- Read question
- Type answer
- Toggle save/don't save
- Submit answer → Get next question
- Finish session → Get encouragement
- Navigate to prayers (Step 3)
- Return to dashboard

**Flow:**
- Continuous loop: Question → Answer → Next Question
- Exit: → `/dashboard` OR `/prayers` (Step 3)

---

### 6. Daily Inventory Flow

#### `/inventory` - Daily Inventory
**Route:** `app/inventory/page.tsx`
**Purpose:** Daily 10th step reflection
**Key Elements:**
- Prompts for self-reflection
- Questions about the day
- Gratitude section
- Amends needed
- Submit inventory

**User Actions:**
- Complete daily inventory
- Save responses
- View inventory history → `/inventory/history`

**Flow:** → `/dashboard` or `/inventory/history`

---

#### `/inventory/history` - Inventory History
**Route:** `app/inventory/history/page.tsx`
**Purpose:** Review past daily inventories
**Key Elements:**
- List of past inventories by date
- Inventory streak display
- Individual inventory details

**User Actions:**
- Browse past inventories
- View specific entry details
- Return to dashboard

---

### 7. Prayer Protocol Flow (Step 3)

#### `/prayers` - Prayer Library
**Route:** `app/prayers/page.tsx`
**Purpose:** Choose or create Step 3 commitment prayer
**Key Elements:**
- Library of traditional prayers
- Option to create custom prayer
- Elder Tree collaboration option
- Preview prayers

**User Actions:**
- Browse prayer library
- Select existing prayer
- Create custom prayer with AI help
- Save chosen prayer
- View my prayers → `/my-prayers`

**Flow:** → `/my-prayers`

---

#### `/my-prayers` - My Saved Prayers
**Route:** `app/my-prayers/page.tsx`
**Purpose:** View and manage personal Step 3 prayers
**Key Elements:**
- List of user's saved prayers
- Prayer text display
- Edit/update options
- Active prayer indicator

**User Actions:**
- View saved prayers
- Edit prayer
- Set active prayer
- Create new prayer → `/prayers`

---

### 8. History & Progress

#### `/history` - Session History
**Route:** `app/history/page.tsx`
**Purpose:** Review past walks, step work, and mining sessions
**Key Elements:**
- Chronological list of sessions
- Session types (walk, step-in, mining)
- Duration and coins earned
- Answers/reflections from sessions
- Filter by type/date

**User Actions:**
- Browse session history
- View session details
- Filter sessions
- Return to dashboard

---

### 9. Deprecated/Legacy

#### `/walk` - OLD Elder Tree Walk (DEPRECATED)
**Route:** `app/walk/page.tsx`
**Status:** ⚠️ DEPRECATED - Being phased out
**Purpose:** Original step work feature (replaced by Step In)
**Note:** Navigation bug was fixed - users should no longer reach this screen
**Recommendation:** Consider removing or redirecting to `/step-in`

---

### 10. Admin/Utility Pages

#### `/pricing` - Pricing Page
**Route:** `app/pricing/page.tsx`
**Purpose:** Show subscription tiers (currently disabled)
**Status:** LemonSqueezy integration disabled

---

#### `/success` - Payment Success
**Route:** `app/success/page.tsx`
**Purpose:** Confirmation after successful payment

---

#### `/auth/auth-code-error` - Auth Error
**Route:** `app/auth/auth-code-error/page.tsx`
**Purpose:** Handle authentication errors

---

## 🔄 Primary User Flows

### Flow 1: New User Onboarding
```
/ (Landing)
  → /signup
    → /auth-callback
      → /dashboard
```

### Flow 2: Crisis Intervention (Most Critical)
```
/dashboard
  → /urge (click "I Need Support")
    → Stage 1: Share what's going on + urge strength
    → Stage 2: Elder Tree responds with empathy
    → Stage 3: Offer mining solution
      → /urge/mining (locked timer)
        → /urge/reveal (completion & rewards)
          → Choose next action:
            - /dashboard
            - /step-in
            - /inventory
            - etc.
```

### Flow 3: Grounding Walk
```
/dashboard
  → /walkabout (click "Step Outside")
    → Stage 1: Read guidance
    → Stage 2: Timer during walk (toggle timer/tree view)
    → Stage 3: Check-in + next steps
      → Choose next action:
        - /dashboard
        - /step-in
        - etc.
```

### Flow 4: Step Work Journey
```
/dashboard
  → /step-in (click "Step In")
    → Select step (1, 2, or 3)
    → Answer questions from Watson database
    → Loop: Question → Answer → Next Question
    → "Finished for today"
      → Elder Tree encouragement modal
        → If Step 3 complete: /prayers (Prayer Protocol)
        → Otherwise: /dashboard
```

### Flow 5: Step 3 Prayer Commitment
```
/step-in (Step 3)
  → Complete Step 3 questions
    → /prayers (Prayer Protocol)
      → Choose existing prayer OR create custom with AI
        → /my-prayers (saved prayers)
          → /dashboard
```

### Flow 6: Daily Routine
```
/dashboard (login)
  → Check stats (streak, coins, completions)
  → /inventory (click "Daily Inventory")
    → Complete 10th step reflection
      → /inventory/history (optional)
        → /dashboard
```

---

## 🎯 Design Opportunities & Notes

### High-Priority UX Issues

1. **Consistency Across Features**
   - Step In uses black theme (matches urge)
   - All features now use black/green theme
   - ✅ RESOLVED: Unified color scheme

2. **Mobile Responsiveness**
   - Grid layouts (stats, feature cards) need mobile breakpoints review
   - Timer screens need landscape mode consideration
   - Full-screen mining lock needs testing on various devices

3. **Visual Hierarchy**
   - Crisis button (red) vs. other features (green) - good distinction
   - Stats cards blend together - could use more differentiation
   - Elder Tree messages need stronger visual identity

4. **Empty States**
   - First-time users see empty stats (0s everywhere)
   - No session history message?
   - No prayers saved state?

5. **Loading States**
   - Some transitions lack loading indicators
   - Elder Tree "thinking" needs visual feedback
   - Question loading in Step In has spinner

### Feature-Specific Notes

#### Crisis Flow (`/urge` → `/urge/mining` → `/urge/reveal`)
- **Critical Path:** Highest priority for design polish
- **Locked Screen:** Mining page prevents phone use - needs to feel supportive, not punishing
- **Tone:** Elder Tree is direct but caring - visual design should reflect this
- **Timer Anxiety:** Some users may be anxious about countdown - consider UX alternatives

#### Step Outside (`/walkabout`)
- **Innovation:** Toggle timer/tree view is unique - test user preference
- **Tree Emoji:** Large, pulsing tree feels grounding - but could use actual illustration?
- **Grounding Prompts:** Text-only reminders - could be more immersive (sound? haptics?)

#### Step In (`/step-in`)
- **Long Sessions:** Users may spend 20-60 minutes here - needs comfortable reading/writing experience
- **65 Questions:** Large database - progress indicators would help
- **Save Toggle:** Important feature but easy to miss - needs prominence
- **Encouragement Modal:** High-value moment - design should celebrate progress

#### Dashboard
- **Information Density:** 7 feature cards + 4 stats + hero + about = lot of content
- **Prioritization:** Which features should users see first?
- **Stats Placement:** Top stats good, but could be more engaging (graphs? milestones?)

### Accessibility Considerations

1. **Dark Theme:** Black/green scheme is calming but check contrast ratios
2. **Text Size:** Ensure readable sizes for main content (especially Step In questions)
3. **Focus States:** Green-500 rings are good, ensure consistent
4. **Touch Targets:** Buttons need adequate spacing for mobile
5. **Screen Reader:** Ensure proper heading hierarchy and ARIA labels

### Animation Opportunities

1. **Tree Pulsing:** Walkabout and mining screens use `animate-pulse`
2. **Transitions:** Page transitions could be smoother
3. **Success States:** Confetti or celebration animations for milestones?
4. **Micro-interactions:** Button hovers, card reveals, etc.

### Typography Review Needed

- **Current:** Default Tailwind fonts (system sans-serif)
- **Opportunity:** Custom font stack for brand identity?
- **Monospace:** Used for timers - works well
- **Sizes:** Range from xs (12px) to 4xl (36px)

---

## 📊 Screen Complexity Matrix

| Screen | Complexity | Design Priority | User Frequency |
|--------|-----------|----------------|----------------|
| `/urge` (all stages) | High | 🔴 CRITICAL | High (crisis) |
| `/urge/mining` | Medium | 🔴 CRITICAL | High (crisis) |
| `/dashboard` | High | 🟡 High | Very High (daily) |
| `/step-in` | High | 🟡 High | Medium-High (regular) |
| `/walkabout` (all stages) | Medium | 🟡 High | Medium-High (regular) |
| `/inventory` | Medium | 🟢 Medium | Daily |
| `/prayers` | Medium | 🟢 Medium | Occasional |
| `/my-prayers` | Low | 🟢 Medium | Occasional |
| `/history` | Medium | 🟢 Low | Occasional |
| `/login`, `/signup` | Low | 🟡 High | First-time only |

---

## 🚀 Quick Start for Designers

### To Review Current Design:
1. Clone repo, checkout branch `claude/review-sancho-prompt-step-in-011CV3v1SkALvum1ThUfk9WR`
2. Run `npm install && npm run dev`
3. Open `http://localhost:3000`
4. Create test account to explore flows

### Key Files to Review:
- **Dashboard:** `app/dashboard/page.tsx`
- **Crisis Flow:** `app/urge/page.tsx`, `app/urge/mining/page.tsx`, `app/urge/reveal/page.tsx`
- **Step Outside:** `components/walkabout/` directory
- **Step In:** `app/step-in/page.tsx`
- **Global Styles:** Tailwind classes throughout

### Design Deliverables Needed:
1. High-fidelity mockups for key screens (dashboard, urge flow, step-in)
2. Mobile responsive layouts
3. Animation/transition specs
4. Custom icon/illustration set (replace emojis?)
5. Updated color palette (if black/green needs refinement)
6. Typography system
7. Component library (buttons, cards, inputs, modals)

---

## 💡 Innovation Ideas

1. **Tree Visualization:** Actual growing tree illustration instead of emoji?
2. **Progress Gamification:** Visual tree growth based on sessions/coins?
3. **Breathing Exercises:** Interactive breathing guides during walks/mining?
4. **Sound Design:** Ambient nature sounds during grounding walk?
5. **Haptic Feedback:** Gentle vibrations for grounding reminders?
6. **Voice Notes:** Alternative to typing for step work answers?
7. **Dark Mode Toggle:** Or light mode option for daytime use?
8. **Streak Celebrations:** Milestone animations (7-day, 30-day, 90-day)?

---

## 📝 Questions for Maude & Figgy

1. Should we replace emoji with custom illustrations?
2. Is the black/green scheme too dark? Consider lighter alternative for daytime?
3. How can we make the Elder Tree feel more present/alive visually?
4. Should stats cards have more visual interest (graphs, charts)?
5. Does the crisis flow feel supportive enough visually?
6. Should we add onboarding/tutorial screens for first-time users?
7. Mobile-first or desktop-first design approach?
8. Any accessibility concerns with current dark theme?

---

**End of Screen Map**

For questions or clarifications, contact Sancho (this document's author).
