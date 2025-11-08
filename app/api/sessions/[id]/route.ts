import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sessionId = params.id;

    // Fetch full session details
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching session details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch session details' },
        { status: 500 }
      );
    }

    // Calculate duration
    let durationMinutes = 0;
    if (session.completed_at && session.started_at) {
      const start = new Date(session.started_at);
      const end = new Date(session.completed_at);
      durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }

    // For mining sessions, use stored duration if available
    if (session.session_type === 'mining' && session.mining_duration_minutes) {
      durationMinutes = session.mining_duration_minutes;
    }

    // Format response
    return NextResponse.json({
      id: session.id,
      session_type: session.session_type,
      started_at: session.started_at,
      completed_at: session.completed_at,
      duration_minutes: durationMinutes,
      coins_earned: session.coins_earned || 0,

      // Pre-session data
      pre_walk_mood: session.pre_walk_mood,
      pre_walk_intention: session.pre_walk_intention,

      // Conversation
      step_responses: session.step_responses || [],
      current_step: session.current_step,

      // Post-session data
      final_reflection: session.final_reflection,
      generated_image_url: session.generated_image_url,
      encouragement_message: session.encouragement_message,
      insights: session.insights || [],
    });
  } catch (error) {
    console.error('Error in /api/sessions/[id]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
