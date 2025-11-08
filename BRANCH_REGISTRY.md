# 🌿 Branch Registry - Recovery Tree

*Living document tracking all development branches*
*Last Updated: 2025-11-08*

---

## 🎯 PURPOSE

This registry prevents:
- ❌ Forgetting what branches exist
- ❌ Losing work in abandoned branches
- ❌ Merging conflicting changes
- ❌ Re-solving already-solved problems
- ❌ Confusion about "what was I working on?"

**Use this file to:**
- ✅ Track all active development branches
- ✅ Plan merge order strategically
- ✅ Identify potential conflicts before merging
- ✅ Decide what to abandon vs. complete
- ✅ Communicate with Watson about priorities

---

## 📊 QUICK STATS

**Total Branches:** 5 (1 main + 4 feature branches)
**Ready to Merge:** 2 branches
**Needs Review:** 2 branches
**In Active Development:** 1 branch (includes merged P1 & P2)
**Last Branch Activity:** 2025-11-08
**Last Merge:** 2025-11-08 (P1: debug-error + P2: fix-eslint → orchestrate)

---

## 🚦 BRANCH STATUS LEGEND

- 🟢 **Ready** - Tested, documented, ready to merge
- 🟡 **Testing** - Built but needs validation
- 🔵 **Active** - Currently being developed
- ⚠️ **Review** - Needs Fritz/Watson review before merge
- 🔴 **Blocked** - Can't merge until dependency resolved
- ✅ **Merged** - Successfully merged to main
- ❌ **Abandoned** - Decided not to merge

---

## 🌳 MAIN BRANCH

### `origin/main`
**Status:** ✅ Production Baseline
**Latest:** `64032af` Add Sancho briefing - Claude Code coordination protocol
**Updated:** 2025-11-08

**Purpose:**
Production-ready baseline with full coordination system documentation.

**Key Files:**
- `MISSION_CONTROL.md` - Single source of truth for project state
- `FUCKBOARD.md` - Hard-won deployment lessons
- `SANCHO_BRIEFING.md` - Claude Code coordination protocol
- All core app functionality (walks, mining, inventory, Elder Tree)

**Health:** 🟢 Stable - Deployed on Vercel, all core features working

---

## 🔵 ACTIVE DEVELOPMENT

### `claude/orchestrate-building-agents-011CUsMwp4CCXAumEK3iixhK`
**Status:** 🟢 Ready - Includes P1 merge
**Latest:** `dff440c` Fix module-level OpenAI client instantiation
**Created:** 2025-11-08
**Updated:** 2025-11-08
**Commits:** 13 total (including P1 debug-error merge)

**Purpose:**
Multi-agent orchestration system + Complete Session History feature + P1 technical debt fixes

**What's In This Branch:**
- ✅ `.coordination/` folder with multi-agent orchestration system
- ✅ Session History API (`/api/sessions/history`) with filtering & pagination
- ✅ Session History UI with timeline view and filters
- ✅ Session Detail View with full Elder Tree conversation replay
- ✅ Code quality audit with JSDoc documentation (7 routes)
- ✅ Technical debt report (TECHNICAL_DEBT_AUDIT.md)
- ✅ Branch consolidation infrastructure (BRANCH_REGISTRY, MERGE_PROTOCOL, SESSION_LOG)
- ✅ **MERGED P1:** debug-error branch (Capacitor mobile, walkabout, module-level client fixes)
- ✅ Fixed module-level OpenAI client (DALL-E images)
- ✅ Fixed Next.js 15 async params in session detail route

**Files Changed:** 100+ files (including P1 merge)
**Lines Changed:** ~5000+ additions (including P1 merge)

**Testing Status:**
- ✅ Build passes (verified after P1 merge)
- ✅ All module-level client issues resolved
- ✅ Documentation complete
- 🟡 Needs Fritz to test in browser
- 🟡 Needs verification no regressions

**Merge Dependencies:**
- ✅ P1 debug-error merged successfully into this branch
- 🟡 P2 fix-eslint ready to merge next (will fix remaining ESLint warnings)

**Merge Priority:** P4 (After P2 and P3)

**Conflicts Expected:**
- **With debug-error:** Both touch API routes
  - Resolution: Accept debug-error's module-level fixes, keep orchestrate's docs
