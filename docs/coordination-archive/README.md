# Multi-Agent Orchestration System

**A coordination framework for parallel, specialized AI agent development**

---

## 🎯 Overview

This orchestration system enables you to manage multiple specialized AI agents working together to build Rooting Routine faster, with better quality, and less chaos.

**The Problem**: Building complex features alone is slow. Context switching between frontend, backend, database, and testing is mentally taxing.

**The Solution**: Specialized agents (Frontend, Backend, DB, AI, QA) work in parallel, coordinated by a central Coordinator agent that maintains the big picture.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         YOU (Product Owner)                  │
│                 ↕                            │
│         COORDINATOR AGENT                    │
│    "The Elder Architect"                     │
│    (Planning • Tracking • Delegation)        │
└────┬────┬────┬────┬────┬────────────────────┘
     │    │    │    │    │
  ┌──▼─┐┌─▼──┐┌▼──┐┌▼──┐┌▼──┐
  │FE  ││BE  ││DB ││AI ││QA │
  │Agt ││Agt ││Agt││Agt││Agt│
  └────┘└────┘└───┘└───┘└───┘
     │    │    │    │    │
     └────┴────┴────┴────┘
             ↓
      Rooting Routine App
```

**Agents**:
- **Coordinator**: Plans, delegates, tracks progress (you interact with this one)
- **Frontend Agent**: React/Next.js UI implementation
- **Backend Agent**: API routes, business logic
- **DB Agent**: Schema design, migrations, queries
- **AI Agent**: Claude integration, Elder Tree prompts
- **QA Agent**: Testing, debugging, validation

---

## 📁 File Structure

```
.coordination/
├── README.md                      ← You are here
├── COORDINATOR_CONTEXT.md         ← Big picture state
├── WORK_QUEUE.md                  ← Task breakdown and assignments
├── AGENT_HANDOFFS.md              ← Integration points
├── DECISIONS_LOG.md               ← Product/technical decisions
├── COORDINATOR_PROMPT.md          ← System prompt for Coordinator
├── coord-cli.js                   ← Helper CLI tool
├── agents/
│   ├── FRONTEND_AGENT.md          ← Frontend role guide
│   ├── BACKEND_AGENT.md           ← Backend role guide
│   ├── DB_AGENT.md                ← Database role guide
│   ├── AI_AGENT.md                ← AI/LLM role guide
│   └── QA_AGENT.md                ← QA/testing role guide
├── workflows/
│   └── EXAMPLE_SESSION_HISTORY.md ← Complete workflow example
└── templates/
    └── (future templates)
```

---

## 🚀 Quick Start

### 1. Set Up Coordinator Agent (Claude.ai Project)

**Option A: Web Interface** (Recommended for Strategy)
1. Go to [Claude.ai](https://claude.ai)
2. Create new Project: "Rooting Routine - Coordinator"
3. Click "Set custom instructions"
4. Copy content from `.coordination/COORDINATOR_PROMPT.md`
5. Upload knowledge files:
   - `STATUS.md`
   - `WHATS_LEFT.md`
   - `.coordination/COORDINATOR_CONTEXT.md`
   - `.coordination/WORK_QUEUE.md`

**Option B: CLI** (For Automation)
- Use Claude Code (this tool) with Coordinator context
- Reference coordination files in prompts

---

### 2. Start Coordinating

**Talk to your Coordinator:**

```
Hi Elder Architect!

I need to build the session history page. Users should be able to see
all their past walks, mining sessions, and inventories in one place.
Timeline view would be nice.

