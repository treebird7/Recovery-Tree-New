# 🔥 THE FUCKBOARD 🔥

*A Monument to Hard-Won Wisdom & Expensive Lessons*

> "Those who cannot remember the past are condemned to repeat it." - Also applies to deployment errors

---

## About This Document

This is our record of every stupid mistake, confusing error, and "why the fuck didn't that work?" moment we encountered building Recovery Tree. Future Fritz (and any poor soul who inherits this codebase) will thank us.

---

## 🎯 Hall of Shame - November 8, 2025

### **"The Great Vercel Deployment Crisis"**

*Duration: 3+ hours*  
*Claude Code Credits Burned: Too many*  
*Deployment Attempts: Lost count*  
*Final Status: ✅ DEPLOYED (by disabling half the features)*

---

### 1. **The Missing Env Vars Classic**
**What happened:** Build failed with "supabaseUrl is required"  
**Why it was dumb:** We had `.env.local` but forgot Vercel can't see that file  
**The Fix:** Manually add ALL 7 environment variables in Vercel dashboard  
**Lesson:** `.env.local` is LOCAL. It's in the fucking name.  
**Stupid Tax:** 30 minutes  
**Prevention:** Always set env vars in Vercel BEFORE first deploy

**Environment Variables We Needed:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
ANTHROPIC_API_KEY
FAL_API_KEY
NEXT_PUBLIC_APP_URL
SESSION_TIMEOUT_MINUTES
```

---

### 2. **The ESLint Apostrophe Police**
**What happened:** Build failed on unescaped `'` and `"` in JSX  
**Why it was dumb:** ESLint wants `&apos;` instead of `'` for accessibility  
**The Fix:** Added to `.eslintrc.json`:
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off"
  }
}
```
**Lesson:** Sometimes you just disable the rule and fix it properly later  
**Stupid Tax:** 10 minutes  
**Technical Debt:** Should actually escape entities in production

---

### 3. **The LemonSqueezy Module-Level Client Disaster**
**What happened:** Webhook route tried to create Supabase client at module level (top of file)  
**Why it was dumb:** Build time runs before environment variables exist  
**The Error:**
```
Error: supabaseUrl is required.
    at createClient (.next/server/chunks/464.js:34:39431)
```
**The Fix:** Move `createClient()` INSIDE the route handler function  
**Wrong:**
```typescript
const supabase = createClient(process.env.SUPABASE_URL) // ❌ Module level
export async function POST() { ... }
```
**Right:**
```typescript
export async function POST() {
  const supabase = createClient(process.env.SUPABASE_URL) // ✅ Inside function
}
```
**Lesson:** Client initialization = runtime operation, not build-time  
**Stupid Tax:** 45 minutes and multiple failed deploys  
**Final Solution:** Just disabled the whole damn webhook folder

---

### 4. **The "Just Add One Line" Whack-A-Mole**
**What happened:** Added `export const dynamic = 'force-dynamic'` to one page, then another, then another...  
**Why it was dumb:** Treating symptoms instead of root cause  
**The Fix:** Added to root `app/layout.tsx`:
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```
**Lesson:** If the same fix is needed everywhere, fix it globally first  
**Stupid Tax:** 1 hour of copy-paste hell

---

### 5. **The Output Directory Mystery**
**What happened:** "No Output Directory named 'public' found"  
**Why it was dumb:** Next.js 15 changed build output structure, Vercel expected old structure  
**The Fix:** Created `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```
**Lesson:** Major framework version updates = verify build configuration  
**Stupid Tax:** 5 minutes (felt like an eternity)

---

### 6. **The Duplicate Import Comedy**
**What happened:** 
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { type NextRequest } from 'next/server' // ← DUPLICATE!
```
**Why it was dumb:** Added imports without reading the full file  
**The Fix:** Delete the duplicate (duh)  
**Lesson:** RTFF - Read The Fucking File before pasting  
**Stupid Tax:** 10 minutes of "why is TypeScript yelling at me?"

---

### 7. **The Middleware Edge Runtime Betrayal**
**What happened:** Middleware worked perfectly locally, exploded on Vercel with cryptic error  
**The Error:**
```
The Edge Function "middleware" is referencing unsupported modules:
	- @/lib/supabase/middleware
