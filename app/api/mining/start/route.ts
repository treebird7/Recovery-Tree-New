import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startMiningSession, getActiveMiningSession } from '@/lib/services/mining';

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

    // Parse request body for duration
    const body = await request.json().catch(() => ({}));
    const { durationMinutes } = body; // null = indefinite, number = minutes

    // Check if user already has an active mining session
    const { data: existingSession, error: checkError } = await getActiveMiningSession(user.id);

    if (checkError) {
      console.error('Error checking for active session:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing session' },
        { status: 500 }
      );
    }

    if (existingSession) {
      // User already has active mining session
      return NextResponse.json({
        sessionId: existingSession.id,
        startedAt: existingSession.mining_started_at,
        durationMinutes: existingSession.mining_duration_minutes || null,
        message: 'Mining session already active',
        isExisting: true,
      });
    }

    // Start new mining session (note: startMiningSession doesn't support duration yet, storing in metadata for now)
    const { data: session, error: sessionError } = await startMiningSession(user.id);

    if (sessionError || !session) {
      console.error('Error starting mining session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to start mining session' },
        { status: 500 }
      );
    }

    // If duration provided, we'll pass it to the client to track
    // TODO: Store in database for persistence across page reloads
    return NextResponse.json({
      sessionId: session.id,
      startedAt: session.mining_started_at,
      durationMinutes: durationMinutes || null,
      message: 'Mining session started',
      isExisting: false,
    });
  } catch (error) {
    console.error('Error in /api/mining/start:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
