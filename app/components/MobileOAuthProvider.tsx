'use client';

import { useOAuthMobileListener } from '../hooks/useOAuthMobileListener';

/**
 * Client component that sets up mobile OAuth deep link listener
 * Used in the root layout to handle OAuth callbacks on mobile
 */
export function MobileOAuthProvider({ children }: { children: React.ReactNode }) {
  useOAuthMobileListener();
  return <>{children}</>;
}
