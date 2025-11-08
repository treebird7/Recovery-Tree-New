import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { awardCoins, getUserCoins } from '@/lib/services/mining';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { sessionId, duration } = body; // duration in minutes

    if (!sessionId || duration === undefined) {
      return NextResponse.json(
        { error: 'Missing sessionId or duration' },
        { status: 400 }
      );
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate coins (1 coin per minute, minimum 1)
    const coinsEarned = Math.max(1, Math.floor(duration));

    // Complete session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        completed_at: new Date().toISOString(),
        coins_earned: coinsEarned,
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error completing walkabout session:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete walkabout session' },
        { status: 500 }
      );
    }

    // Award coins
    if (coinsEarned > 0) {
      await awardCoins(user.id, coinsEarned);
    }

    // Get updated total coins
    const { coins: totalCoins } = await getUserCoins(user.id);

    return NextResponse.json({
      coinsEarned,
      totalCoins,
      duration,
    });
  } catch (error) {
    console.error('Error in /api/walkabout/end:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
