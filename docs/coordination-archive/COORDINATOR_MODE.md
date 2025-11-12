# Coordinator Mode - Claude Code Web

**Activate Coordinator Agent directly in Claude Code conversations**

---

## 🎯 How to Use Coordinator Mode

Instead of setting up a separate Claude.ai Project, you can activate Coordinator mode right in your Claude Code chat by saying:

**Activation Phrase:**
```
/coordinator mode
```

Or simply:
```
@coordinator: [your request]
```

---

## 📋 Coordinator Commands

### Planning & Strategy
```
@coordinator: Plan the session history feature
@coordinator: What should we build next?
@coordinator: Break down [feature name] into tasks
@coordinator: Show me the critical path to launch
```

### Status & Tracking
```
@coordinator: What's our current status?
@coordinator: Show active work streams
@coordinator: What's blocking us?
@coordinator: Update me on progress
```

### Task Management
```
@coordinator: What tasks are ready to start?
@coordinator: Assign me a task as [Frontend/Backend/DB/AI/QA] agent
@coordinator: I finished task #5, what's next?
@coordinator: Task #3 is blocked because [reason]
```

### Decision Support
```
@coordinator: Should we use timeline or list view for history?
@coordinator: What's the best approach for [problem]?
@coordinator: I need help deciding between [option A] and [option B]
```

---

## 🔄 Switching Modes

**Coordinator Mode** (Planning & Oversight):
```
@coordinator: Plan the inventory migration
```
Claude Code responds as Elder Architect (Coordinator)

**Builder Mode** (Implementation):
```
I'll be the Frontend Agent now. Show me my tasks.
```
Claude Code switches to Frontend Agent role

**Back to Coordinator**:
```
@coordinator: I finished the UI, update status
```

---

## 💡 Example Conversation Flow

**You:**
```
@coordinator: I want to build the session history page.
Users should see their past walks, mining, and inventories.
Timeline view preferred.
```

**Claude Code (as Coordinator):**
```
## Feature: Session History Page

### Analysis
{Analyzes requirements, checks current state}

### Task Breakdown
- DB Agent: Design query (30 min)
- Backend Agent: Build API (1 hour)
- Frontend Agent: Build UI (2 hours)
- QA Agent: Test (30 min)

### Questions
- Pagination needed for 100+ sessions?

**Approve to proceed?**
```

**You:**
```
Approved. I'll start as DB Agent.
```

**Claude Code (switches to DB Agent role):**
```
Reading WORK_QUEUE.md task #3...

I'll create the session history query function.
{Implements the code}

Task complete! Documented in AGENT_HANDOFFS.md.
Backend Agent is now unblocked.
```

**You:**
```
@coordinator: Update task #3 as complete
```

**Claude Code (back to Coordinator):**
```
✅ Task #3 marked complete
⏳ Task #2 (Backend) now Ready (was Blocked)

Updated WORK_QUEUE.md
Ready to proceed with Backend Agent?
```

---

## 🎭 How It Works

**Behind the scenes, Claude Code:**
1. Reads `.coordination/COORDINATOR_CONTEXT.md` for current state
2. Reads `.coordination/WORK_QUEUE.md` for tasks
3. Reads `.coordination/AGENT_HANDOFFS.md` for dependencies
4. Responds according to the Coordinator role

**When you're building:**
1. Reads the relevant agent guide (e.g., `agents/FRONTEND_AGENT.md`)
2. Reads task details from `WORK_QUEUE.md`
3. Implements as that specialized agent
4. Updates state files
5. Commits work

---

## 📊 State Persistence

All state lives in the `.coordination/` files:
- Your conversations with Coordinator update these files
- Progress is tracked in markdown
- Git commits preserve history
- You can switch between web and terminal seamlessly

---

## 🚀 Quick Start

**Right now, in this chat, try:**
```
@coordinator: Show me our current status
```

**Then:**
```
@coordinator: What's the highest priority task I can start?
```

**Then:**
```
I'll be the [Agent Name] Agent. Assign me my task.
```

**Build it, then:**
```
@coordinator: Task #X complete. Update status.
```

---

## 💪 Benefits

**All in One Place:**
- No switching between Claude.ai Projects
- Conversation history in Claude Code
- Direct access to files
- Can code immediately

**Flexible:**
- Switch between Coordinator and Builder roles
- Work on multiple features in parallel
- Track everything in markdown files

**Persistent:**
- State files survive across sessions
- Git history tracks all changes
- Can resume anytime

---

## 🎯 Ready to Try?

Just say in this chat:

```
@coordinator: Show me what we should build next
```

And I'll activate Coordinator mode and respond accordingly!

---

**This is your coordination system, right here, right now.** 🌳
