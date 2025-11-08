import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSession, getIncompleteSession } from '@/lib/services/session';
import { ConversationManager } from '@/lib/services/conversation-manager';

/**
 * POST /api/session/start
 *
 * Creates a new recovery walk session or resumes an existing incomplete session.
 * Initializes conversation with Elder Tree for the specified step.
 *
 * @param request.body.step - The step to work on: 'step1' | 'step2' | 'step3'
 * @param request.body.preWalkMood - Optional pre-walk mood check-in
 * @param request.body.preWalkIntention - Optional pre-walk intention
 * @param request.body.resumeSession - Whether to resume incomplete session if exists
 *
 * @returns Session data with initial question from Elder Tree
 * @returns 401 if not authenticated
 * @returns 400 if invalid step
 * @returns 500 if session creation fails
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
      step,
      preWalkMood,
      preWalkIntention,
      location,
      bodyNeed,
      resumeSession,
    }: {
      step: 'step1' | 'step2' | 'step3';
      preWalkMood?: string;
      preWalkIntention?: string;
      location?: string;
      bodyNeed?: string;
      resumeSession?: boolean;
    } = body;

    // Validate step
    if (!step || !['step1', 'step2', 'step3'].includes(step)) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    // Check if user has an incomplete session
    if (resumeSession) {
      const { data: incompleteSession, error: incompleteError } = await getIncompleteSession(
        user.id
      );

      if (!incompleteError && incompleteSession) {
        // Resume existing session
        const manager = new ConversationManager(
          incompleteSession.current_step,
          incompleteSession.step_responses
        );

        return NextResponse.json({
          sessionId: incompleteSession.id,
          step: incompleteSession.current_step,
          initialQuestion: manager.getInitialQuestion(),
          conversationHistory: incompleteSession.step_responses,
          isResumed: true,
        });
      }
    }

    // Create new session
    const { data: session, error: sessionError } = await createSession(
      user.id,
      step,
      preWalkMood,
      preWalkIntention,
      location,
      bodyNeed
    );

    if (sessionError || !session) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Initialize conversation manager
    const manager = new ConversationManager(step, undefined, location, bodyNeed);
    const initialQuestion = manager.getInitialQuestion();

    return NextResponse.json({
      sessionId: session.id,
      step: session.current_step,
      initialQuestion,
      conversationHistory: [],
      isResumed: false,
    });
  } catch (error) {
    console.error('Error in /api/session/start:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/session/start
 *
 * Checks if user has an incomplete session that can be resumed.
 * Used to prevent users from starting multiple concurrent sessions.
 *
 * @returns hasIncompleteSession - Boolean indicating if incomplete session exists
 * @returns session - The incomplete session data if found
 * @returns 401 if not authenticated
 */
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

    // Check for incomplete session
    const { data: incompleteSession, error } = await getIncompleteSession(user.id);

    if (error) {
      return NextResponse.json({ hasIncompleteSession: false });
    }

    return NextResponse.json({
      hasIncompleteSession: !!incompleteSession,
      session: incompleteSession,
    });
  } catch (error) {
    console.error('Error in /api/session/start GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
