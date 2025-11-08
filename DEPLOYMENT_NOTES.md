# Deployment Notes - Recovery Tree

This file tracks deployment-related decisions, configurations, and troubleshooting history.

---

## 2025-11-08: Vercel Deployment Crisis Resolution

### Environment Variables Configuration

**Added to Vercel (Production, Preview, Development):**
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key (RLS protected)
- `SUPABASE_SERVICE_KEY` - Server-side admin key (NEVER prefix with NEXT_PUBLIC_)
- `ANTHROPIC_API_KEY` - Elder Tree AI functionality
- `FAL_API_KEY` - Nature imagery generation
- `NEXT_PUBLIC_APP_URL` - Application URL for redirects
- `SESSION_TIMEOUT_MINUTES` - Session configuration

**Important:** Variables prefixed with `NEXT_PUBLIC_` are intentionally exposed to the browser. All others are server-side only.

---

### ESLint Configuration Fix

**Issue:** Build failing on unescaped quotes/apostrophes in JSX

**Solution:** Disabled the rule in `.eslintrc.json`:
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off"
  }
}
```

**Technical Debt:** Should properly escape entities later, but this unblocks deployment.

---

### LemonSqueezy Webhook Temporarily Disabled

**Context:** The LemonSqueezy webhook route (`app/api/lemonsqueezy/webhook/route.ts`) was causing build failures due to Supabase client initialization at module level. The webhook was attempting to create a Supabase admin client during Next.js build time (pre-rendering), when environment variables weren't available yet.

**Decision:** Temporarily disabled the entire LemonSqueezy API route by renaming the folder:
```bash
mv app/api/lemonsqueezy app/api/lemonsqueezy.disabled
```

**Rationale:** 
- Core app deployment took priority over payment webhooks
- Webhooks aren't needed for MVP testing phase
- Preserves all code without deletion for easy re-enablement later
- Allows focus on getting the main app working first

**To Re-enable Later:**
```bash
mv app/api/lemonsqueezy.disabled app/api/lemonsqueezy
```

**Fix Required When Re-enabling:**
Move `createClient()` call INSIDE the POST function (not at module level) so it only runs at request time:
```typescript
export async function POST(req: NextRequest) {
  // Create client HERE, not at top of file
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  // ... rest of handler
}
```

**Additional Steps for Re-enabling:**
1. Add `LEMONSQUEEZY_WEBHOOK_SECRET` to Vercel environment variables
2. Test webhook locally first with `vercel dev`
3. Verify LemonSqueezy webhook endpoint in dashboard points to production URL
4. Test with LemonSqueezy webhook testing tool before going live

**Related Files:**
- `app/api/lemonsqueezy.disabled/webhook/route.ts`
- `.env.local` - contains LEMONSQUEEZY_WEBHOOK_SECRET

---

## Deployment Workflow Improvements Needed

**Current Pain Points (2025-11-08):**
- Manual copy-paste of code between Watson (Claude chat) and VS Code is inefficient
- Build errors only discovered after push → wait → fail cycle
- No local build testing before pushing to Vercel

**Planned Improvements:**
1. Use Claude Code Web for direct file editing (Watson diagnoses, Claude Code executes)
2. Install Vercel CLI for local build testing: `npm install -g vercel`
3. Test builds locally before pushing: `vercel build`
4. Consider pre-commit hooks for build validation

---

## Future Deployment Checklist

Before pushing to production:
- [ ] All environment variables added to Vercel
- [ ] Local build succeeds (`npm run build`)
- [ ] ESLint passes (or rules explicitly disabled with rationale)
- [ ] No module-level API client initialization (causes pre-render issues)
- [ ] All external API routes tested locally with `vercel dev`

---

## Known Issues

### Payment Integration
- LemonSqueezy webhooks currently disabled (see above)
- Subscription management UI exists but webhooks need re-enabling for full functionality

### Build Performance
- Current build time: ~2-3 minutes
- No optimization done yet - acceptable for MVP phase

---

*Last updated: 2025-11-08*