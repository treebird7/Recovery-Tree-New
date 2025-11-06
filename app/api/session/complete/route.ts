import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getSession,
  completeSession,
  createSessionAnalytics,
} from '@/lib/services/session';
import {
  generateReflection,
  generateEncouragement,
  extractInsights,
} from '@/lib/services/anthropic';
import { analyzeMood, getMoodDescription } from '@/lib/services/fal-ai';
import { selectNatureImage } from '@/lib/services/unsplash-images';
import { createFromSavedSession } from '@/lib/services/conversation-manager';
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
    const {
      sessionId,
      walkDuration,
    }: {
      sessionId: string;
      walkDuration?: number; // in minutes
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
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

    // Check if already completed
    if (session.completed_at) {
      return NextResponse.json({
        reflection: session.final_reflection,
        encouragement: session.encouragement_message,
        imageUrl: session.generated_image_url,
        insights: session.insights,
        mood: analyzeMood(session.step_responses),
        alreadyCompleted: true,
      });
    }

    console.log(`Completing session ${sessionId}...`);

    // Generate reflection using Anthropic
    console.log('Generating reflection...');
    const reflection = await generateReflection({
      conversationHistory: session.step_responses,
      currentStep: session.current_step,
      preWalkMood: session.pre_walk_mood || undefined,
      preWalkIntention: session.pre_walk_intention || undefined,
    });

    // Generate encouragement message
    console.log('Generating encouragement...');
    const encouragement = await generateEncouragement(reflection);

    // Extract insights
    console.log('Extracting insights...');
    const insights = await extractInsights(session.step_responses);

    // Determine mood and select nature image
    const mood = analyzeMood(session.step_responses);
    console.log(`Selecting nature image for mood: ${mood}`);
    const imageUrl = selectNatureImage(mood);

    // Complete session in database
    const { error: completeError } = await completeSession(
      sessionId,
      reflection,
      encouragement,
      imageUrl,
      insights
    );

    if (completeError) {
      console.error('Error completing session:', completeError);
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    // Create analytics record
    const manager = createFromSavedSession(
      session.current_step,
      session.step_responses
    );
    const analytics = manager.getAnalytics();

    await createSessionAnalytics(sessionId, {
      walkDuration,
      questionsCompleted: analytics.questionsCompleted,
      stepWorked: session.current_step,
      vagueAnswersCount: analytics.redFlagsEncountered,
      breakthroughMoments: analytics.breakthroughMoments,
      pushbackCount: analytics.redFlagsEncountered, // Pushback happens when red flags detected
    });

    // Award coins based on walk duration (1 coin per minute, minimum 1)
    const coinsEarned = walkDuration ? Math.max(1, walkDuration) : 0;

    if (coinsEarned > 0) {
      console.log(`Awarding ${coinsEarned} coins for ${walkDuration} minute walk...`);
      await awardCoins(user.id, coinsEarned);

      // Update session with coins earned
      const supabase = await createClient();
      await supabase
        .from('sessions')
        .update({ coins_earned: coinsEarned })
        .eq('id', sessionId);
    }

    // Get updated total coins
    const { coins: totalCoins } = await getUserCoins(user.id);

    // Get mood description
    const moodDescription = getMoodDescription(mood);

    console.log(`Session ${sessionId} completed successfully!`);

    return NextResponse.json({
      reflection,
      encouragement,
      imageUrl,
      insights,
      mood,
      moodDescription,
      coinsEarned,
      totalCoins,
      location: session.location || undefined,
      bodyNeed: session.body_need || undefined,
      analytics: {
        questionsCompleted: analytics.questionsCompleted,
        breakthroughMoments: analytics.breakthroughMoments,
        walkDuration,
      },
    });
  } catch (error) {
    console.error('Error in /api/session/complete:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
