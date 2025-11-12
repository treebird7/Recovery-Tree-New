'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Sets up a global listener for mobile OAuth deep link callbacks
 * This hook should be called once at the app level (in layout or _app)
 * to avoid memory leaks from multiple listener registrations
 */
export function useOAuthMobileListener() {
  useEffect(() => {
    // Only set up listener on mobile platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listener: any = null;

    const setupListener = async () => {
      const { App } = await import('@capacitor/app');
      const { Browser } = await import('@capacitor/browser');

      listener = await App.addListener('appUrlOpen', async (event) => {
        console.log('App opened with URL:', event.url);

        // Check if this is an OAuth callback
        if (event.url.startsWith('com.recoverytree.app://auth/callback')) {
          try {
            // Close the browser
            await Browser.close();

            // Extract the URL parameters
            const url = new URL(event.url);
            const access_token = url.searchParams.get('access_token');
            const refresh_token = url.searchParams.get('refresh_token');
            const error = url.searchParams.get('error');
            const error_description = url.searchParams.get('error_description');

            if (error) {
              console.error('OAuth error:', error, error_description);
              // Show error to user
              alert(`Authentication failed: ${error_description || error}`);
              window.location.href = '/login';
              return;
            }

            if (access_token && refresh_token) {
              // Import Supabase client dynamically
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();

              // Set the session
              const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });

              if (sessionError) {
                console.error('Error setting session:', sessionError);
                alert(`Failed to sign in: ${sessionError.message}`);
                window.location.href = '/login';
                return;
              }

              // Redirect to dashboard on success
              window.location.href = '/dashboard';
            } else {
              console.error('No tokens found in OAuth callback URL');
              alert('Authentication failed: No credentials received');
              window.location.href = '/login';
            }
          } catch (err) {
            console.error('Error handling OAuth callback:', err);
            alert('Authentication failed. Please try again.');
            window.location.href = '/login';
          }
        }
      });
    };

    setupListener();

    // Cleanup: remove listener when component unmounts
    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []); // Empty dependency array - only run once
}
