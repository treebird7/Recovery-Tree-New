import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { location, bodyNeed } = body;

    // Create walkabout session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        session_type: 'walkabout',
        current_step: 'step1', // Required field, but not used for walkabout
        location,
        body_need: bodyNeed,
        step_responses: [], // Initialize empty conversation array
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error('Error creating walkabout session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create walkabout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      startedAt: session.started_at,
    });
  } catch (error) {
    console.error('Error in /api/walkabout/start:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
