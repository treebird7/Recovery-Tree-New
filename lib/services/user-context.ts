/**
 * User Context Service
 *
 * Manages user recovery context and session summaries for Elder Tree cross-session memory.
 */

import { createClient } from '@/lib/supabase/server';

// ============================================================================
// Type Definitions
// ============================================================================

export interface UserContext {
  id: string;
  user_id: string;

  // Recovery Identity
  preferred_name?: string | null;
  addiction_type?: string | null;
  recovery_start_date?: string | null;
  current_step?: number | null;
  step_progress?: StepProgress[];

  // Support System
  has_sponsor?: boolean;
  sponsor_name?: string | null;
  in_fellowship?: boolean;
  fellowship_name?: string | null;
  has_therapist?: boolean;
  other_support?: any[];

  // Zone Definitions
  red_zone_behaviors?: string[];
  yellow_zone_behaviors?: string[];
  green_zone_behaviors?: string[];

  // Patterns & Triggers
  known_triggers?: string[];
  vulnerability_windows?: any[];
  successful_strategies?: string[];

  // Preferences
  spiritual_framework?: string | null;
  prayer_comfort_level?: string | null;

  // Contextual Memory
  recent_themes?: string[];
  context_summary?: string | null;
  last_summary_update?: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface StepProgress {
  step: number;
  started?: string;
  completed?: string;
}

export interface SessionSummary {
  id: string;
  user_id: string;
  session_id: string;

  // Session Context
  urge_intensity?: number | null;
  primary_trigger?: string | null;
  resistance_strategy_used?: string | null;
  outcome?: 'urge_passed' | 'relapsed' | 'ongoing_struggle' | 'reflection_only' | null;

  // Insights
  key_insights?: string[];
  emotional_state_start?: string | null;
  emotional_state_end?: string | null;
  follow_up_needed?: string | null;

  // Profile Updates
  profile_updates?: Record<string, any>;

  // Metadata
  completed_at: string;
  created_at: string;
}

export interface UserContextUpdate {
  preferred_name?: string;
  addiction_type?: string;
  recovery_start_date?: string;
  current_step?: number;
  step_progress?: StepProgress[];
  has_sponsor?: boolean;
  sponsor_name?: string;
  in_fellowship?: boolean;
  fellowship_name?: string;
  has_therapist?: boolean;
  known_triggers?: string[];
  red_zone_behaviors?: string[];
  yellow_zone_behaviors?: string[];
  green_zone_behaviors?: string[];
  successful_strategies?: string[];
  spiritual_framework?: string;
  prayer_comfort_level?: string;
  recent_themes?: string[];
  context_summary?: string;
}

// ============================================================================
// Database Queries
// ============================================================================

/**
 * Get user context by user ID
 */
export async function getUserContext(userId: string): Promise<UserContext | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_context')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found - new user, no context yet
      return null;
    }
    console.error('Error fetching user context:', error);
    throw new Error(`Failed to fetch user context: ${error.message}`);
  }

  return data as UserContext;
}

/**
 * Upsert (insert or update) user context
 */
export async function upsertUserContext(
  userId: string,
  updates: UserContextUpdate
): Promise<UserContext> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_context')
    .upsert(
      {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting user context:', error);
    throw new Error(`Failed to upsert user context: ${error.message}`);
  }

  return data as UserContext;
}

/**
 * Get recent session summaries for a user
 */
export async function getRecentSessionSummaries(
  userId: string,
  limit: number = 3
): Promise<SessionSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('session_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching session summaries:', error);
    throw new Error(`Failed to fetch session summaries: ${error.message}`);
  }

  return (data || []) as SessionSummary[];
}

/**
 * Insert a new session summary
 */
export async function insertSessionSummary(
  userId: string,
  sessionId: string,
  summary: Omit<SessionSummary, 'id' | 'user_id' | 'session_id' | 'created_at'>
): Promise<SessionSummary> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('session_summaries')
    .insert({
      user_id: userId,
      session_id: sessionId,
      ...summary,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting session summary:', error);
    throw new Error(`Failed to insert session summary: ${error.message}`);
  }

  return data as SessionSummary;
}

/**
 * Delete user context (for "fresh start" feature)
 */
export async function deleteUserContext(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_context')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting user context:', error);
    throw new Error(`Failed to delete user context: ${error.message}`);
  }
}

/**
 * Get unresolved follow-up items (sessions with follow_up_needed)
 */
export async function getUnresolvedFollowUps(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('session_summaries')
    .select('follow_up_needed')
    .eq('user_id', userId)
    .not('follow_up_needed', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching follow-ups:', error);
    return [];
  }

  return (data || [])
    .map((d: any) => d.follow_up_needed)
    .filter(Boolean);
}

/**
 * Update context summary (AI-generated summary for prompt injection)
 */
export async function updateContextSummary(
  userId: string,
  summary: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_context')
    .update({
      context_summary: summary,
      last_summary_update: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating context summary:', error);
    throw new Error(`Failed to update context summary: ${error.message}`);
  }
}