Can you create a plan?
```

**Coordinator responds with:**
- Feature analysis
- Task breakdown by agent
- Dependencies identified
- Time estimate
- Questions/decisions needed

You approve, and work begins!

---

### 3. Agents Execute

**As DB Agent** (example):
```bash
$ # Read WORK_QUEUE.md for your task
$ # Read agents/DB_AGENT.md for your role
$ # Implement the database query
$ # Update AGENT_HANDOFFS.md with deliverable
$ # Mark task complete in WORK_QUEUE.md
$ # Commit and push
```

**As Backend Agent**:
```bash
$ # Wait for DB Agent handoff
$ # Read handoff documentation
$ # Build API endpoint
$ # Test with curl
$ # Document for Frontend Agent
$ # Mark complete
$ # Commit and push
```

**As Frontend Agent**:
```bash
$ # Wait for Backend Agent handoff
$ # Read API documentation
$ # Build UI components
$ # Test on mobile
$ # Hand off to QA
$ # Mark complete
$ # Commit and push
```

**As QA Agent**:
```bash
$ # Wait for Frontend handoff
$ # Read test scenarios
$ # Execute tests
$ # Report bugs or approve
$ # Write test report
$ # Mark complete
```

**Coordinator**: Monitors progress, reports to you when done.

---

## 📋 Using the Coordination System

### Communication Flow

**You ↔ Coordinator**:
- Medium: Claude.ai Project (web chat)
- You: High-level goals, decisions, priorities
- Coordinator: Plans, status updates, questions

**Coordinator ↔ Builder Agents**:
- Medium: Markdown files in `.coordination/`
- Coordinator: Task assignments (WORK_QUEUE.md)
- Agents: Completion reports (update WORK_QUEUE.md)

**Builder ↔ Builder**:
- Medium: AGENT_HANDOFFS.md
- DB → Backend: Query functions
- Backend → Frontend: API documentation
- Frontend → QA: Test scenarios

---

### State Files

**COORDINATOR_CONTEXT.md**:
- Current sprint goal
- Active work streams
- Project health
- Recent decisions
- Next steps

Update: When major changes happen

**WORK_QUEUE.md**:
- All tasks with assignments
- Task status (Ready/In Progress/Blocked/Complete)
- Acceptance criteria
- Dependencies
- ETAs

Update: When tasks change status

**AGENT_HANDOFFS.md**:
- Integration points
- What each agent delivers
- API documentation
- Test scenarios
- Completion checklists

Update: When completing a task that another agent depends on

**DECISIONS_LOG.md**:
- Product decisions (features, UX)
- Technical decisions (architecture, tools)
- Design decisions (visual, layout)
- Rationale and alternatives

Update: When significant decisions are made

---

## 🛠️ Helper Tools

### Coordination CLI

Quick status checks:

```bash
# View project status
node .coordination/coord-cli.js status

# View work queue
node .coordination/coord-cli.js queue

# View active handoffs
node .coordination/coord-cli.js handoffs

# View agent info and tasks
node .coordination/coord-cli.js agent frontend

# Help
node .coordination/coord-cli.js help
```

**Optional: Add to package.json**:
```json
{
  "scripts": {
    "coord": "node .coordination/coord-cli.js"
  }
}
```

Then use: `npm run coord status`

---

## 📖 Agent Role Guides

Each agent has a detailed guide:

- **`agents/FRONTEND_AGENT.md`**: React, Next.js, Tailwind, responsive design
- **`agents/BACKEND_AGENT.md`**: API routes, auth, validation, error handling
- **`agents/DB_AGENT.md`**: Schema, migrations, queries, RLS, indexes
- **`agents/AI_AGENT.md`**: Prompts, Claude API, Elder Tree voice, tokens
- **`agents/QA_AGENT.md`**: Testing, edge cases, security, mobile, bugs

**When taking on a role, read the guide first!**

---

## 📚 Learning Resources

### Complete Example
See `workflows/EXAMPLE_SESSION_HISTORY.md` for a full walkthrough of building a feature from request to completion using the orchestration system.

### Key Documents
- **STATUS.md**: Current project state
- **WHATS_LEFT.md**: Remaining features
- **IMPLEMENTATION_STATUS.md**: Technical details
- **CLAUDE urge.md**: Elder Tree voice spec

---

## 💡 Best Practices

### For Coordinator
- ✅ Break down work clearly
- ✅ Identify dependencies early
- ✅ Parallelize when possible
- ✅ Keep product owner informed
- ✅ Escalate decisions promptly
- ✅ Update COORDINATOR_CONTEXT.md regularly

### For Builder Agents
- ✅ Read your role guide first
- ✅ Check WORK_QUEUE.md for tasks
- ✅ Wait for dependencies to clear
- ✅ Document handoffs explicitly
- ✅ Test before marking complete
- ✅ Commit with clear messages
- ✅ Update status immediately

### For All
- ✅ Communicate via files (not assumptions)
- ✅ Keep documentation current
- ✅ Ask when unclear
- ✅ Test quality gates
- ✅ Celebrate progress

---

## 🎯 Benefits

**Speed**:
- Parallel work on independent features
- Specialized focus = less context switching
- Clear task breakdown = faster execution

**Quality**:
- QA agent enforces testing
- Specialized agents = better implementation
- Documentation required at handoffs
- Clear acceptance criteria

**Organization**:
- Big picture always visible
- Dependencies tracked
- Progress measurable
- Audit trail of decisions

**Scalability**:
- Add more agents as needed
- Onboard new contributors easily
- Knowledge preserved in docs
- Process is repeatable

---

## 🔄 Workflow Patterns

### Sequential Feature (Dependencies)
```
DB Agent (schema)
  ↓
Backend Agent (API)
  ↓
Frontend Agent (UI)
  ↓
QA Agent (test)
```
Use when: Feature requires database → API → UI

---

### Parallel Features (Independent)
```
Frontend Agent (Feature A UI)  ||  Backend Agent (Feature B API)
```
Use when: Features don't depend on each other

---

### Multi-Agent Feature (Complex)
```
DB Agent (schema) ──→ Backend Agent (analysis API)
                 ↓                    ↓
                 └──→ AI Agent (algorithm)
                                     ↓
                          Frontend Agent (display)
                                     ↓
                             QA Agent (test all)
