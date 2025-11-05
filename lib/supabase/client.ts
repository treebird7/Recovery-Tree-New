import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Let Supabase handle cookies automatically - no custom cookie handlers
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
