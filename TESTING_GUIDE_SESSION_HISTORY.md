# 🧪 Testing Guide: Session History Feature

**Pre-P4 Testing Protocol**
**Tester:** Fritz
**Date:** 2025-11-08
**Branch:** `claude/orchestrate-building-agents-011CUsMwp4CCXAumEK3iixhK`

---

## 🎯 What We're Testing

The **Session History** feature built by Sancho includes:
1. **Session History List Page** (`/history`) - Timeline of all your walks
2. **Session Detail View** - Full Elder Tree conversation replay
3. **API Endpoints** - Backend data fetching

---

## 🚀 How to Test (Browser)

### Step 1: Start Development Server

```bash
npm run dev
```

Server will start at: **http://localhost:3000**

---

### Step 2: Access Session History

**URL:** http://localhost:3000/history

**What You Should See:**
- 🌲 Header: "Session History"
- 📊 Filter controls (All Sessions / Step 1 / Step 2 / Step 3 / Mining)
- 📅 List of your completed sessions (most recent first)
- Each session card shows:
  - Date & time
  - Session type (Step 1/2/3 or Mining)
  - Duration in minutes
  - Coins earned
  - Preview of reflection (first 100 characters)

**If you have NO sessions:**
- You'll see: "No sessions found. Start your first walk to begin tracking your journey!"
- Complete a walk first, then return to `/history`

---

### Step 3: Test Session Detail View

**Click on any session card** to open the detail view.

**What You Should See:**

#### Top Section - Session Stats:
- 📅 Date & time
- ⏱️ Duration (X minutes)
- 🪙 Coins earned
- 🌱 Session type

#### Pre-Walk Check-In (if present):
- Your pre-walk mood
- Your pre-walk intention

#### Elder Tree Conversation:
- Full conversation replay showing:
  - 🌳 **Elder Tree questions** (green background)
  - 👤 **Your answers** (gray background)
  - ✨ **Breakthrough moments** (yellow ring around answer)
  - Timestamps for each exchange

#### Post-Walk Summary:
- 🖼️ **Generated nature image** (DALL-E 3 or Unsplash)
- 💭 **Elder Tree's reflection**
- 💪 **Encouragement message**
- 🔍 **Key insights** (bullet points)

#### Navigation:
- "← Back to History" button at top

---

## ✅ Test Checklist

### Basic Functionality:
- [ ] History page loads without errors
- [ ] Sessions display in chronological order (newest first)
- [ ] Session cards show correct date, type, duration, coins
- [ ] Clicking a session opens detail view
- [ ] Detail view shows full conversation
- [ ] Back button returns to history list

### Conversation Display:
- [ ] Elder Tree messages appear on left (green)
- [ ] Your answers appear on right (gray)
- [ ] Breakthrough moments are highlighted (yellow ring + ✨)
- [ ] Timestamps are readable and accurate
- [ ] Conversation is in correct chronological order

### Images & Content:
- [ ] Nature image loads (or shows "No image generated" gracefully)
- [ ] Reflection text displays correctly
- [ ] Encouragement message shows
- [ ] Key insights appear as bullet points

### Filtering (History List):
- [ ] "All Sessions" shows everything
- [ ] "Step 1" shows only Step 1 sessions
- [ ] "Step 2" shows only Step 2 sessions
- [ ] "Step 3" shows only Step 3 sessions
- [ ] "Mining" shows only mining sessions

### Edge Cases:
- [ ] Empty state shows when no sessions match filter
- [ ] Long reflections don't break layout
- [ ] Multiple sessions on same day display correctly
- [ ] Sessions from different months organize correctly

### Mobile Responsiveness:
- [ ] Open browser dev tools (F12)
- [ ] Toggle device toolbar (mobile view)
- [ ] Test on mobile viewport (375px width)
- [ ] Ensure cards stack vertically
- [ ] Ensure detail view is readable on small screens

---

## 🐛 How to Report Issues

If you find any issues, note down:

1. **What you were doing** - "I clicked on a session from Nov 7"
2. **What happened** - "The page went blank"
3. **What you expected** - "I expected to see the conversation"
4. **Screenshot** (if visual issue)
5. **Console errors** (F12 → Console tab)

Tell Sancho and I'll fix it immediately before P4 merge!

---

## 🧪 After Browser Testing: E2E Test Suite

Once browser testing is complete, we'll run the automated E2E tests:

```bash
npm test
```

This will run all 126 Playwright tests including:
- Walk session flows (22 tests)
- Urge support flows (35 tests)
- Daily inventory flows (43 tests)
- Dashboard/walkabout flows (26 tests)

**Expected:** All tests should pass ✅

If any fail, Sancho will investigate and fix before P4.

---

## 📊 Testing Timeline

**Estimated Time:**
- Browser testing: 15-20 minutes
- E2E test suite: 5-10 minutes (automated)
- Bug fixes (if any): Variable
- **Total:** ~30-45 minutes

---

## ✅ Sign-Off Checklist

After testing is complete:

- [ ] Browser testing completed (all checklist items ✅)
- [ ] E2E tests run and passing
- [ ] Any bugs found have been fixed
- [ ] Feature validated and approved by Fritz
- [ ] **Ready for P4 merge to main** 🚀

---

## 🆘 Quick Help

**Development server not starting?**
```bash
npm install
npm run dev
```

**No sessions showing up?**
- Complete a walk session first at `/walk`
- Or check database has sessions: Should see them in your walk history

**Page shows error?**
- Check browser console (F12)
- Copy error message
- Tell Sancho for immediate fix

**Need to see network requests?**
- F12 → Network tab
- Filter by "Fetch/XHR"
- Look for `/api/sessions/history` and `/api/sessions/[id]`

---

## 🎯 Success Criteria

**Feature is approved when:**
1. ✅ All checklist items pass
2. ✅ No critical bugs found
3. ✅ E2E tests passing
4. ✅ Fritz confirms: "Session History looks good, approved for P4"

**Then:** Sancho proceeds with P4 merge (orchestrate → main)

---

**Happy Testing! 🧪**

*If you find ANY issues or have questions, just let Sancho know!*
