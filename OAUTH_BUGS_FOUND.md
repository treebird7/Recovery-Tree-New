# OAuth Implementation - Bugs Found

**Date**: 2025-11-12
**Branch**: `claude/setup-capacitor-mobile-011CUsMxsCyDebA2pXQRJfNL`
**Status**: ⚠️ MULTIPLE CRITICAL BUGS FOUND

---

## Critical Bugs

### 🔴 Bug 1: Memory Leak in Mobile OAuth Flow
**File**: `lib/auth/oauth.ts:69-100`
**Severity**: CRITICAL

**Problem**:
- The `App.addListener('appUrlOpen', ...)` is called **inside** the `signInWithOAuth()` function
- Every time the user clicks an OAuth button, a NEW listener is added
- Listeners are NEVER removed
- This causes:
  - Memory leaks
  - Multiple callbacks firing for the same OAuth return
  - Potential duplicate sessions

**Current Code**:
```typescript
export async function signInWithOAuth(...) {
  // ...

  // Listen for the app to come back from the browser
  App.addListener('appUrlOpen', async (event) => {  // ❌ WRONG - adds listener every time
    // handle callback
  });

  return { error: null };
}
```

**Fix Required**:
- Move the listener setup to app initialization (e.g., `_app.tsx` or layout)
- Add listener only ONCE when app starts
- Remove listener when component unmounts
- Use a state management solution to communicate between listener and UI

---

### 🔴 Bug 2: Build Failure - Static Generation Error
**File**: `app/auth-callback/page.tsx` and `app/signup/page.tsx`
**Severity**: CRITICAL (Blocks deployment)

**Problem**:
- Next.js 15 tries to statically generate pages at build time
- Pages use `createClient()` which requires environment variables at build time
- Build fails with: `Your project's URL and API key are required to create a Supabase client!`

**Error**:
```
Error occurred prerendering page "/signup"
Error: @supabase/ssr: Your project's URL and API key are required
```

**Fix Required**:
- Add `export const dynamic = 'force-dynamic'` to pages that use Supabase client-side
- Affected pages:
  - `app/auth-callback/page.tsx`
  - `app/signup/page.tsx`
  - `app/login/page.tsx`

---

### 🟡 Bug 3: Wrong Return Logic in Mobile Callback
**File**: `lib/auth/oauth.ts:91`
**Severity**: MEDIUM

**Problem**:
- Inside the event listener callback, there's a `return { error: sessionError.message }`
- This return statement doesn't actually return from the main `signInWithOAuth()` function
- The error won't be properly propagated to the UI
- The function already returned `{ error: null }` before the listener fires

**Current Code**:
```typescript
App.addListener('appUrlOpen', async (event) => {
  // ...
  if (sessionError) {
    return { error: sessionError.message };  // ❌ This doesn't propagate
  }
});

return { error: null };  // Function already returned before listener fires
```

**Fix Required**:
- Use a callback or state management to communicate errors from the listener
- Or show errors directly in the listener (toast/alert)

---

### 🟡 Bug 4: Missing Environment Variable Documentation
**File**: `lib/auth/oauth.ts:24`
**Severity**: LOW (has fallback)

**Problem**:
- Code uses `process.env.NEXT_PUBLIC_SITE_URL`
- This variable is NOT in `.env.local.example`
- Falls back to `http://localhost:3000` (okay for dev, wrong for prod)

**Current Code**:
```typescript
const baseUrl = typeof window !== 'undefined'
  ? window.location.origin
  : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';  // ❌ Not documented
```

**Fix Required**:
- Add `NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN` to `.env.local.example`
- Or always use `window.location.origin` (safer)

---

## Additional Issues

### ⚠️ Issue 1: Dependency Installation
**Status**: FIXED (ran `npm install`)

- `@capacitor/app` and `@capacitor/browser` were in package.json
- But not installed in node_modules
- Running `npm install` fixed this

---

### ⚠️ Issue 2: Route Confusion
**Status**: INTENTIONAL (not a bug)

- OAuth callback: `/auth-callback` (new route)
- Email callback: `/auth/callback` (existing route)
- This is intentional separation, but could be confusing
- Consider documenting the difference

---

## Build Test Results

**Command**: `npm run build`
**Result**: ❌ FAILED

**Error**:
```
Error occurred prerendering page "/signup"
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**Cause**: Static generation + missing env vars + client-side Supabase calls

---

## Code Quality Review

### ✅ Good Practices Found:
- Comprehensive error handling
- Loading states in UI
- Platform detection (web vs mobile)
- User-friendly error messages
- Proper TypeScript typing
- Suspense boundaries for Next.js 15

### ❌ Issues Found:
- Memory leak (listener not cleaned up)
- Build failure (static generation)
- Wrong error propagation
- Missing env var documentation

---

## Recommended Fixes (Priority Order)

### 1. FIX CRITICAL: Move Mobile Listener to App Level
**File**: Create `app/layout.tsx` mobile listener hook

```typescript
// app/hooks/useOAuthMobileListener.ts
'use client';

import { useEffect } from 'use';
import { App } from '@capacitor/app';
import { createClient } from '@/lib/supabase/client';
import { Browser } from '@capacitor/browser';

export function useOAuthMobileListener() {
  useEffect(() => {
    const listener = App.addListener('appUrlOpen', async (event) => {
      if (event.url.startsWith('com.recoverytree.app://auth/callback')) {
        await Browser.close();

        const url = new URL(event.url);
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');

        if (access_token && refresh_token) {
          const supabase = createClient();
          await supabase.auth.setSession({ access_token, refresh_token });
          window.location.href = '/dashboard';
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      listener.remove();
    };
  }, []);
}
```

### 2. FIX CRITICAL: Add Dynamic Rendering
**Files**: `app/auth-callback/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`

Add to top of each file:
```typescript
export const dynamic = 'force-dynamic';
```

### 3. FIX MEDIUM: Simplify oauth.ts
Remove the listener logic from `signInWithOAuth()` since it's now in the app-level hook.

### 4. FIX LOW: Document Environment Variable
Add to `.env.local.example`:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Testing Checklist (After Fixes)

- [ ] Build passes: `npm run build`
- [ ] Dev server starts: `npm run dev`
- [ ] Login page loads without errors
- [ ] Signup page loads without errors
- [ ] OAuth buttons render
- [ ] Clicking OAuth button doesn't crash
- [ ] Multiple clicks don't add multiple listeners
- [ ] (With providers configured) OAuth flow completes

---

## Recommendation

**DO NOT MERGE** until:
1. ✅ Critical bugs are fixed
2. ✅ Build passes successfully
3. ✅ Manual testing confirms no crashes
4. ✅ Memory leak is resolved

**Estimated Fix Time**: 30-60 minutes

---

**Report Generated**: 2025-11-12
**Reviewed By**: Sancho (Claude Agent)
