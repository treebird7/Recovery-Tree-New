import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession, updateSessionResponses } from '@/lib/services/session';
import { ConversationManager, createFromSavedSession } from '@/lib/services/conversation-manager';

/**
 * POST /api/session/question
 *
 * Processes user's answer to Elder Tree question and generates next question.
 * Tracks conversation history, breakthrough moments, and red flags.
 *
 * @param request.body.sessionId - The active session ID
 * @param request.body.answer - User's answer to current question
 *
 * @returns nextQuestion - Elder Tree's next question
 * @returns hasRedFlags - Whether answer triggered vagueness detection
 * @returns isBreakthrough - Whether answer showed insight/progress
 * @returns shouldComplete - Whether session should be completed
 * @returns analytics - Current session stats
 * @returns 401 if not authenticated
 * @returns 403 if session doesn't belong to user
 * @returns 404 if session not found
 * @returns 500 if update fails
 */
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
      answer,
    }: {
      sessionId: string;
      answer: string;
    } = body;

    if (!sessionId || !answer) {
      return NextResponse.json(
        { error: 'Missing sessionId or answer' },
        { status: 400 }
      );
    }

    // Get session from database
    const { data: session, error: sessionError } = await getSession(sessionId);

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify session belongs to user
    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Recreate conversation manager from saved state
    const manager = createFromSavedSession(
      session.current_step,
      session.step_responses
    );

    // Process answer and get next question
    const { nextQuestion, hasRedFlags, isBreakthrough, shouldComplete } =
      await manager.processAnswerAndGetNext(answer);

    // Update session with new conversation history
    const updatedHistory = manager.getHistory();
    const { error: updateError } = await updateSessionResponses(
      sessionId,
      updatedHistory
    );

    if (updateError) {
      console.error('Error updating session responses:', updateError);
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      );
    }

    // Get analytics
    const analytics = manager.getAnalytics();

    return NextResponse.json({
      nextQuestion,
      hasRedFlags,
      isBreakthrough,
      shouldComplete,
      analytics: {
        questionsCompleted: analytics.questionsCompleted,
        breakthroughMoments: analytics.breakthroughMoments,
        redFlagsEncountered: analytics.redFlagsEncountered,
      },
    });
  } catch (error) {
    console.error('Error in /api/session/question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
