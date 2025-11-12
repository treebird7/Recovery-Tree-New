SANCHO BUILD PROMPT: "Step In" Feature
12 Steps Journal & Questionnaire Page
Priority: High Status: Ready for implementation Timeline: Base page structure first, question logic after database upload

OVERVIEW
Replace the "Start New Walk" page with a new "Step In" feature—a dark-themed, question-driven 12-step journal interface. Users will work through step-appropriate questions one at a time, save responses to their personal steps journal, and track their recovery progress through the 12-step program.

PAGE SPECIFICATIONS
Layout & Styling
Page Name: "Step In" Sub-header: "12 Steps Journal and Questionnaire" Theme: Dark background (match URG mining color schema exactly) Screen Type: Full-screen immersive experience Navigation: Replace existing "Start New Walk" route completely

Core UI Components
1. Question Display Area
	•	Position: Center of screen, prominent
	•	Behavior: Single question displayed at a time
	•	Font Size: Large, readable
	•	Styling: High contrast against dark background
	•	Question Source: Will be populated from database (Phase 2)
	•	Display Pattern: Question appears → user answers → question disappears → next question appears
2. Answer Input Area
	•	Type: Text input (textarea for longer responses)
	•	Placeholder: "Your response here..."
	•	Character limit: None enforced (user can write as much as needed)
	•	Behavior: Clear after submission (question disappears)
	•	Accessibility: Focus on input by default when question appears
3. Save Entry Toggle
	•	Default State: ON ("Save this entry")
	•	Position: Below answer input, left-aligned
	•	Toggle Options:
	◦	ON (checked): "Save this entry" → response saved to steps journal with timestamp
	◦	OFF (unchecked): "Don't save" → live conversation with Elder Tree only, not logged
	•	UI Style: Standard toggle switch
	•	Label: Clear, visible text
4. Optional Timer
	•	Position: Top-right corner of screen
	•	Style: Subtle, non-intrusive (match URG mining timer if present)
	•	Functionality:
	◦	User can toggle ON/OFF (not mandatory)
	◦	Displays elapsed session time
	◦	Does not pause session or interrupt flow
	◦	No time limit—purely informational
	•	Display: MM:SS format