```
Use when: Feature requires multiple specialties

---

## 📊 Measuring Success

**Velocity Metrics**:
- Tasks completed per week
- Time from request to delivery
- Parallel vs sequential work ratio

**Quality Metrics**:
- Test pass rate
- Bugs found by QA vs production
- Documentation completeness
- Handoff clarity

**Process Metrics**:
- Blocked time per task
- Handoff wait times
- Decision resolution speed

---

## 🐛 Troubleshooting

**"I don't know what to do"**
- Check WORK_QUEUE.md for assigned tasks
- Read your agent role guide
- Check AGENT_HANDOFFS.md for dependencies
- Ask Coordinator if unclear

**"Task is blocked"**
- Update status to 🔴 Blocked in WORK_QUEUE.md
- Document what's blocking you
- Notify Coordinator
- Work on another ready task

**"Handoff is unclear"**
- Ask delivering agent for clarification
- Update AGENT_HANDOFFS.md with questions
- Notify Coordinator if unresolved

**"Files are out of sync"**
- Pull latest from git
- Check who else is working
- Coordinate through WORK_QUEUE.md updates
- Use git branches if needed

---

## 🎓 Getting Started Guide

### Day 1: Setup
1. Read this README
2. Set up Coordinator Claude Project
3. Run `node .coordination/coord-cli.js status`
4. Review WORK_QUEUE.md

### Day 2: First Feature
1. Ask Coordinator to plan small feature
2. Review task breakdown
3. Take first agent role (suggest: Backend or Frontend)
4. Read agent guide
5. Complete one task
6. Update files
7. Commit

### Day 3: Expand
1. Take different agent role
2. Complete another task
3. Experience handoff process
4. See how agents work together

### Week 2: Full Speed
1. Run multiple agent sessions
2. Build features in parallel
3. Coordinate with yourself across roles
4. Measure velocity improvements

---

## 🚀 Advanced Usage

### Custom Agents
Add specialized agents as needed:
- **DevOps Agent**: Deployment, monitoring, CI/CD
- **Security Agent**: Security audits, penetration testing
- **Performance Agent**: Optimization, profiling, caching
- **Content Agent**: Copy writing, documentation, tutorials

Create in `agents/YOUR_AGENT.md` using existing templates.

### Automation
- Automate status checks (cron jobs)
- Automate handoff notifications (git hooks)
- Integrate with project management tools
- Build dashboards from coordination files

### Multi-Person Teams
- Each person takes primary agent role
- Coordinator remains central
- Use git branches per feature
- Merge through PRs with reviews

---

## 📞 Support

**Issues with Orchestration System**:
- Check workflow example: `workflows/EXAMPLE_SESSION_HISTORY.md`
- Review agent guides in `agents/`
- Check coordination state files

**Issues with Rooting Routine**:
- See main project README.md
- Check STATUS.md for known issues
- Review IMPLEMENTATION_STATUS.md

---

## 🎉 Success Stories

**Before Orchestration** (estimated):
- Build feature: 1 person, 6 hours
- Context switching overhead: ~20%
- Documentation: Sparse
- Testing: Sometimes skipped
- Bugs found: Post-deployment

**With Orchestration**:
- Same feature: ~4 hours (agent time)
- Specialized focus: Better quality
- Documentation: Required
- Testing: QA gate enforced
- Bugs found: Pre-deployment

**ROI**: ~30% faster with better quality

---

## 🔮 Future Enhancements

**Planned**:
- [ ] Web dashboard for coordination state
- [ ] Slack/Discord integration for notifications
- [ ] Automated task assignments based on agent availability
- [ ] Metrics dashboard (velocity, quality, blockers)
- [ ] Template library for common features
- [ ] CI/CD integration

**Ideas**:
- AI-powered task estimation
- Automatic dependency detection
- Risk assessment for complex features
- Knowledge graph of project

---

## 📝 Contributing

To improve this orchestration system:

1. Try it on real features
2. Document what works/doesn't
3. Propose improvements
4. Update guides based on experience
5. Share patterns you discover

---

## 🙏 Acknowledgments

Built for **Rooting Routine**, a recovery app combining nature walks with 12-step work.

Inspired by:
- Agile/Scrum methodologies
- Conway's Law (org structure → system design)
- Specialized AI agents trend
- Personal experience with context switching pain

---

**Ready to orchestrate? Start with the Coordinator!**

```bash
# Check current status
node .coordination/coord-cli.js status

# View available tasks
node .coordination/coord-cli.js queue

# Let's build something amazing 🌳
```
