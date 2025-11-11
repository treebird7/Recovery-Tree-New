# Decisions Log - Rooting Routine

**Purpose**: Record all significant product, technical, and design decisions
**Format**: Most recent decisions at top

---

## 🎯 Pending Decisions

### PD-001: Session History View Design
**Date Raised**: 2025-11-06
**Category**: UX Design
**Owner**: Product Owner
**Priority**: High (blocking Task #4)

**Question**:
What should the session history page look like?

**Options**:
1. **Timeline View** (Recommended)
   - Vertical timeline, most recent at top
   - Cards for each session with preview
   - Type icons (walk/mining/inventory)
   - Good for: Seeing recent activity at a glance

2. **List View**
   - Simple table/list format
   - More dense information display
   - Good for: Scanning many sessions quickly

3. **Calendar View**
   - Monthly calendar with dots/colors
   - Click day to see sessions
   - Good for: Visualizing consistency/streaks

4. **Hybrid**
   - Timeline for recent (last 7 days)
   - Calendar for historical
   - Good for: Best of both worlds

**Recommendation**: Timeline view with optional calendar toggle

**Impact**:
- Frontend implementation approach
- Component structure
- User experience

**Decision**: *Awaiting product owner input*

---

### PD-002: Coin Economy Purpose
**Date Raised**: 2025-11-06
**Category**: Game Design / Monetization
**Owner**: Product Owner
**Priority**: Low

**Question**:
What can users do with their coins?

**Context**:
- Users currently earn 1 coin/minute (walk or mining)
- Coins accumulate but have no utility
- Dashboard shows coin balance

**Options**:
1. **Pure Gamification**
   - Coins are just a score/progress metric
   - Pros: Simple, no feature gating
   - Cons: May feel pointless over time

2. **Feature Unlocks**
   - Spend coins to unlock new features
   - Example: Unlock Steps 4-12, unlock history search
   - Pros: Engagement incentive
   - Cons: May frustrate users needing features

3. **Tree Growth Visualization**
   - Coins grow a visual tree
   - Milestones unlock tree stages
   - Pros: Satisfying visual progress
   - Cons: Requires illustration work

4. **Premium Content**
   - Unlock guided meditations, readings, etc.
   - Pros: Content library expansion
   - Cons: Need to create/curate content

5. **Social Currency**
   - Send encouragement coins to others
   - Pros: Community building
   - Cons: Requires social features

6. **Charity Donations**
   - Convert coins to real donations
   - Example: 1000 coins = $1 to recovery charities
   - Pros: Real-world impact, meaningful
   - Cons: Financial complexity, sustainability

**Recommendation**: Start with #1 (gamification only) for MVP, explore #3 (tree growth) for v1.1

**Decision**: *Awaiting product owner input*

---

## ✅ Decided

### DEC-004: Switch to DALL-E 3 for Image Generation
**Date**: 2025-11-06
**Category**: Technical / Cost
**Decision**: Use OpenAI DALL-E 3 instead of FAL.ai, with Unsplash as fallback

**Rationale**:
- FAL.ai unreliable (no images generated)
- Product owner suggested using OpenAI
- DALL-E 3 is more reliable and well-documented
- Mood-specific AI-generated images improve user experience
- Reasonable cost (~$0.04-0.08 per image)
- Unsplash fallback ensures always have image

**Impact**:
- Installed OpenAI SDK
- Created `lib/services/dalle-images.ts`
- Updated session completion to use DALL-E first, Unsplash fallback
- Need `OPENAI_API_KEY` environment variable

**Alternatives Considered**:
- Fix FAL.ai - reliability concerns
- Unsplash only - not mood-personalized
- Stability AI - another integration to build

**Status**: ✅ Implemented

---

### DEC-003: Multi-Agent Orchestration
**Date**: 2025-11-06
**Category**: Development Process
**Decision**: Implement multi-agent orchestration system with central coordinator

**Rationale**:
- Accelerate development through parallelization
- Clear separation of concerns (Frontend/Backend/DB/AI/QA)
- Better task tracking and visibility
- Reduce context switching overhead

**Impact**:
- Created .coordination/ directory structure
- Created WORK_QUEUE.md, COORDINATOR_CONTEXT.md, etc.
- New development workflow

**Alternatives Considered**:
- Single agent (current) - too slow
- No coordination - risk of conflicts

**Status**: ✅ Implemented

---

### DEC-002: Timer-Based Coin Earning
**Date**: 2025-11-04
**Category**: Game Mechanics
**Decision**: Award 1 coin per minute spent in activity (walking or mining)

**Rationale**:
- Encourages taking time with reflections
- Consistent across walk and mining modes
- Aligns with "rest is enough" philosophy
- Simple to calculate and understand

**Impact**:
- Updated walk session coin logic
- Updated mining session coin logic
- Changed UI to show "X minutes" instead of question count

**Alternatives Considered**:
- 2 coins per question answered - discouraged depth
- Fixed amount per session - didn't reflect effort

**Status**: ✅ Implemented

---

### DEC-001: Unsplash for Images
**Date**: 2025-11-05
**Category**: Technical / Cost
**Decision**: Switch from FAL.ai to Unsplash API for nature imagery

**Rationale**:
- FAL.ai experiencing reliability issues
- Unsplash is free and stable
- High-quality nature photography available
- Faster implementation

**Impact**:
- Updated `lib/services/image-generation.ts`
- Session completion shows Unsplash images
- Removed dependency on FAL.ai (kept for future)

**Alternatives Considered**:
- Fix FAL.ai - too time consuming for MVP
- No images - reduces motivation factor

**Status**: ✅ Implemented

---

## 📚 Decision Categories

**Product Decisions**:
- Feature scope
- User experience
- Prioritization
- Monetization

**Technical Decisions**:
- Architecture choices
- Technology stack
- API design
- Performance optimizations

**Design Decisions**:
- UI/UX patterns
- Visual style
- Information architecture
- Accessibility

**Process Decisions**:
- Development workflow
- Testing strategy
- Deployment approach
- Team coordination

---

## 🔍 Decision-Making Framework

**When to Log a Decision**:
1. Impacts multiple agents/workstreams
2. Has long-term implications
3. Involves trade-offs between options
4. Needs stakeholder approval
5. Future team members should know why

**Decision Template**:
```markdown
### DEC-XXX: Decision Title
**Date**: YYYY-MM-DD
**Category**: Product/Technical/Design/Process
**Decision**: {What was decided}

**Rationale**: {Why this choice}
**Impact**: {What changes}
**Alternatives Considered**: {Other options}
**Status**: ✅ Implemented / 🔄 In Progress / ⏸️ Deferred
```

**Review Process**:
1. Agent or Coordinator raises decision
2. Options analyzed with pros/cons
3. Recommendation made
4. Product owner approves
5. Decision logged here
6. Implementation tracked in WORK_QUEUE.md

---

## 📊 Decision Stats

**Total Decisions**: 3 decided + 3 pending
**Decision Velocity**: ~1-2 per day
**Average Time to Decide**: Varies (minutes to days)

**By Category**:
- Product: 2 pending
- Technical: 2 decided, 1 pending
- Design: 1 pending
- Process: 1 decided

---

**End of Decisions Log**
