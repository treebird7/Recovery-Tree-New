import { createClient } from '../supabase/server';
import { ConversationTurn } from './conversation-manager';

export interface Session {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  pre_walk_mood: string | null;
  pre_walk_intention: string | null;
  location: string | null;
  body_need: string | null;
  session_type: string | null;
  current_step: 'step1' | 'step2' | 'step3';
  step_responses: ConversationTurn[];
  final_reflection: string | null;
  generated_image_url: string | null;
  encouragement_message: string | null;
  insights: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SessionAnalytics {
  id: string;
  session_id: string;
  walk_duration: number | null;
  questions_completed: number;
  step_worked: 'step1' | 'step2' | 'step3' | 'mixed';
  vague_answers_count: number;
  breakthrough_moments: number;
  pushback_count: number;
  created_at: string;
}

/**
 * Create a new nature therapy session
 */
export async function createSession(
  userId: string,
  step: 'step1' | 'step2' | 'step3',
  preWalkMood?: string,
  preWalkIntention?: string,
  location?: string,
  bodyNeed?: string
): Promise<{ data: Session | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      current_step: step,
      pre_walk_mood: preWalkMood || null,
      pre_walk_intention: preWalkIntention || null,
      location: location || null,
      body_need: bodyNeed || null,
      step_responses: [],
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update session with new conversation turn
 */
export async function updateSessionResponses(
  sessionId: string,
  responses: ConversationTurn[]
): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('sessions')
    .update({
      step_responses: responses,
    })
    .eq('id', sessionId);

  return { error };
}

/**
 * Complete a session with reflection and image
 */
export async function completeSession(
  sessionId: string,
  finalReflection: string,
  encouragementMessage: string,
  imageUrl: string | null,
  insights: string[]
): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('sessions')
    .update({
      completed_at: new Date().toISOString(),
      final_reflection: finalReflection,
      encouragement_message: encouragementMessage,
      generated_image_url: imageUrl,
      insights,
    })
    .eq('id', sessionId);

  return { error };
}

/**
 * Get a session by ID
 */
export async function getSession(
  sessionId: string
): Promise<{ data: Session | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  return { data, error };
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(
  userId: string,
  limit: number = 20
): Promise<{ data: Session[] | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Get user's most recent incomplete session (if any)
 */
export async function getIncompleteSession(
  userId: string
): Promise<{ data: Session | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}

/**
 * Delete a session (user wants to remove from history)
 */
export async function deleteSession(sessionId: string): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase.from('sessions').delete().eq('id', sessionId);

  return { error };
}

/**
 * Create session analytics record
 */
export async function createSessionAnalytics(
  sessionId: string,
  analytics: {
    walkDuration?: number;
    questionsCompleted: number;
    stepWorked: 'step1' | 'step2' | 'step3' | 'mixed';
    vagueAnswersCount: number;
    breakthroughMoments: number;
    pushbackCount: number;
  }
): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase.from('session_analytics').insert({
    session_id: sessionId,
    walk_duration: analytics.walkDuration || null,
    questions_completed: analytics.questionsCompleted,
    step_worked: analytics.stepWorked,
    vague_answers_count: analytics.vagueAnswersCount,
    breakthrough_moments: analytics.breakthroughMoments,
    pushback_count: analytics.pushbackCount,
  });

  return { error };
}

/**
 * Get analytics for a session
 */
export async function getSessionAnalytics(
  sessionId: string
): Promise<{ data: SessionAnalytics | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('session_analytics')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  return { data, error };
}

/**
 * Get user's session streak (consecutive days with completed sessions)
 */
export async function getUserStreak(userId: string): Promise<{ streak: number; error: any }> {
  const supabase = await createClient();

  // Get all completed sessions ordered by date
  const { data, error } = await supabase
    .from('sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  if (error || !data) {
    return { streak: 0, error };
  }

  // Calculate streak
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of data) {
    const sessionDate = new Date(session.completed_at!);
    sessionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break; // Streak is broken
    }
  }

  return { streak, error: null };
}

/**
 * Get total completed sessions for user
 */
export async function getTotalCompletedSessions(
  userId: string
): Promise<{ count: number; error: any }> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('completed_at', 'is', null);

  return { count: count || 0, error };
}
