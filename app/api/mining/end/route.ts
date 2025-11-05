import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { endMiningSession } from '@/lib/services/mining';

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
    const {
      sessionId,
      userState,
    }: {
      sessionId: string;
      userState?: 'stable' | 'crisis';
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', sessionId)
      .eq('session_type', 'mining')
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // End the mining session
    const { stats, error: endError } = await endMiningSession(
      sessionId,
      userState || 'stable'
    );

    if (endError || !stats) {
      console.error('Error ending mining session:', endError);
      return NextResponse.json(
        { error: 'Failed to end mining session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stats,
      message: 'Mining session completed',
    });
  } catch (error) {
    console.error('Error in /api/mining/end:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
