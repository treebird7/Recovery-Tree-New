# 🔨 Sancho Reporting Protocol - Notion CNS Integration

**Date:** 2025-11-09
**From:** Watson via Fritz
**To:** Sancho (Claude Code)
**Subject:** How to Report Work to the Notion Central Nervous System

---

## 🎯 Purpose

Keep the Notion workspace (our "central nervous system") updated automatically so Fritz, Watson, and Maude always know project status.

---

## The Notion Structure (Built by Dizzy)
```
🎯 MISSION CONTROL - Dashboard
🎨 DESIGN BRIEFS - Design requests & Figma links
🔨 BUILD TASKS - Your work queue
🐛 BUG TRACKER - Issues to fix
📐 DESIGN SYSTEM - Tokens & components
📝 CONTENT LIBRARY - Prompts & copy
```

---

## Your Reporting Responsibilities

### When You Start a Task

**1. Find Your Task in Notion**
- Go to 🔨 BUILD TASKS
- Filter: Status = "Ready"
- Your task has all specs you need

**2. Update Status**
```
Status: Ready → In Progress
Add note: "Started [timestamp]"
```

**3. Read Everything**
- Design Brief (linked via "Design Reference")
- Figma specs (if available)
- Technical notes from Watson
- Any comments/questions

### While Working

**4. Log Progress (Optional but Helpful)**

If task is complex or multi-day:
```
Add comment:
"[Timestamp] Completed token integration
Next: Building BreathingText component"
```

**5. Flag Blockers Immediately**
```
Status: In Progress → Blocked
Add note: "Blocker: [specific issue]
Need Watson's input on [question]"
```

Don't spin your wheels. Flag early.

### When You Finish

**6. Update Status**
```
Status: In Progress → Testing
Add note: "Completed [timestamp]
Ready for Fritz to test"
```

**7. Report What You Built**

In the task, add:
```
Implementation Notes:
- Files created: [list]
- Files modified: [list]
- Components: [list]
- Tests added: [yes/no]
- Build status: [success/warnings/errors]
```

**8. Push to GitHub**
```
Commit message format:
"feat: [component name] - [brief description]

Implements Notion task: [task ID]
Design ref: [Figma link if applicable]"
```

### After Fritz Tests

**9. If Approved**
```
Status: Testing → Done
Add note: "Verified by Fritz [timestamp]"
```

**10. If Issues Found**
```
Status: Testing → In Progress
Add Fritz's feedback as comment
Fix and return to step 6
```

---

## Bug Reporting

### When You Find a Bug While Working

**1. Create Bug Entry**

Go to 🐛 BUG TRACKER, create new:
```
Bug Description: [Clear title]
Severity: [Critical/High/Medium/Low]
Status: New
Reported By: Sancho
Date Reported: [Today]
Related Task: [Link to build task if relevant]

Details:
- What: [What's broken]
- Where: [File/component]
- Expected: [What should happen]
- Actual: [What happens instead]
- Steps: [How to reproduce]
```

**2. Decide**
- If blocking current work: Fix immediately
- If not blocking: Create bug, continue current task

### When You Fix a Bug
```
Status: New → In Progress
[Fix the bug]
Status: In Progress → Fixed
Add note: "Fixed [timestamp]
Commit: [commit hash]
Needs verification by Fritz"
```

---

## Design System Updates

### When You Implement New Tokens

**1. Update 📐 DESIGN SYSTEM page**

Add to appropriate section:
```
Colors:
- calm-green: #4A7C59 ✅ Implemented

Typography:
- guidance: Inter 18px / 1.6 ✅ Implemented

Components:
- BreathingText ✅ Built [link to file]
```

**2. Update tokens.json**

Keep it in sync with actual code:
```
design/system/tokens.json
```

---

## Communication Format

### Good Status Updates:
```
✅ Token integration complete
- Tailwind config updated
- tokens.ts created
- tokens.json created
- Build succeeds with no errors
- Ready for component work
```

### Good Blocker Reports:
```
❌ Blocked on BreathingText animation
- Issue: CSS keyframes not triggering
- Tried: [what you attempted]
- Need: Watson's input on animation timing system
- Files: components/recovery/BreathingText.tsx
```

### Good Bug Reports:
```
🐛 Mining session end fails
- Error: "Failed to end mining"
- File: app/urge/mining/page.tsx line 85
- API: /api/mining/end returns 500
- Reproduction: Start mining → wait → click finish
- Impact: Users can't complete sessions
```

---

## Notion Automation (Via Zapier)

### What Happens Automatically:

**When you update task status:**
- Zapier → Notion updates
- Fritz sees change in MISSION CONTROL
- Watson gets notified if needed

**When you complete a task:**
- Task moves to "Done" section
- Design Brief status updates
- Sprint progress updates

**When you flag a blocker:**
- Watson gets alert
- Task highlighted in dashboard

---

