import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET next question for user on current step
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stepNumber = searchParams.get('step');

    if (!stepNumber || !['1', '2', '3'].includes(stepNumber)) {
      return NextResponse.json({ error: 'Invalid step number' }, { status: 400 });
    }

    // Call Watson's helper function to get next question
    const { data, error } = await supabase.rpc('get_next_step_question', {
      p_user_id: user.id,
      p_step_number: parseInt(stepNumber),
    });

    if (error) {
      console.error('Error fetching next question:', error);
      return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
    }

    // If no question returned, user has completed all questions for this step
    if (!data || data.length === 0) {
      return NextResponse.json({
        completed: true,
        message: 'All questions for this step have been answered',
      });
    }

    const question = data[0];

    return NextResponse.json({
      completed: false,
      question: {
        id: question.question_id,
        text: question.question_text,
        type: question.question_type,
        phase: question.phase,
        phaseTitle: question.phase_title,
        followUpType: question.follow_up_type,
        followUpText: question.follow_up_text,
        conditionalFollowUp: question.conditional_follow_up,
        isFinal: question.is_final_question,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
