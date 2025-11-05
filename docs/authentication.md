# Authentication Documentation

## Overview

Rooting Routine uses Supabase Authentication for user management. The authentication system supports email/password signup and login with configurable email confirmation.

## Authentication Flow

### Signup Flow

1. User submits email and password via `/signup` page
2. Client-side validation checks:
   - Passwords match
   - Password is at least 6 characters
3. `supabase.auth.signUp()` is called
4. If email confirmation is disabled (recommended for development):
   - User is logged in immediately with a session
   - Redirected to `/dashboard`
5. If email confirmation is enabled:
   - User receives confirmation email
   - Must click link to verify account
   - Link redirects to `/auth/callback`

### Login Flow

1. User submits email and password via `/login` page
2. `supabase.auth.signInWithPassword()` is called
3. On success, user is redirected to `/dashboard`
4. Session is stored in cookies automatically by Supabase

### Callback Flow

When email confirmation is enabled, the auth callback handles email verification:

1. User clicks confirmation link from email
2. Link contains auth code: `/auth/callback?code=xxx`
3. Server exchanges code for session: `exchangeCodeForSession(code)`
4. Session cookies are set
5. User is redirected to `/dashboard`

## File Structure

```
app/
├── signup/
│   └── page.tsx              # Signup form (client component)
├── login/
│   └── page.tsx              # Login form (client component)
├── auth/
│   ├── callback/
│   │   └── route.ts          # Auth callback handler (server)
│   └── auth-code-error/
│       └── page.tsx          # Error page for failed auth
lib/
└── supabase/
    ├── client.ts             # Client-side Supabase instance
    ├── server.ts             # Server-side Supabase instance
    └── middleware.ts         # Session refresh middleware
```

## Client-Side Authentication

### Creating Supabase Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Signup Example

```typescript
const supabase = createClient()

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

if (data.user && data.session) {
  // User logged in immediately (email confirmation disabled)
  window.location.href = '/dashboard'
} else {
  // Email confirmation required
  showSuccessMessage()
}
```

### Login Example

```typescript
const supabase = createClient()

const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

if (!error) {
  window.location.href = '/dashboard'
}
```

### Logout Example

```typescript
const supabase = createClient()
await supabase.auth.signOut()
router.push('/login')
```

## Server-Side Authentication

### Creating Server Client

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    }
  )
}
```

### Protected Route Example

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome {user.email}</div>
}
```

## Middleware

The middleware refreshes user sessions and protects routes:

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

The `updateSession` function:
- Refreshes expired sessions automatically
- Redirects unauthenticated users to `/login`
- Allows public access to `/login`, `/signup`, `/auth/*`, and `/`

## Supabase Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Dashboard Settings

**Authentication > Providers > Email:**
- ✅ Enable Email provider
- For development: ⬜ Uncheck "Confirm email"
- For production: ✅ Check "Confirm email"

**Authentication > URL Configuration:**
- Site URL: `http://localhost:3000` (development) or your production URL
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - Your production callback URL

## Common Issues & Solutions

### Issue: Email confirmation link shows error

**Solution:** Add callback URL to Supabase allowed redirect URLs:
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add `http://localhost:3000/auth/callback` to Redirect URLs
3. For development, consider disabling email confirmation

### Issue: User redirected to login after signup

**Solution:** Email confirmation may still be enabled. Disable it in Supabase Dashboard:
1. Authentication > Providers > Email
2. Uncheck "Confirm email"
3. Save changes

### Issue: Session not persisting after login

**Solution:** Use `window.location.href` instead of Next.js router for hard redirect:
```typescript
// ❌ Don't use router.push() immediately after auth
router.push('/dashboard')

// ✅ Use window.location.href for hard redirect
window.location.href = '/dashboard'
```

## Security Best Practices

1. **Never expose service role key** - Only use anon key in client code
2. **Use RLS policies** - Define row-level security in Supabase
3. **Validate on server** - Don't trust client-side validation alone
4. **Use HTTPS in production** - Required for secure cookies
5. **Set secure cookie options** - Supabase handles this automatically
6. **Implement rate limiting** - Protect against brute force attacks

## Testing Authentication

### Manual Testing

1. **Test Signup:**
   - Visit `/signup`
   - Fill in email and password
   - Verify redirect to dashboard or email confirmation screen

2. **Test Login:**
   - Visit `/login`
   - Use credentials from signup
   - Verify redirect to dashboard

3. **Test Protected Routes:**
   - Logout
   - Try to access `/dashboard`
   - Verify redirect to `/login`

4. **Test Session Persistence:**
   - Login
   - Refresh page
   - Verify still logged in

### Automated Testing

```typescript
// Example test with Playwright
test('user can signup and login', async ({ page }) => {
  // Signup
  await page.goto('/signup')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Verify redirect to dashboard
  await page.waitForURL('/dashboard')
  expect(page.url()).toContain('/dashboard')

  // Verify user email is displayed
  await expect(page.locator('text=test@example.com')).toBeVisible()
})
```

## Next Steps

- Implement password reset functionality
- Add social authentication (Google, GitHub, etc.)
- Add multi-factor authentication (MFA)
- Implement session management (view active sessions)
- Add email change functionality