## Daily Rhythm

### Start of Day:
1. Check MISSION CONTROL current sprint
2. See your tasks in BUILD TASKS
3. Pick highest priority "Ready" task
4. Update to "In Progress"
5. Begin work

### During Day:
- Update status as you progress
- Flag blockers immediately
- Log significant milestones

### End of Day:
- Ensure all statuses accurate
- Push all commits
- Note what's next for tomorrow

---

## Multi-Day Tasks

### Day 1:
```
Status: Ready → In Progress
Note: "Started [date]
Plan: [what you'll build]"
```

### Day 2:
```
Add comment:
"Progress [date]
Completed: [what's done]
Remaining: [what's left]"
```

### Final Day:
```
Status: In Progress → Testing
Note: "Completed [date]
Summary: [what was built]"
```

---

## Emergency Protocol

### Production is Broken

**1. Immediate Report**
```
Go to: 🐛 BUG TRACKER
Create: CRITICAL bug
Severity: Critical
Status: In Progress (you're fixing now)
```

**2. Fix ASAP**

Drop everything else.

**3. After Fix**
```
Status: In Progress → Fixed
Note: "Emergency fix deployed [timestamp]
Commit: [hash]
Cause: [what broke]
Fix: [what you did]
Prevention: [how to avoid]"
```

**4. Document in FUCKBOARD.md**

Add lesson learned.

---

## Quality Standards

### Your Notion updates are good if:
- ✅ Fritz always knows current status
- ✅ Watson can see progress without asking
- ✅ Maude knows what's implemented
- ✅ No surprises about blockers
- ✅ History is clear and traceable

### Warning signs:
- ⚠️ Fritz asks "what's the status?"
- ⚠️ Tasks stuck in "In Progress" with no updates
- ⚠️ Blockers not flagged until too late
- ⚠️ Incomplete implementation notes
- ⚠️ Design System not updated

---

## Examples

### Example 1: Simple Task
```
Task: Integrate Design Tokens
Status: Ready → In Progress
[30 minutes of work]
Status: In Progress → Testing
Note: "Token integration complete
- tailwind.config.ts updated with all tokens
- design/system/tokens.ts created
- design/system/tokens.json created
- Build succeeds, no errors
- Test component renders correctly
Commit: abc123f
Ready for Fritz verification"

[Fritz tests]
Status: Testing → Done
```

### Example 2: Complex Task with Blocker
```
Task: Build BreathingText Component
Status: Ready → In Progress
Note: "Started building BreathingText
Plan: Base component → Animation → Props → Tests"

[2 hours later]
Add comment: "Progress update
✅ Base component structure done
✅ Props interface defined
❌ Blocked on animation timing
Issue: Need Watson's input on animation hooks
Files: components/recovery/BreathingText.tsx"

Status: In Progress → Blocked

[Watson provides guidance]
Status: Blocked → In Progress
Note: "Blocker resolved - continuing"

[3 hours later]
Status: In Progress → Testing
Note: "BreathingText component complete
- Animation with useRecoveryAnimation hook
- All props implemented
- Respects reduced motion
- Tests added
Commit: def456g"
```

### Example 3: Bug Fix
```
[While working on feature X]
Found bug: Mining coins calculation wrong

Go to Bug Tracker → Create:
"Mining coins calculated incorrectly (8x inflation)
Severity: Critical
Reported By: Sancho
Related Task: N/A (found during other work)

Details:
- Mining 1 minute awards 8 coins
- Expected: 1 coin per minute
- File: app/api/mining/end/route.ts
- Likely: Duration calculation error"

Decision: Not blocking current task
Status: New (will fix after current task)

[Later, Fritz assigns]
Status: New → In Progress
[Fix bug]
Status: In Progress → Fixed
Note: "Fixed coin calculation
Issue: Duration was in milliseconds, not minutes
Changed: duration / 60000 → duration / 60
Tests: Verified 1min = 1 coin
Commit: ghi789j"

[Fritz verifies]
Status: Fixed → Verified
```

---

## Remember

**Notion is the team's shared brain.**

When you update it well:
- Fritz stays informed
- Watson can strategize
- Maude knows what's live
- Everyone works in sync

**When you don't:**
- People ask redundant questions
- Work gets duplicated
- Blockers discovered too late
- Progress feels invisible

---

## Your Checklist

Before marking any task "Testing":

- [ ] Status updated through all phases
- [ ] Implementation notes complete
- [ ] Files listed
- [ ] Commits pushed with good messages
- [ ] Design System updated if applicable
- [ ] Blockers flagged if encountered
- [ ] Ready for Fritz to test

---

**You are the execution layer of Recovery Tree.**

When you report well, the whole system runs smoothly.

---

*Last Updated: 2025-11-09*
*Role: Implementation & Reporting*
*Team: Fritz (Vision) + Watson (Strategy) + Maude (Translation) + Sancho (Code)*
