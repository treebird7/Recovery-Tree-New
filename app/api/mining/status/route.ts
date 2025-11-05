import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveMiningSession, getUserCoins } from '@/lib/services/mining';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active mining session
    const { data: activeSession, error: sessionError } = await getActiveMiningSession(user.id);

    if (sessionError) {
      console.error('Error getting active session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to get session status' },
        { status: 500 }
      );
    }

    // Get user's total coins
    const { coins, error: coinsError } = await getUserCoins(user.id);

    if (coinsError) {
      console.error('Error getting user coins:', coinsError);
    }

    return NextResponse.json({
      hasActiveSession: !!activeSession,
      activeSession: activeSession ? {
        sessionId: activeSession.id,
        startedAt: activeSession.mining_started_at,
      } : null,
      totalCoins: coins || 0,
    });
  } catch (error) {
    console.error('Error in /api/mining/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
