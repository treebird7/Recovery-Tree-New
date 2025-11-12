import { createClient } from '../supabase/server';

export interface MiningSession {
  id: string;
  user_id: string;
  session_type: 'mining';
  mining_started_at: string;
  mining_ended_at: string | null;
  mining_duration_minutes: number | null;
  coins_earned: number;
  user_state_after_mining: 'stable' | 'crisis' | null;
  created_at: string;
}

export interface MiningStats {
  sessionId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  coinsEarned: number;
}

/**
 * Check if current time is during vulnerable hours (10 PM - 6 AM)
 */
export function isVulnerableHour(): boolean {
  const now = new Date();
  const hour = now.getHours();

  // Vulnerable hours: 22:00 (10 PM) to 06:00 (6 AM)
  return hour >= 22 || hour < 6;
}

/**
 * Start a new mining session
 * @param userId - User ID
 * @param durationMinutes - Optional timer duration in minutes (null = indefinite)
 */
export async function startMiningSession(
  userId: string,
  durationMinutes?: number | null
): Promise<{ data: MiningSession | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      session_type: 'mining',
      mining_started_at: new Date().toISOString(),
      mining_duration_minutes: durationMinutes || null,
      current_step: 'step1', // Required field, but not used for mining
    })
    .select()
    .single();

  return { data, error };
}

/**
 * End mining session and calculate coins
 */
export async function endMiningSession(
  sessionId: string,
  userState: 'stable' | 'crisis' = 'stable'
): Promise<{ stats: MiningStats | null; error: any }> {
  const supabase = await createClient();

  // Get the session to calculate duration
  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('session_type', 'mining')
    .single();

  if (fetchError || !session) {
    return { stats: null, error: fetchError || new Error('Session not found') };
  }

  // Calculate duration in minutes
  const startTime = new Date(session.mining_started_at);
  const endTime = new Date();
  const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

  // Award coins (1 per minute, minimum 1)
  const coinsEarned = Math.max(1, durationMinutes);

  // Update session with end data
  const { error: updateError } = await supabase
    .from('sessions')
    .update({
      mining_ended_at: endTime.toISOString(),
      mining_duration_minutes: durationMinutes,
      coins_earned: coinsEarned,
      user_state_after_mining: userState,
      completed_at: endTime.toISOString(),
    })
    .eq('id', sessionId);

  if (updateError) {
    return { stats: null, error: updateError };
  }

  // Award coins to user total
  const { error: coinsError } = await awardCoins(session.user_id, coinsEarned);

  if (coinsError) {
    console.error('Error awarding coins:', coinsError);
    // Don't fail the whole operation if coin update fails
  }

  const stats: MiningStats = {
    sessionId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    durationMinutes,
    coinsEarned,
  };

  return { stats, error: null };
}

/**
 * Get active mining session for user (if any)
 */
export async function getActiveMiningSession(
  userId: string
): Promise<{ data: MiningSession | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('session_type', 'mining')
    .is('mining_ended_at', null)
    .order('mining_started_at', { ascending: false })
    .limit(1)
    .single();

  // If no active session, that's not an error
  if (error && error.code === 'PGRST116') {
    return { data: null, error: null };
  }

  return { data, error };
}

/**
 * Award coins to user's total balance
 */
export async function awardCoins(userId: string, amount: number): Promise<{ error: any }> {
  const supabase = await createClient();

  // Try to update existing record
  const { data: existing } = await supabase
    .from('user_coins')
    .select('total_coins')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('user_coins')
      .update({
        total_coins: existing.total_coins + amount,
        last_earned_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return { error };
  } else {
    // Create new record
    const { error } = await supabase
      .from('user_coins')
      .insert({
        user_id: userId,
        total_coins: amount,
        last_earned_at: new Date().toISOString(),
      });

    return { error };
  }
}

/**
 * Get user's total coin balance
 */
export async function getUserCoins(
  userId: string
): Promise<{ coins: number; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_coins')
    .select('total_coins')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // No record yet, return 0
    return { coins: 0, error: null };
  }

  return { coins: data?.total_coins || 0, error };
}

/**
 * Get user's mining history (last N sessions)
 */
export async function getMiningHistory(
  userId: string,
  limit: number = 7
): Promise<{ data: MiningSession[] | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('session_type', 'mining')
    .not('mining_ended_at', 'is', null)
    .order('mining_started_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Assess if user needs mining based on recent pattern
 */
export async function assessMiningPattern(
  userId: string
): Promise<{ needsSupport: boolean; consecutiveNights: number; error: any }> {
  const { data: history, error } = await getMiningHistory(userId, 7);

  if (error || !history) {
    return { needsSupport: false, consecutiveNights: 0, error };
  }

  // Check how many of last 7 nights user needed mining
  const recentNights = history.length;

  // Check for consecutive nights
  let consecutiveNights = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const session of history) {
    const sessionDate = new Date(session.mining_started_at);
    sessionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === consecutiveNights) {
      consecutiveNights++;
    } else {
      break;
    }
  }

  // If user needed mining 4+ times in last 7 days, flag for support
  const needsSupport = recentNights >= 4;

  return { needsSupport, consecutiveNights, error: null };
}