```
**Why it was dumb:** Vercel Edge Runtime has strict module limitations  
**Attempted Fix #1:** Added `export const dynamic = 'force-dynamic'` - didn't work  
**Attempted Fix #2:** Tried `export const runtime = 'nodejs'` - STILL didn't work  
**Final Solution:** Fuck it, disabled the entire middleware  
```bash
mv middleware.ts middleware.ts.disabled
```
**Lesson:** When Edge fails mysteriously, disable and fix locally with Vercel CLI later  
**Stupid Tax:** 20 minutes + eventual surrender  
**TODO:** Re-enable with proper Edge-compatible Supabase client

---

### 8. **The .MD vs .md Filename Trap**
**What happened:** Git couldn't find `DEPLOYMENT_NOTES.md` because we created `DEPLOYMENT_NOTES.MD`  
**Why it was dumb:** macOS filesystem is case-insensitive, Git is case-sensitive  
**The Fix:** `mv DEPLOYMENT_NOTES.MD DEPLOYMENT_NOTES.md`  
**Lesson:** Always use lowercase file extensions  
**Stupid Tax:** 5 minutes of confusion

---

### 9. **The "Just One More Fix" Spiral**
**What happened:** Spent 3+ hours debugging deployment instead of building features  
**Why it was dumb:** Didn't cut losses and disable problematic features earlier  
**The Lesson:** Sometimes "fuck it, ship without that feature" is the RIGHT engineering decision  
**What We Should Have Done:** Disable LemonSqueezy + middleware immediately, deploy core app, fix later  
**What We Actually Did:** Fight every error individually for hours  
**Stupid Tax:** 3 hours of limited Claude Code credits  
**Recovery Principle Applied:** "Pause beats perfection" - also applies to dev work

---

### 10. **The Scarcity Panic Parallelization**
**What happened:** Saw "10 days of credits left" and started building everything in parallel  
**Why it was dumb:** Created branch chaos, Vercel confusion, mental overwhelm  
**The Result:** 
- Multiple Claude Code sessions running simultaneously
- Branches with random generated names
- Couldn't remember what was where
- Spent MORE time organizing than building
**The Lesson:** Scarcity mindset creates artificial urgency that WASTES resources  
**Recovery Principle Applied:** "One thing at a time" - even with limited resources  
**Stupid Tax:** Immeasurable chaos + this entire debugging session

---

## 🏆 Today's MVP Fuckup

**Winner: The Module-Level Supabase Client**

This persistent bastard appeared in:
- ✅ LemonSqueezy webhook (DISABLED)
- ✅ Signup page (fixed with force-dynamic)
- ✅ Dashboard page (fixed via layout)
- ✅ Multiple inventory routes (fixed via layout)

**Trophy:** 🥇 Most Persistent Pain In The Ass

**Root Cause:** Next.js 15's aggressive static optimization + Supabase SSR package

---

## 📚 Hard-Won Wisdom

### Deployment Truths
1. **Environment variables don't teleport** - Set them in Vercel dashboard manually
2. **Build time ≠ Runtime** - Next.js 15 pre-renders aggressively, env vars only exist at runtime
3. **Edge Runtime is finicky** - When it fails mysteriously, disable and test locally
4. **`.env.local` is LOCAL** - It's literally in the name
5. **Git is case-sensitive** - Even when your OS isn't

### Development Philosophy
6. **Strategic amputation > prolonged suffering** - Disable features to ship, fix later
7. **Fix globally before locally** - If 5 files need the same change, there's a root cause
8. **Pause beats perfection** - Applies to code too, not just recovery
9. **Scarcity creates bad decisions** - Limited resources + panic = worse outcomes
10. **Read The Fucking File** - Before adding imports/code
11. **READ YOUR OWN DOCUMENTATION** - The FUCKBOARD only works if you consult it before coding

### React/Event Listener Patterns
12. **Event listeners = Setup ONCE, cleanup on unmount** - Never inside click handlers
13. **useEffect with empty deps []** - Runs once on mount, perfect for global listeners
14. **Always return cleanup function** - `return () => listener.remove()` prevents leaks

### Next.js 15 Patterns
15. **Client initialization INSIDE route handlers** - Not at module level (Supabase, Anthropic, etc.)
16. **Add `export const dynamic = 'force-dynamic'`** - To any page using runtime-only APIs
17. **Test build locally** - `npm run build` catches static generation errors early

### Database Wisdom
18. **Index expressions must be immutable** - No function calls like DATE() in index definitions
19. **Check migration dependencies** - Verify tables exist before creating indexes
20. **Test migrations locally first** - Supabase CLI before production push

### Git Workflow
21. **The Holy Trinity:** `git add .` → `git commit -m "message"` → `git push`
22. **Always check `git status`** - Before assuming you pushed
23. **Test locally FIRST** - Use Vercel CLI (`vercel build`) to catch errors before pushing

---

## 🔧 Tools We Should Have Used From The Start

1. **Vercel CLI** - `npm install -g vercel` then `vercel build` to test locally
2. **Claude Code Web for file edits** - Stop being the copy-paste middleman
3. **Mission Control document** - Track what's happening across parallel work
4. **FUCKBOARD** - This document. Saves future pain.

---

## ⚠️ Warning Signs We Ignored

- "Just one more fix..." (said 8 times in a row)
- Fixing the same error in multiple files (root cause not addressed)
- Copy-pasting code without reading context
- Working while exhausted (quality plummets)
- Parallelizing work without organization (chaos multiplies)

---

## 🎯 What Actually Worked

1. **Persistence** - We didn't give up
2. **Strategic surrender** - Disabled features to ship
3. **Systematic debugging** - Fixed errors one by one
4. **Documentation** - Writing this so we don't repeat it
5. **Breaking when needed** - (Should have done this sooner)

---

## 📝 TODO: Don't Forget To Re-Enable

- [ ] LemonSqueezy webhook (`app/api/lemonsqueezy.disabled/`)
- [ ] Middleware auth protection (`middleware.ts.disabled`)
- [ ] Fix module-level client initialization patterns
- [ ] Add proper error boundaries
- [ ] Set up Vercel CLI workflow
- [ ] Test Edge Runtime compatibility properly

---

## 🙏 Thank You For Your Service

To the features we temporarily sacrificed for the greater good of deployment:

- **LemonSqueezy Webhook Integration** - You were too complex for build time. Rest in `/disabled/`.
- **Middleware Authentication** - Edge Runtime didn't deserve you. We'll bring you back stronger.

---

## 🎯 Hall of Shame - November 12, 2025

### **"The OAuth Memory Leak Massacre"**

*Duration: Full debug session*
*Severity: CRITICAL*
*Final Status: ✅ FIXED (but took architectural refactor)*

---

### 11. **The Mobile OAuth Listener Memory Leak**
**What happened:** Every time user clicked OAuth button, a NEW listener was added and never removed
**Why it was dumb:** Adding event listeners INSIDE the function that handles the click
**The Error Pattern:**
```typescript
export async function signInWithOAuth(...) {
  App.addListener('appUrlOpen', async (event) => {  // ❌ NEW LISTENER EVERY CLICK!
    // handle callback
  });
}
```
**Why It's Catastrophic:**
- Memory leaks on every button click
- Multiple callbacks firing for same OAuth return
- Potential duplicate sessions
- App crashes after 20-30 OAuth attempts

**The Fix:** Move listener to app initialization (global scope, set once)
```typescript
// app/hooks/useOAuthMobileListener.ts
useEffect(() => {
  const listener = App.addListener('appUrlOpen', async (event) => {
    // handle callback ONCE
  });
  return () => listener.remove();  // ✅ CLEANUP!
}, []); // Empty deps = runs once
```
**Lesson:** Event listeners at module/app level, NOT inside click handlers
**Stupid Tax:** 2+ hours debugging + architectural refactor
**Trophy:** 🥇 Most Dangerous Pattern In The Codebase

---

### 12. **The Static Generation vs Runtime Strikes Again**
**What happened:** OAuth pages failed build with "Supabase credentials required" error
**Why it was dumb:** We LITERALLY documented this in entry #3 (LemonSqueezy) but did it again
**The Error:**
```
Error occurred prerendering page "/signup"
Error: @supabase/ssr: Your project's URL and API key are required
```
**Root Cause:** Next.js 15 tries to statically generate pages at build time, hits client code that needs env vars
**The Fix (AGAIN):** Add to every page that uses Supabase:
```typescript
export const dynamic = 'force-dynamic';
```
**Lesson:** When you document a mistake, READ YOUR OWN DOCUMENTATION before making it again
**Stupid Tax:** 30 minutes + embarrassment
**Meta Lesson:** The FUCKBOARD only works if you actually read it

---

### 13. **The Module-Level AI Client Déjà Vu**
**What happened:** Anthropic client initialized at top of file (module level) instead of inside route handler
**Why it was dumb:** EXACT same pattern as Supabase client issues (see #3, #12)
**The Pattern (Wrong):**
```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
}); // ❌ Module level = build time
export async function POST(request: NextRequest) { ... }
```
**The Pattern (Right):**
```typescript
export async function POST(request: NextRequest) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  }); // ✅ Inside function = runtime
}
```
**Files Affected:**
- `app/api/inventory/today/route.ts`
- `app/api/urge/response/route.ts`

**Lesson:** Client initialization = RUNTIME OPERATION, not build-time (third time's the charm?)
**Stupid Tax:** Found during code audit, not production failure (dodged a bullet)
**Status:** Documented in TECHNICAL_DEBT_AUDIT.md, needs fixing

---

### 14. **The DATE() Migration Database Drama**
**What happened:** Migration failed on Supabase with "cannot use non-immutable function in index"
**Why it was dumb:** Used SQL DATE() function in index expression
**The Error:**
```sql
CREATE INDEX idx_inventory_user_date
  ON daily_inventory(user_id, DATE(created_at));  -- ❌ DATE() not allowed in index
