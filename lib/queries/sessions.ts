/**
 * Session History Queries
 *
 * Optimized database queries for fetching user session history
 * with filtering, pagination, and sorting.
 */

import { createClient } from '@/lib/supabase/server';

export interface SessionHistoryOptions {
  type?: 'walk' | 'mining';
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface SessionHistoryItem {
  id: string;
  user_id: string;
  session_type: 'walk' | 'mining';
  started_at: string;
  completed_at: string | null;
  coins_earned: number;
  final_reflection: string | null;
  mining_duration_minutes: number | null;
  created_at: string;
}

/**
 * Get user's session history with filtering and pagination
 *
 * @param userId - The user's UUID
 * @param options - Filtering and pagination options
 * @returns Array of session history items
 *
 * @example
 * ```typescript
 * const sessions = await getUserSessionHistory(userId, {
 *   type: 'walk',
 *   limit: 20,
 *   offset: 0
 * });
 * ```
 */
export async function getUserSessionHistory(
  userId: string,
  options: SessionHistoryOptions = {}
): Promise<SessionHistoryItem[]> {
  const {
    type,
    limit = 50,
    offset = 0,
    startDate,
    endDate
  } = options;

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('sessions')
    .select('id, user_id, session_type, started_at, completed_at, coins_earned, final_reflection, mining_duration_minutes, created_at')
    .eq('user_id', userId)
    .not('completed_at', 'is', null) // Only completed sessions
    .order('completed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply optional filters
  if (type) {
    query = query.eq('session_type', type);
  }

  if (startDate) {
    query = query.gte('completed_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('completed_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching session history:', error);
    throw new Error(`Failed to fetch session history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get total count of user's completed sessions
 *
 * @param userId - The user's UUID
 * @param options - Filtering options (type, date range)
 * @returns Total count of matching sessions
 */
export async function getUserSessionCount(
  userId: string,
  options: Omit<SessionHistoryOptions, 'limit' | 'offset'> = {}
): Promise<number> {
  const { type, startDate, endDate } = options;

  const supabase = await createClient();

  // Build count query
  let query = supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('completed_at', 'is', null);

  // Apply optional filters
  if (type) {
    query = query.eq('session_type', type);
  }

  if (startDate) {
    query = query.gte('completed_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('completed_at', endDate.toISOString());
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting sessions:', error);
    throw new Error(`Failed to count sessions: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get a single session by ID
 *
 * @param sessionId - The session UUID
 * @param userId - The user's UUID (for RLS verification)
 * @returns Session data or null if not found
 */
export async function getSessionById(
  sessionId: string,
  userId: string
): Promise<SessionHistoryItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching session:', error);
    throw new Error(`Failed to fetch session: ${error.message}`);
  }

  return data;
}
