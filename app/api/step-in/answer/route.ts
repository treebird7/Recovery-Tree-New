import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST to save answer and get next question
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, answerText, stepNumber, saveEntry, sessionId } = body;

    if (!questionId || !answerText || !stepNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: questionId, answerText, stepNumber' },
        { status: 400 }
      );
    }

    // Get the full question text for logging
    const { data: questionData } = await supabase
      .from('step_questions')
      .select('question_text')
      .eq('id', questionId)
      .single();

    let savedEntry = null;

    // Save to steps_journal if saveEntry is true
    if (saveEntry) {
      const { data, error } = await supabase
        .from('steps_journal')
        .insert({
          user_id: user.id,
          step_number: parseInt(stepNumber),
          question_id: questionId,
          question_text: questionData?.question_text || '',
          answer_text: answerText,
          session_id: sessionId || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving answer:', error);
        return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
      }

      savedEntry = data;
    }

    // Check if step is complete
    const { data: isComplete, error: completeError } = await supabase.rpc('check_step_completion', {
      p_user_id: user.id,
      p_step_number: parseInt(stepNumber),
    });

    if (completeError) {
      console.error('Error checking completion:', completeError);
    }

    // Get next question
    const { data: nextQuestionData } = await supabase.rpc('get_next_step_question', {
      p_user_id: user.id,
      p_step_number: parseInt(stepNumber),
    });

    // Determine if there are more questions
    const hasMore = nextQuestionData && nextQuestionData.length > 0;

    let nextQuestion = null;
    if (hasMore) {
      const q = nextQuestionData[0];
      nextQuestion = {
        id: q.question_id,
        text: q.question_text,
        type: q.question_type,
        phase: q.phase,
        phaseTitle: q.phase_title,
        followUpType: q.follow_up_type,
        followUpText: q.follow_up_text,
        conditionalFollowUp: q.conditional_follow_up,
        isFinal: q.is_final_question,
      };
    }

    return NextResponse.json({
      success: true,
      saved: saveEntry,
      savedEntry,
      stepComplete: isComplete || false,
      hasMoreQuestions: hasMore,
      nextQuestion,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
