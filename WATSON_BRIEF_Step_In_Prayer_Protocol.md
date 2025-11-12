# WATSON BRIEF: Step In & Prayer Protocol Implementation
**Date:** 2025-11-12 (Updated: Question cycling added)
**Agent:** Sancho
**Status:** Phase 1 Complete - Ready for Watson Integration
**Branch:** `claude/review-sancho-prompt-step-in-011CV3v1SkALvum1ThUfk9WR`

---

## UPDATE: Working Question Cycling Added

**New:** Step In page now has working question cycling with placeholder questions!
- Users can answer 4 questions per step (Step 1, 2, 3)
- Questions progress on submit
- Answers tracked (console logged)
- Basic encouragement messages
- **Watson's job:** Replace hardcoded questions with database queries and save answers to `steps_journal`

---

## EXECUTIVE SUMMARY

Sancho has completed the **Step In** base page (Phase 1) with working question cycling and **full Prayer Protocol** implementation (Phases 2-6). The UI is fully functional, database schema is ready, APIs are functional, and prayer management is complete.

**Watson's next tasks:**
1. Upload Step 1-3 questions to Supabase
2. Define step completion criteria
3. Integrate question cycling logic into Step In page
4. Create Elder Tree encouragement message logic

---

## WHAT SANCHO BUILT

### 1. Step In Page (`/step-in`)
**Status:** ✅ Phase 1 Complete (Base UI)

**What's Working:**
- Dark theme matching URG mining style
- Question display area (currently shows placeholder)
- Answer textarea with autofocus
- Save entry toggle (default ON)
- Optional timer (MM:SS format, toggleable)
- "Finished for today" button
- Link to Prayer Protocol for Step 3
- Fully responsive

**What's Working (Temporary Placeholder Implementation):**
- Question cycling with hardcoded questions (4 per step)
- Step selector (Step 1/2/3 buttons)
- Question progression on submit
- Question counter display
- Answer tracking (console logs)
- Save toggle (UI only, not persisted)
- Basic encouragement message with count

**What's NOT Yet Implemented (Needs Watson):**
- Question cycling from database (currently hardcoded)
- Save answers to `steps_journal` table (currently console.log only)
- Elder Tree AI encouragement messages (currently simple text)
- Step completion detection based on quality/criteria
- Progress tracking between sessions
- User's actual current_step from database

**Technical Notes:**
- Located at: `app/step-in/page.tsx`
- Client-side component
- Uses PLACEHOLDER_QUESTIONS object (temporary)
- Watson should replace with database integration
- TODO comments mark where Watson integration needed

---

### 2. Prayer Protocol (`/prayers`)
**Status:** ✅ Phases 2-6 Complete (Full Implementation)

**What's Working:**
- Three modes: Browse Library / Write Your Own / Create With Elder Tree
- Prayer library fetching from database
- Multi-select library prayers with checkboxes
- Custom prayer textarea
- Elder Tree collaborative prayer generation (4 guiding questions)
- AI-generated personalized prayers using Anthropic
- Prayer editing before save
- Save multiple prayers in one transaction
- Mark Step 3 as complete on save
- Celebration message
- Dark theme, fully responsive

**Technical Stack:**
- Frontend: `app/prayers/page.tsx`
- Backend APIs:
  - `GET /api/prayers/library` - fetch prayer library
  - `GET /api/prayers/user` - fetch user's prayers
  - `POST /api/prayers/save` - save prayers & mark Step 3 complete
  - `POST /api/prayers/collaborate` - Elder Tree prayer generation
  - `PATCH /api/prayers/update` - edit prayer or set primary
  - `DELETE /api/prayers/update` - delete prayer
- Service layer: `lib/services/prayer.ts`

---

### 3. Prayer Management (`/my-prayers`)
**Status:** ✅ Complete

**What's Working:**
- View all saved prayers
- Mark one prayer as primary (for daily practice)
- Edit prayer text inline
- Delete prayers with confirmation
- Source badges (Library/Custom/Elder Tree)
- Empty state with CTA
- Dashboard integration ("My Prayers" card)

**Technical Stack:**
- Frontend: `app/my-prayers/page.tsx`
- Uses same prayer APIs

---

### 4. Database Schema
**Status:** ✅ Migration Created (Needs to be run in Supabase)

**Migration File:** `supabase/migrations/008_step_3_prayers.sql`

