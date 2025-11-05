'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log('Login error:', error.message)
    return { error: error.message }
  }

  console.log('Login successful - user:', data.user?.email, 'session:', !!data.session)

  // Explicitly set the session to ensure cookies are saved
  if (data.session) {
    const { error: setError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (setError) {
      console.log('Error setting session:', setError.message)
      return { error: setError.message }
    }
  }

  // Verify we can read the session back
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Can read session back after setSession:', !!session, session?.user?.email)

  // Force Next.js to revalidate cached data
  revalidatePath('/', 'layout')

  return { success: true }
}
