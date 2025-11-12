# 🔀 Merge Protocol - Recovery Tree

*Safe, systematic process for consolidating branches*

---

## 🎯 Purpose

This protocol prevents:
- ❌ Breaking production with bad merges
- ❌ Losing work during conflicts
- ❌ Deployment failures from untested code
- ❌ Confusion about what's merged

---

## 📋 PRE-MERGE CHECKLIST

Before merging ANY branch, verify:

- [ ] **Registry Updated** - Branch is marked "Ready to Merge" in BRANCH_REGISTRY.md
- [ ] **Dependencies Clear** - No other branches must merge first
- [ ] **Purpose Understood** - You know what this branch does
- [ ] **Conflicts Identified** - Checked BRANCH_REGISTRY for conflict warnings
- [ ] **Backup Exists** - Main branch is stable (or create backup branch)

---

## 🔍 STEP 1: INSPECT THE BRANCH

**Before touching git, understand what you're merging.**

### View Branch Contents
```bash
# See what's in the branch
git fetch origin
git log main..origin/branch-name --oneline

# See files changed
git diff main...origin/branch-name --name-only

# See actual changes
git diff main...origin/branch-name
```

### Questions to Answer
1. What files does this branch modify?
2. Do I recognize these changes?
3. Are there any surprises?
4. Does this conflict with recent work on main?

**If anything looks wrong, STOP and ask Watson.**

---

## 🧪 STEP 2: LOCAL TESTING (If Possible)

**Test the branch locally BEFORE merging to main.**

### Option A: Test in Codespaces
```bash
# Create test branch
git checkout -b test-merge-branch-name main

# Merge the branch locally
git merge origin/branch-name

# If conflicts, resolve them (see STEP 4)

# Build and test
npm install
npm run build

# If build succeeds, run the app
npm run dev

# Test the features manually
# Check for console errors
# Verify expected functionality
```

### Option B: Use Vercel Preview
```bash
# Push the test branch
git push origin test-merge-branch-name

# Vercel will auto-deploy a preview
# Test at: [preview-url]
```

**If tests fail, STOP. Debug before merging to main.**

---

## 🔀 STEP 3: MERGE TO MAIN

**Only after successful testing.**

### Standard Merge (No Conflicts Expected)
```bash
# Switch to main
git checkout main

# Ensure main is up to date
git pull origin main

# Merge the branch
git merge origin/branch-name

# Push to trigger deployment
git push origin main
```

### Watch Vercel Deployment
1. Go to Vercel dashboard
2. Watch the build
3. If it fails, see STEP 6 (Rollback)

---

## ⚠️ STEP 4: HANDLING CONFLICTS

**If git says "CONFLICT", don't panic.**

### Understand the Conflict
```bash
# See which files have conflicts
git status

# Each conflicted file will show:
<<<<<<< HEAD
Code from main branch
=======
Code from branch being merged
>>>>>>> branch-name
```

### Resolution Strategy

**Option A: Accept Main's Version**
```bash
# If main's code is correct
git checkout --ours conflicted-file.ts
git add conflicted-file.ts
```

**Option B: Accept Branch's Version**
```bash
# If branch's code is correct
git checkout --theirs conflicted-file.ts
git add conflicted-file.ts
```

**Option C: Manual Resolution**
1. Open the conflicted file in VS Code
2. VS Code highlights conflicts with UI
3. Choose "Accept Current Change" or "Accept Incoming Change"
4. Or manually edit to combine both
5. Remove conflict markers (<<<<, ====, >>>>)
6. Save the file
7. `git add conflicted-file.ts`

### After Resolving All Conflicts
```bash
# Verify no conflicts remain
git status

# Complete the merge
git commit -m "Merge branch-name - resolved conflicts"

# Test before pushing!
npm run build

# If build succeeds
git push origin main
```

**If you get confused during conflicts, ask Watson for guidance.**

---

## 🧹 STEP 5: POST-MERGE CLEANUP

**After successful merge and deployment:**

### Update Documentation
```bash
# 1. Update BRANCH_REGISTRY.md
# Move branch from "Ready to Merge" to "Merged"
# Add merge date

# 2. Update SESSION_LOG.md
# Log the merge activity

# 3. Update MISSION_CONTROL.md
# Remove branch from active list if needed
```

### Delete Merged Branch
```bash
# Delete remote branch
git push origin --delete branch-name

# Delete local branch (if exists)
git branch -d branch-name

# Update registry
# Move to "Merged" section with date
```

### Verify Deployment
- [ ] Check Vercel deployment succeeded
- [ ] Visit production URL
- [ ] Test merged functionality
- [ ] Check for console errors
- [ ] Verify no regressions

---

## 🚨 STEP 6: ROLLBACK (If Things Break)

**If the merge breaks production:**

### Quick Rollback
```bash
# Find the commit before the merge
git log --oneline -5

# Revert to previous commit
git revert HEAD

# Or harder reset (loses merge)
git reset --hard HEAD~1
git push --force origin main
```

### Better Rollback (Via Vercel)
1. Go to Vercel dashboard
2. Find previous successful deployment
3. Click "Redeploy"
4. Previous version goes live immediately

### After Rollback
1. Tell Watson what broke
2. Watson helps debug
3. Fix the branch
4. Try merge again later

---

## 📊 MERGE DECISION MATRIX

| Branch Type | Testing Required | Conflict Risk | Merge When |
|-------------|------------------|---------------|------------|
| Bug fix | Local build | Low | Immediately |
| Code quality | Local build | Low | Immediately |
| Small feature | Local + manual | Medium | After testing |
| Large feature | Full E2E | High | After review session |
| Infrastructure | Extensive | Very High | Dedicated session |

---

## 🎯 BATCH MERGING STRATEGY

**When merging multiple branches (like now):**

### Day 1: Foundation Fixes
- Merge bug fixes
- Merge code quality
- Test deployment
- Verify stability

### Day 2: Feature Additions
- Merge tested features
- One at a time
- Test between each
- Watch for regressions

### Day 3: Review & Polish
- Test everything together
- Fix any issues
- Update documentation
- Clean up branches

**Don't merge everything in one day unless branches are trivial.**

---

## ⚠️ RED FLAGS - STOP MERGING IF:

🚩 You don't understand what the branch does
🚩 Conflicts involve files you haven't seen before
🚩 Build fails after merge
🚩 You're tired or rushing
🚩 Multiple conflicts across many files
🚩 Production is already broken
🚩 Watson hasn't reviewed the merge plan

**When in doubt, ask Watson. Better to pause than break production.**

---

## 🎓 LEARNING FROM MERGES

**After each merge, note:**
- What went smoothly?
- What was confusing?
- What would you do differently?
- Any process improvements?

**Add learnings to FUCKBOARD.md if significant.**

---

## 🔄 PROTOCOL UPDATES

**Update this protocol when:**
- You discover a better merging approach
- You hit a new type of problem
- Tools change (new git features, Vercel updates)
- Team grows (more people merging)

---

*Last Updated: 2025-11-08*
*Maintained by: Watson + Fritz*
*Purpose: Merge safely, ship confidently*