5. Action Button
	•	Button Name: "Finished for today"
	•	Position: Bottom center of screen
	•	Style: Clear, actionable button (match app's primary CTA style)
	•	Behavior on Click:
	◦	Trigger Elder Tree encouragement message (see Section 3)
	◦	Mark current session as complete
	◦	Prepare for next session or return to home
	◦	Do NOT mark step as complete yet (that happens after meaningful step work, determined by backend logic)

USER FLOW
Question Lifecycle
	1	Question Appears
	◦	Single question displayed
	◦	All previous questions hidden
	◦	Input field ready for response
	2	User Answers
	◦	User types response in textarea
	◦	Can see toggle for "Save this entry" / "Don't save"
	◦	No character limit
	3	User Submits (on pressing Enter or Submit, TBD)
	◦	If "Save this entry" is ON:
	▪	Response logged to steps_journal with: {question, answer, date, timestamp, step_number}
	▪	Confirmation visual (brief flash or subtle feedback)
	◦	If "Save this entry" is OFF:
	▪	Response processed but NOT logged to journal
	▪	Elder Tree processes response for contextual next question
	▪	No persistent record
	4	Next Question Appears
	◦	Previous question + answer disappear
	◦	New appropriate question displays
	◦	Cycle repeats
	5	Session End
	◦	User clicks "Finished for today"
	◦	Elder Tree generates encouragement message (see Section 3)
	◦	Session marked complete in UI
	◦	Option to return home or end session

STEP TRACKING & PROGRESSION
Step Management
Current Step Tracking:
	•	Backend tracks user.current_step (1, 2, or 3)
	•	Questions served from database filtered by step_number
	•	User sees only questions appropriate to their current step
Step Completion Logic:
	•	NOT automatic (user must complete meaningful work)
	•	Backend tracks user.step_1_completed, user.step_2_completed, user.step_3_completed as boolean flags
	•	Watson to determine completion criteria (sufficient questions answered, specific admissions made, etc.)
	•	When step marked complete:
	◦	Elder Tree celebration message
	◦	Brief explanation of next step
	◦	Transition to next step's questions
	◦	Same pattern for Step 1→2 and Step 2→3 transitions

ELDER TREE ENCOURAGEMENT MESSAGE
Trigger: User Clicks "Finished for today"
Message Content:
	•	Acknowledge work done (generic but genuine)
	•	Point out any significant progress or breakthroughs (if applicable)
	•	Use tact and respect—no over-celebration
	•	3-5 sentences maximum
	•	Tone: Warm sponsor voice (Sandy B. inspired)
Examples of Progress Recognition:
	•	User admits powerlessness for first time
	•	User identifies pattern they've been avoiding
	•	User names their higher power
	•	User chooses a prayer
Example Message:
"You did real work today. I heard you name something you've been carrying alone for a long time. That takes courage. Rest well—you've earned it."
Step Completion Message (Different):
"You've completed Step 1. You've looked honestly at your powerlessness and the unmanageability of your life. That's the foundation everything else is built on. Step 2 is about believing help exists—that recovery is possible. Ready when you are."

BACKEND DATABASE INTEGRATION
User Schema Updates Required
{
  user_id: string,
  current_step: number (1, 2, or 3),
  step_1_completed: boolean (default: false),
  step_2_completed: boolean (default: false),
  step_3_completed: boolean (default: false),
  
  // Steps Journal (all saved entries)
  steps_journal: [
    {
      question: string,
      answer: string,
      date: ISO_timestamp,
      step_number: number
    }
  ],
  
  // Step 2 Artifact: Higher Power Definition
  higher_power_definition: string (optional, nullable),
  
  // Step 3 Artifacts: Prayers
  prayers: [
    {
      prayer_text: string,
      source: "generated" | "custom" | "elder_tree_collaborative",
      created_date: ISO_timestamp
    }
  ]
}
Supabase Tables
Assuming Supabase setup:
	•	users table: Add columns for current_step, step_1_completed, step_2_completed, step_3_completed
	•	steps_journal table: Create new table with foreign key to users, fields: question, answer, timestamp, step_number
	•	prayers table: Create new table with foreign key to users, fields: prayer_text, source, created_date

IMPLEMENTATION PHASES
Phase 1: BASE PAGE STRUCTURE (SANCHO - NOW)
	•	[ ] Create "Step In" page component
	•	[ ] Replace "Start New Walk" route
	•	[ ] Build UI layout (dark theme, centered)
	•	[ ] Create question display container
	•	[ ] Create answer input (textarea)
	•	[ ] Build save toggle (ON by default)
	•	[ ] Add optional timer (top-right, can toggle)
	•	[ ] Add "Finished for today" button (bottom)
	•	[ ] No question logic yet—use placeholder text
	•	[ ] No database integration yet
Example Placeholder State:
Question: "What is your name?"
[textarea input field]
☑ Save this entry
[Timer: 00:15]
[Finished for today button]
Phase 2: QUESTION DATABASE (WATSON → SUPABASE)
	•	[ ] Upload consolidated Step 1-3 questions to Supabase
	•	[ ] Structure: {step_number, phase, question_text, question_id}
	•	[ ] Create question ordering/sequence logic
	•	[ ] Document database schema
Phase 3: QUESTION LOGIC (SANCHO)
	•	[ ] Fetch questions from database based on current_step
	•	[ ] Implement question cycle (appear → answer → disappear → next)
	•	[ ] Wire save toggle to steps_journal logging
	•	[ ] Implement timestamp capture
	•	[ ] Show/hide questions based on save preference
	•	[ ] Handle end-of-step detection
Phase 4: ELDER TREE ENCOURAGEMENT (WATSON → SANCHO)
	•	[ ] Watson designs encouragement message logic
	•	[ ] Sancho integrates Elder Tree response generation
	•	[ ] Display encouragement on "Finished for today" click
Phase 5: STEP COMPLETION & TRANSITIONS (WATSON → SANCHO)
	•	[ ] Define step completion criteria (Watson)
	•	[ ] Implement step completion detection (Sancho)
	•	[ ] Build step transition flow with celebration message
	•	[ ] Update user.current_step and completion flags
Phase 6: STEP 3 PRAYER FEATURES (WATSON → SANCHO)
	•	[ ] Watson designs prayer selection/creation UX
	•	[ ] Integrate existing prayer library
	•	[ ] Build custom prayer input interface
	•	[ ] Add Elder Tree collaborative prayer writing
	•	[ ] Wire prayers to backend storage

STYLING REFERENCE
Dark Theme (Match URG Mining)
	•	Background: [exact hex from URG mining component]
	•	Text: High contrast (white/light gray)
	•	Borders: Subtle, dark
	•	Button: Primary color (match app CTA)
	•	Input: Dark with light border, high contrast text
Typography
	•	Question: Large, bold (reference size from urge mining)
	•	Input placeholder: Muted color
	•	Labels: Medium weight, clear
	•	Button text: Bold, actionable

EDGE CASES & BEHAVIOR
What Happens If...
User navigates away mid-session?
	•	Current answer (unsaved) is lost
	•	Session state is lost
	•	User returns to Step In → continue with next question
	•	Unsaved progress is not recovered
User toggled "Don't save" but wants to save later?
	•	No recovery option—answer not logged
	•	User must re-answer question if they want it saved
Timer is running and user finishes?
	•	Timer stops on "Finished for today" click
	•	Session duration captured (optional: log to analytics)
User reaches end of all Step 1 questions but hasn't completed step yet?
	•	Questions cycle back to beginning (or show new variations, TBD)
	•	OR Watson determines user is ready to complete Step 1
User on Step 1, then step marked complete—what happens to old questions?
	•	Questions archive (can be reviewed in history)
	•	Step 2 questions now appear on next session
	•	Step 1 questions no longer served

ACCEPTANCE CRITERIA
Base Page (Phase 1) Complete When:
	•	[ ] "Step In" page renders with dark theme
	•	[ ] Single question displays with placeholder text
	•	[ ] Textarea accepts user input
	•	[ ] Save toggle visible and functional (toggles between states)
	•	[ ] Optional timer displays and can be toggled ON/OFF
	•	[ ] "Finished for today" button visible and clickable
	•	[ ] Button click shows confirmation (TBD: confirmation UX)
	•	[ ] Page is responsive (mobile, tablet, desktop)
	•	[ ] Navigation works (replaces Start New Walk)
Full Feature (All Phases) Complete When:
	•	[ ] Questions cycle correctly one at a time
	•	[ ] Save toggle properly logs/skips journal entries
	•	[ ] Timestamps accurate on all saved entries
	•	[ ] Steps journal accessible for user review
	•	[ ] Step completion marks backend correctly
	•	[ ] Elder Tree messages display appropriately
	•	[ ] Step transitions with celebration message
	•	[ ] Step 3 prayer features functional
	•	[ ] All data persists to Supabase correctly

QUESTIONS FOR WATSON
	•	Encouragement message logic: How should Elder Tree determine what progress to highlight?
	•	Step completion criteria: What signals that user is ready to complete a step?
	•	Prayer library: Where are existing generated prayers stored? What's the format?
	•	Question ordering: Should questions always appear in same order, or randomized?
	•	Session duration: Should timer data be logged to user profile?

NOTES
	•	This is a foundation for long-term recovery support
	•	Privacy-first: All step work logged to user's account, separate from billing
	•	Each question should feel like a genuine sponsor conversation
	•	No rush—users move at their own pace through steps
	•	Elder Tree voice consistency critical: Direct, caring, no BS, no over-celebration