```
**The Fix:**
```sql
CREATE INDEX idx_inventory_user_date
  ON daily_inventory(user_id, created_at);  -- ✅ Index the full timestamp
```
**Lesson:** Database indexes require immutable expressions (no function calls)
**Stupid Tax:** 20 minutes + migration rollback
**Bonus Lesson:** Always test migrations locally before pushing to Supabase

---

### 15. **The Missing Prayers Table Graceful Failure**
**What happened:** Migration tried to create index on `prayers` table that didn't exist yet
**Why it was dumb:** Migration order dependencies not checked
**The Fix:** Added conditional check:
```sql
CREATE INDEX IF NOT EXISTS idx_prayers_user
  ON prayers(user_id)
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prayers');
```
**Lesson:** Migration dependencies matter - check table existence before creating indexes
**Stupid Tax:** 15 minutes
**Recovery Win:** Actually handled this gracefully instead of panic-disabling

---

## 🏆 Today's MVP Fuckup (November 12, 2025)

**Winner: The OAuth Memory Leak**

This sneaky bastard would have caused:
- Gradual memory exhaustion
- App crashes after repeated use
- Production debugging nightmare
- User complaints about "app getting slower"

**Trophy:** 🥇 Most Insidious Bug (Would've Taken Weeks To Debug In Production)

---

*Last Updated: November 15, 2025*
*Status: LEARNING (slowly)*
*Lessons Learned: Still too many*
*Times We've Made The Same Mistake: More than we'd like to admit*

---

## How To Use This Document

**When adding new fuckups:**
1. Date the entry
2. Explain what happened (honestly)
3. Why it was dumb (be brutal)
4. How you fixed it (specifically)
5. The lesson learned (clearly)
6. Time wasted (precisely)

**When future-you forgets:**
- Search this doc for your error message
- Read the fix
- Thank past-you for documenting
- Don't make the same mistake again

---

*"The definition of insanity is doing the same thing over and over and expecting different results."*  
*The definition of wisdom is writing down why it didn't work so you don't try it again.*