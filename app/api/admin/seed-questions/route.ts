import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import questionsData from '@/20251112_Step_Questions_Database_Import.json';

// Admin-only endpoint to seed step questions from JSON
// WARNING: Run this ONCE after migration, then disable or protect
export async function POST() {
  try {
    const supabase = createAdminClient();

    // TODO: Add admin authentication check here
    // For now, this is unprotected - only run locally

    const questions = [
      ...questionsData.step_1_questions,
      ...questionsData.step_2_questions,
      ...questionsData.step_3_questions,
    ];

    console.log(`Seeding ${questions.length} questions...`);

    // Insert all questions
    const { data, error } = await supabase
      .from('step_questions')
      .insert(questions.map((q: any) => ({
        id: q.id,
        step_number: q.step_number,
        phase: q.phase,
        phase_title: q.phase_title,
        question_order: q.question_order,
        question_text: q.question_text,
        question_type: q.question_type,
        is_required: q.is_required,
        follow_up_type: q.follow_up_type || null,
        follow_up_text: q.follow_up_text || null,
        conditional_follow_up: q.conditional_follow_up || null,
        safety_flag: q.safety_flag || false,
        completion_marker: q.completion_marker || false,
        data_logging: q.data_logging || [],
        is_active: q.is_active !== false, // Default to true if not specified
      })));

    if (error) {
      console.error('Seed error:', error);
      return NextResponse.json({ error: 'Failed to seed questions', details: error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${questions.length} questions`,
      breakdown: {
        step_1: questionsData.step_1_questions.length,
        step_2: questionsData.step_2_questions.length,
        step_3: questionsData.step_3_questions.length,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to check seed status
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { count, error } = await supabase
      .from('step_questions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to check seed status' }, { status: 500 });
    }

    return NextResponse.json({
      seeded: count !== null && count > 0,
      question_count: count,
      expected: 65,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
