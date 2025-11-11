import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withTimeout, validateEnvVars, formatErrorResponse } from '@/lib/api-utils'

export async function POST(request: Request) {
  try {
    // Validate environment variables
    validateEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set on both the cookieStore and the response
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Add timeout to prevent hanging - 10 second timeout
    const { error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email,
        password,
      }),
      10000
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    const { message, status } = formatErrorResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