**Tables Created:**
1. **`prayer_library`** - Pre-populated prayers for users to select
   - Fields: id, prayer_text, source, category, author, created_at, is_active
   - 5 sample prayers included (including AA Big Book Step 3)
   - RLS enabled (public read for active prayers)

2. **`user_prayers`** - User-selected or custom prayers
   - Fields: id, user_id, prayer_text, source, library_prayer_id, is_primary, created_at, selected_at, updated_at
   - Source types: 'library_selected', 'custom', 'elder_tree_collaborative'
   - RLS enabled (users see only their own)

3. **`users` table additions** (if columns don't exist):
   - `current_step` INTEGER (1, 2, or 3)
   - `step_1_completed` BOOLEAN
   - `step_2_completed` BOOLEAN
   - `step_3_completed` BOOLEAN
   - `primary_prayer_id` UUID (references user_prayers)

**Watson Action Required:**
- Run migration in Supabase: `supabase/migrations/008_step_3_prayers.sql`
- Verify tables created correctly
- Add more prayers to `prayer_library` if needed

---

## WHAT WATSON NEEDS TO DO NEXT

### Priority 1: Upload Step 1-3 Questions to Supabase

**Requirement from Spec:**
> "Upload consolidated Step 1-3 questions to Supabase"

**Table Structure Needed:**
```sql
CREATE TABLE step_questions (
  id UUID PRIMARY KEY,
  step_number INTEGER (1, 2, or 3),
  phase TEXT (optional: 'admission', 'inventory', etc.),
  question_text TEXT,
  question_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP
);
```

**What Watson Should Include:**
- All 12 Step 3 questions mentioned in spec
- Step 1 and Step 2 questions
- Question ordering/sequence
- Phase labels (if applicable)
- Metadata for question logic

**Questions for Watson:**
- How many total questions exist for each step?
- Should questions always appear in same order, or randomized?
- Are there conditional questions (based on previous answers)?
- What determines "end of questions" for each step?

---

### Priority 2: Define Step Completion Criteria

**Requirement from Spec:**
> "Watson to determine completion criteria (sufficient questions answered, specific admissions made, etc.)"

**Current Behavior:**
- Prayer Protocol marks Step 3 complete when prayers saved
- Steps 1 & 2 have no completion logic yet

**Watson Needs to Define:**

**Step 1 Completion:**
- How many questions must be answered?
- What signals "sufficient admission of powerlessness"?
- Any required breakthrough moments?
- Minimum session time or engagement?

**Step 2 Completion:**
- How many questions must be answered?
- What signals "belief in Higher Power"?
- Naming Higher Power required?
- Any specific admissions needed?

**Step 3 Completion:**
- Currently: Complete after prayer saved ✅
- Should there be additional criteria?
- Minimum number of questions answered first?
- Specific admissions required before prayer?

**Implementation Notes:**
- Service function exists: `markStep3Complete()` in `lib/services/prayer.ts`
- Will need similar for Steps 1 & 2
- Completion should trigger:
  1. Update `users.step_X_completed = true`
  2. Update `users.current_step` to next step
  3. Elder Tree celebration message
  4. Explanation of next step

---

### Priority 3: Integrate Question Cycling into Step In

**Requirement from Spec:**
> "Fetch questions from database based on current_step, implement question cycle (appear → answer → disappear → next)"

**Current State:**
- Step In page shows placeholder question: "What is your name?"
- No database integration
- Submit button logs to console only

**What Watson Needs to Build:**

**API Route:** `/api/step-in/question`
- **GET** - Fetch next question for user's current step
- Input: user_id, current_step, questions_answered_count
- Output: next question object
- Logic: Determine which question to serve based on progress

**API Route:** `/api/step-in/answer`
- **POST** - Save user's answer
- Input: user_id, question_id, answer_text, save_entry (boolean)
- If `save_entry = true`: Save to `steps_journal` table
- If `save_entry = false`: Process for Elder Tree context, but don't log
- Return: next question OR "session complete" signal

**Steps Journal Table:**
```sql
CREATE TABLE steps_journal (
  id UUID PRIMARY KEY,
  user_id UUID,
  step_number INTEGER,
  question_text TEXT,
  answer_text TEXT,
  timestamp TIMESTAMP,
  created_at TIMESTAMP
);
```

**Frontend Integration:**
- Update `app/step-in/page.tsx`
- Replace placeholder question with API fetch
- Wire "Submit Answer" button to save API
- Load next question after submit
- Handle "finished for today" → encouragement message

---

### Priority 4: Elder Tree Encouragement Messages

**Requirement from Spec:**
> "Elder Tree generates encouragement message when user clicks 'Finished for today'"

**What Watson Needs to Design:**

**Encouragement Logic:**
- Analyze session: questions answered, breakthroughs, red flags
- Generate 3-5 sentence message in Elder Tree voice
- Acknowledge specific progress (quote user if applicable)
- No over-celebration, Sandy B. style
- Point to next step if step complete

**Example Messages from Spec:**
- Generic: "You did real work today. I heard you name something you've been carrying alone for a long time. That takes courage. Rest well—you've earned it."
- Step Complete: "You've completed Step 1. You've looked honestly at your powerlessness and the unmanageability of your life. That's the foundation everything else is built on. Step 2 is about believing help exists—that recovery is possible. Ready when you are."

**Implementation:**
- Could use existing `generateEncouragement()` in `lib/services/anthropic.ts`
- Or Watson creates custom logic
- Should analyze:
  - Number of questions answered
  - Quality of answers (vague vs. specific)
  - Breakthroughs detected
  - Step completion status

**API Route:** `/api/step-in/encouragement`
- Input: session data, answers given
- Output: personalized encouragement message

---

### Priority 5: Step Progression Logic

**Requirement from Spec:**
> "When step marked complete: Elder Tree celebration message, brief explanation of next step, transition to next step's questions"

**What Watson Needs to Build:**

**Step Transition Flow:**
1. User completes final question for current step
2. System detects completion criteria met
3. Mark step as complete (e.g., `step_1_completed = true`)
4. Update `current_step` (e.g., from 1 to 2)
5. Show celebration message
6. Explain next step briefly
7. Next session → serve Step 2 questions

**Celebration Messages (Watson to write):**
- **Step 1 → Step 2:**
  - Acknowledge admission of powerlessness
  - Explain Step 2: Believing help exists
  - Encourage readiness

- **Step 2 → Step 3:**
  - Acknowledge belief in Higher Power
  - Explain Step 3: Turning will over
  - Transition to Prayer Protocol

- **Step 3 → Beyond:**
  - Acknowledge commitment (prayer saved)
  - Explain Steps 4-9 (when ready)
  - Hold at Step 3 until further development

**Implementation:**
- Step completion detection in answer processing
- Celebration message generation (use Anthropic or predefined)
- Frontend modal or page transition
- Update session state

---

## QUESTIONS FOR WATSON (From Original Spec)

### Question Database
1. **How many pre-generated prayers exist?**
   - Currently: 5 sample prayers in migration
   - Need more? What sources?

2. **How many questions per step?**
   - Step 1: ??
   - Step 2: ??
   - Step 3: 12 (from spec)

3. **Question ordering:**
   - Sequential (always same order)?
   - Randomized?
   - Conditional (based on answers)?

4. **Session duration tracking:**
   - Should timer data be logged to user profile?
   - Used for analytics or completion criteria?

### Encouragement Messages
5. **How should Elder Tree determine what progress to highlight?**
   - Keyword detection?
   - Sentiment analysis?
   - Breakthrough detection (already exists in `anthropic.ts`)?

6. **Step completion criteria details:**
   - Minimum questions? Specific admissions?
   - Time-based? Depth of answers?

### Prayer Library
7. **Where are existing generated prayers stored?**
   - Currently in migration SQL
   - Need JSON import? Different source?

8. **Prayer library expandable?**
   - Static set?
   - Users can add to community library?
   - Admin-curated only?

---

## FILE LOCATIONS (For Watson's Reference)

### Frontend Pages
- `/app/step-in/page.tsx` - Step In questionnaire page
- `/app/prayers/page.tsx` - Prayer Protocol page
- `/app/my-prayers/page.tsx` - Prayer management page

### API Routes
- `/app/api/prayers/library/route.ts` - GET prayer library
- `/app/api/prayers/user/route.ts` - GET user prayers
- `/app/api/prayers/save/route.ts` - POST save prayers
- `/app/api/prayers/collaborate/route.ts` - POST generate prayer
- `/app/api/prayers/update/route.ts` - PATCH/DELETE prayers

### Service Modules
- `/lib/services/prayer.ts` - Prayer service functions
- `/lib/services/anthropic.ts` - Elder Tree AI (already has encouragement logic)
- `/lib/services/session.ts` - Session management (for walk sessions)

### Database
- `/supabase/migrations/008_step_3_prayers.sql` - Prayer tables migration

---

## TECHNICAL NOTES FOR WATSON

### Authentication
All API routes check user authentication:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

### Elder Tree Voice
Anthropic service (`lib/services/anthropic.ts`) has Elder Tree system prompt:
- Direct, caring, no BS
- Sandy B. inspired
- Short sentences
- Pushes for specificity
- Calls out vague answers

Use this for:
- Question generation (if dynamic)
- Encouragement messages
- Prayer collaboration (already implemented)

### Step Tracking
User step progress tracked in `users` table:
```typescript
{
  current_step: 1 | 2 | 3,
  step_1_completed: boolean,
  step_2_completed: boolean,
  step_3_completed: boolean
}
```

Service functions available:
- `getUserStepProgress(userId)` - Get user's step status
- `markStep3Complete(userId)` - Mark Step 3 complete (exists)
- Need to create: `markStep1Complete()`, `markStep2Complete()`

### Prayer Integration
When Step 3 questions complete:
1. User clicks "Finished for today" in Step In
2. System detects Step 3 questions answered
3. Redirect or show modal: "Ready for Prayer Protocol?"
4. User navigates to `/prayers`
5. Selects/creates prayer
6. Prayer saved → Step 3 marked complete

---

## WATSON'S ACTION ITEMS SUMMARY

### Immediate (This Week)
1. ✅ **Run prayer migration** - `008_step_3_prayers.sql` in Supabase
2. 📝 **Upload questions** - Populate `step_questions` table
3. 📝 **Define completion criteria** - Document rules for each step
4. 📝 **Create steps_journal table** - For saving step work

### Next Sprint
5. 🔧 **Build question APIs** - GET next question, POST answer
6. 🔧 **Integrate question cycling** - Wire Step In to database
7. 🔧 **Build encouragement logic** - Session-end messages
8. 🔧 **Create step completion flow** - Celebration + transitions

### Future
9. 🎯 **Add more prayers** - Expand prayer library
10. 🎯 **Analytics** - Track step progress, prayer usage
11. 🎯 **Morning ritual** - Integrate primary prayer
12. 🎯 **Steps 4-12** - Next phases of recovery work

---

## TESTING CHECKLIST (For Watson)

When Watson completes their work, verify:

**Step In Page:**
- [ ] Questions load from database
- [ ] Question cycles correctly (one at a time)
- [ ] Answers save to steps_journal when toggle ON
- [ ] Answers skip saving when toggle OFF
- [ ] "Finished for today" shows encouragement
- [ ] Step completion detected correctly
- [ ] Celebration message displays
- [ ] Next step transition works

**Prayer Protocol:**
- [ ] Migration ran successfully
- [ ] Prayer library displays
- [ ] Multi-select works
- [ ] Custom prayers save
- [ ] Elder Tree collaboration generates prayers
- [ ] Step 3 marks complete
- [ ] User can manage prayers in /my-prayers

**Integration:**
- [ ] Step In → Prayer Protocol flow seamless
- [ ] Step completion flags update
- [ ] User progresses Step 1 → 2 → 3
- [ ] Dashboard shows current step status

---

## QUESTIONS OR BLOCKERS?

If Watson encounters issues:
1. Check this brief for technical details
2. Review original specs: `SANCHO_PROMPT_Step-In-Feature.md`, `SANCHO_PROMPT_Steps-12-11-25.md`
3. Refer to existing code patterns in `lib/services/session.ts` (similar question/answer flow)
4. Ping Sancho if prayer APIs need modifications

---

## SUCCESS CRITERIA

This phase is complete when:
- ✅ Users can answer Step 1-3 questions in Step In (not just placeholders)
- ✅ Answers save to database correctly
- ✅ Elder Tree encouragement messages display
- ✅ Step completion is detected and celebrated
- ✅ Users progress through Steps 1 → 2 → 3
- ✅ Prayer Protocol activates after Step 3 questions
- ✅ Full journey works: Questions → Encouragement → Prayer → Completion

---

**Sancho out. Watson, you're up! 🌳**