- **With terminal-communication:** May overlap on session types
  - Resolution: Review session type handling carefully

**Risk Level:** Low (well-tested, comprehensive docs)

**Decision Needed:** None - ready for testing

---

## 🟢 READY TO MERGE

### 1. `claude/install-dependencies-011CUtekkH9ivreP8n4yscks`
**Status:** 🟢 Ready
**Latest:** `b501a3c` Add comprehensive E2E test suite with Playwright
**Created:** 2025-11-06
**Updated:** 2025-11-06
**Commits:** 3 total

**Purpose:**
Add testing infrastructure and documentation tooling

**What's In This Branch:**
- ✅ Playwright E2E test suite installed
- ✅ context7 documentation packages
- ✅ Merged previous capacitor-mobile work (PR #3)

**Files Changed:** package.json, test files, config
**Impact:** Testing infrastructure for QA

**Testing Status:** ✅ Dependencies install successfully

**Merge Priority:** P3 (Testing infrastructure)

**Conflicts Expected:** None

**Risk Level:** Low (additive only)

**Decision Needed:** Does Fritz want E2E tests now or later?

---

## ⚠️ NEEDS REVIEW

### 1. `claude/terminal-code-communication-011CUofi1SjbyvpwTxDsWAR9`
**Status:** ⚠️ Needs Fritz Review
**Latest:** `5258a06` Add comprehensive changelog
**Created:** 2025-11-06
**Updated:** 2025-11-06
**Commits:** 3 total

**Purpose:**
Add "Outside Walkabout" feature - walks separate from step work

**What's In This Branch:**
- ✅ New session type: "walkabout" (not tied to Step 1/2/3)
- ✅ Urge mining fixes
- ✅ Comprehensive changelog

**Files Changed:** Session handling, routing
**Impact:** New feature - casual walks vs. step work

**Testing Status:** 🟡 Needs Fritz testing

**Merge Priority:** P5 (Feature review)

**Conflicts Expected:** Medium with orchestrate (session type overlap)

**Risk Level:** Medium (new feature, needs validation)

**Decision Needed:**
- Does Fritz want "walkabout" separate from step work?
- Is this aligned with recovery philosophy?
- Should this be in MVP or post-launch?

---

### 2. `claude/setup-capacitor-mobile-011CUsMxsCyDebA2pXQRJfNL`
**Status:** ⚠️ Needs Review - Consider Deferring
**Latest:** `f91b454` Fix build errors for Vercel deployment
**Created:** 2025-11-06
**Updated:** 2025-11-06
**Commits:** 3 total

**Purpose:**
Mobile app foundation with Capacitor for iOS/Android

**What's In This Branch:**
- ✅ Capacitor setup and configuration
- ✅ OAuth authentication for mobile platforms
- ✅ Vercel deployment compatibility fixes

**Files Changed:** Config files, auth flows, build setup
**Impact:** Adds mobile app capability

**Testing Status:** 🔴 Needs extensive mobile testing

**Merge Priority:** P5 (Review required)

**Conflicts Expected:** High (build config, env setup)

**Risk Level:** High (major architectural addition)

**Decision Needed:**
- Is mobile support needed for MVP launch?
- Or defer to post-launch v1.1?
- If deferring, document in MISSION_CONTROL "Parked" section

---

## 🗂️ MERGED BRANCHES

### `claude/debug-error-011CUppBPUjLRv2fFeZ67EJ6`
**Merged:** 2025-11-08
**Into:** `claude/orchestrate-building-agents-011CUsMwp4CCXAumEK3iixhK`
**Merge Commit:** `23b2378`
**Purpose:** Critical bug fixes - module-level client instantiation and build errors
**Key Changes:**
- Fixed module-level Supabase client → moved to event handlers
- Added Suspense boundaries for Next.js 15 compatibility
- Fixed TypeScript build errors
- Added Capacitor mobile infrastructure (iOS/Android)
- Added walkabout session type
- Disabled LemonSqueezy endpoints
**Deleted:** No (branch still exists on remote for reference)
**Impact:** Resolved critical technical debt identified in code quality audit
**Follow-up:** Fixed additional module-level OpenAI client in subsequent commit

---

### `claude/fix-eslint-errors-011CUppBPUjLRv2fFeZ67EJ6`
**Merged:** 2025-11-08 (via P1 debug-error merge)
**Into:** `claude/orchestrate-building-agents-011CUsMwp4CCXAumEK3iixhK`
**Merge Commit:** Already included in `23b2378` (P1 merge)
**Purpose:** Code quality improvements - ESLint compliance
**Key Changes:**
- Fixed JSX quote/apostrophe escaping issues
- ESLint error cleanup across multiple pages
- All unescaped entity errors resolved
**Deleted:** No (branch still exists on remote for reference)
**Impact:** Clean builds with no ESLint errors (only 3 minor React Hook warnings remain)
**Note:** This branch was already merged into debug-error before P1 merge, so it came through automatically

---

## ❌ ABANDONED BRANCHES

*None yet - no branches abandoned*

**Template for abandoned branches:**
```
### branch-name
**Abandoned:** YYYY-MM-DD
**Reason:** Why not merged
**Deleted:** Yes/No
**Salvageable:** Any code worth saving?
```

---

## 📋 MERGE STRATEGY

**Recommended Order:**

1. ✅ **P1: `debug-error`** ← **MERGED 2025-11-08** (into orchestrate branch)
2. ✅ **P2: `fix-eslint`** ← **MERGED 2025-11-08** (came through P1 merge)
3. **P3: `install-dependencies`** ← **NEXT** - Testing infrastructure
4. **P4: `orchestrate`** ← Session History feature (after P1/P2/P3)
5. **P5: Review Required**
   - `terminal-communication` - Fritz decides on walkabout feature
   - `setup-capacitor` - Fritz decides on mobile timing

**Rationale:**
- Fix bugs before adding features
- Prevent technical debt before it spreads
- Test infrastructure before major features
- Review big architectural changes carefully

**See [MERGE_PROTOCOL.md](./MERGE_PROTOCOL.md) for step-by-step merge procedures.**

---

## 🔍 CONFLICT MAP

**Potential Conflicts:**

| Branch A | Branch B | Files | Resolution Strategy |
|----------|----------|-------|---------------------|
| orchestrate | debug-error | API routes | Accept debug-error fixes, keep orchestrate docs |
| orchestrate | terminal-comm | Session types | Review session handling carefully |
| capacitor | Any | Build config | Test thoroughly after merge |

---

## 🎯 DECISION QUEUE

**For Fritz to Decide:**

1. **E2E Testing** (`install-dependencies`)
   - Want Playwright tests now or later?
   - If later, can still merge (won't break anything)

2. **Walkabout Feature** (`terminal-communication`)
   - Is "outside walkabout" separate from step work desirable?
   - Or should all walks tie to steps?

3. **Mobile Support** (`setup-capacitor`)
   - Launch with web-only first?
   - Or include mobile from day 1?
   - High risk, high reward decision

**For Watson to Advise:**
- Merge order if conflicts arise
- Testing strategy before merges
- Rollback plan if production breaks

---

## 🔄 BRANCH LIFECYCLE

```
Create → Develop → Test → Review → Merge → Delete
   ↓                                    ↓
   └──────── OR ──────────────────→ Abandon
```

**Healthy Branch Age:**
- Small fixes: < 1 day
- Features: 1-3 days
- Large features: 3-7 days
- **Warning:** Branches > 7 days risk conflicts

**Current Oldest Branch:** `debug-error` (3 days) - should merge ASAP

---

## 📝 MAINTENANCE

**Update This File:**
- After creating new branch
- After merging branch
- After abandoning branch
- During weekly branch review
- When feeling overwhelmed

**Review Schedule:**
- Quick check: Before each work session
- Full review: Weekly or when >5 active branches
- Deep clean: Monthly or when confused

---

## 🚨 EMERGENCY RECOVERY

**If you feel lost about branches:**

1. Run: `git branch -a`
2. Post to Watson: "Help me map my branches"
3. Watson + Sancho update this registry
4. Review and prioritize with Watson
5. Execute merge plan systematically

---

*Last Updated: 2025-11-08*
*Maintained by: Fritz + Watson + Sancho*
*Purpose: Never lose track of parallel work again*
