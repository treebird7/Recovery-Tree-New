import { createClient } from '@/lib/supabase/client';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Check if running on a mobile device (iOS or Android)
 */
export function isMobile(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the appropriate redirect URL for OAuth based on platform
 */
export function getOAuthRedirectUrl(redirectTo?: string): string {
  if (isMobile()) {
    // Mobile deep link
    return 'com.recoverytree.app://auth/callback';
  }

  // Web redirect
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return `${baseUrl}/auth/callback`;
}

/**
 * Sign in with OAuth provider (works on both web and mobile)
 */
export async function signInWithOAuth(
  provider: 'google' | 'apple',
  redirectTo?: string
): Promise<{ error: string | null }> {
  try {
    const supabase = createClient();
    const redirectUrl = getOAuthRedirectUrl(redirectTo);

    console.log('OAuth flow starting:', {
      provider,
      platform: isMobile() ? 'mobile' : 'web',
      redirectUrl,
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        // Skip browser redirect on mobile - we'll handle it manually
        skipBrowserRedirect: isMobile(),
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return { error: error.message };
    }

    // On mobile, manually open the OAuth URL in the system browser
    if (isMobile() && data?.url) {
      console.log('Opening OAuth URL in system browser:', data.url);

      // Use Capacitor Browser to open OAuth URL
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: data.url });

      // Listen for the app to come back from the browser
      App.addListener('appUrlOpen', async (event) => {
        console.log('App opened with URL:', event.url);

        // Check if this is an OAuth callback
        if (event.url.startsWith('com.recoverytree.app://auth/callback')) {
          // Close the browser
          await Browser.close();

          // Extract the URL parameters
          const url = new URL(event.url);
          const access_token = url.searchParams.get('access_token');
          const refresh_token = url.searchParams.get('refresh_token');

          if (access_token && refresh_token) {
            // Set the session
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) {
              console.error('Error setting session:', sessionError);
              return { error: sessionError.message };
            }

            // Redirect to the dashboard or specified page
            if (typeof window !== 'undefined') {
              window.location.href = redirectTo || '/dashboard';
            }
          }
        }
      });

      return { error: null };
    }

    // On web, the user will be redirected automatically
    return { error: null };
  } catch (error) {
    console.error('OAuth sign in error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to sign in with OAuth',
    };
  }
}

/**
 * Handle OAuth callback (for web)
 * This is called from the /auth/callback route
 */
export async function handleOAuthCallback(
  code: string,
  redirectTo?: string
): Promise<{ error: string | null }> {
  try {
    const supabase = createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return { error: error.message };
    }

    // Redirect to the dashboard or specified page
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo || '/dashboard';
    }

    return { error: null };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to complete OAuth flow',
    };
  }
}
