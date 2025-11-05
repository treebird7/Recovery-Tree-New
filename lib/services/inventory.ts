import { createClient } from '../supabase/server';

export interface DailyInventory {
  id: string;
  user_id: string;
  date: string;
  what_went_well: string | null;
  struggles_today: string | null;
  gratitude: string | null;
  tomorrow_intention: string | null;
  additional_notes: string | null;
  elder_reflection: string | null;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryResponses {
  whatWentWell: string;
  strugglesToday: string;
  gratitude: string;
  tomorrowIntention: string;
  additionalNotes?: string;
}

/**
 * Get today's inventory for a user (if exists)
 */
export async function getTodaysInventory(
  userId: string
): Promise<{ data: DailyInventory | null; error: any }> {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('daily_inventories')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  // No inventory today is not an error
  if (error && error.code === 'PGRST116') {
    return { data: null, error: null };
  }

  return { data, error };
}

/**
 * Create a new daily inventory
 */
export async function createInventory(
  userId: string,
  responses: InventoryResponses,
  elderReflection: string
): Promise<{ data: DailyInventory | null; error: any }> {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_inventories')
    .insert({
      user_id: userId,
      date: today,
      what_went_well: responses.whatWentWell,
      struggles_today: responses.strugglesToday,
      gratitude: responses.gratitude,
      tomorrow_intention: responses.tomorrowIntention,
      additional_notes: responses.additionalNotes || null,
      elder_reflection: elderReflection,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update an existing inventory (allows editing before end of day)
 */
export async function updateInventory(
  inventoryId: string,
  responses: Partial<InventoryResponses>,
  elderReflection?: string
): Promise<{ error: any }> {
  const supabase = await createClient();

  const updateData: any = {};

  if (responses.whatWentWell !== undefined) {
    updateData.what_went_well = responses.whatWentWell;
  }
  if (responses.strugglesToday !== undefined) {
    updateData.struggles_today = responses.strugglesToday;
  }
  if (responses.gratitude !== undefined) {
    updateData.gratitude = responses.gratitude;
  }
  if (responses.tomorrowIntention !== undefined) {
    updateData.tomorrow_intention = responses.tomorrowIntention;
  }
  if (responses.additionalNotes !== undefined) {
    updateData.additional_notes = responses.additionalNotes;
  }
  if (elderReflection !== undefined) {
    updateData.elder_reflection = elderReflection;
  }

  const { error } = await supabase
    .from('daily_inventories')
    .update(updateData)
    .eq('id', inventoryId);

  return { error };
}

/**
 * Get inventory history for a user
 */
export async function getInventoryHistory(
  userId: string,
  limit: number = 30
): Promise<{ data: DailyInventory[] | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('daily_inventories')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Get inventory for a specific date
 */
export async function getInventoryByDate(
  userId: string,
  date: string
): Promise<{ data: DailyInventory | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('daily_inventories')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error && error.code === 'PGRST116') {
    return { data: null, error: null };
  }

  return { data, error };
}

/**
 * Get current inventory streak (consecutive days)
 */
export async function getInventoryStreak(
  userId: string
): Promise<{ streak: number; error: any }> {
  const supabase = await createClient();

  // Get last 90 days of inventories
  const { data: inventories, error } = await supabase
    .from('daily_inventories')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(90);

  if (error) {
    return { streak: 0, error };
  }

  if (!inventories || inventories.length === 0) {
    return { streak: 0, error: null };
  }

  // Check if today or yesterday has an inventory (streak is active)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hasToday = inventories.some(inv => inv.date === todayStr);
  const hasYesterday = inventories.some(inv => inv.date === yesterdayStr);

  // Streak must be current (today or yesterday)
  if (!hasToday && !hasYesterday) {
    return { streak: 0, error: null };
  }

  // Count consecutive days from most recent
  let streak = 0;
  const sortedDates = inventories.map(inv => inv.date).sort().reverse();

  let currentDate = hasToday ? today : yesterday;

  for (const dateStr of sortedDates) {
    const invDate = new Date(dateStr + 'T00:00:00');
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - streak);
    expectedDate.setHours(0, 0, 0, 0);

    if (invDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return { streak, error: null };
}

/**
 * Get total count of inventories for a user
 */
export async function getTotalInventories(
  userId: string
): Promise<{ count: number; error: any }> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('daily_inventories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return { count: count || 0, error };
}
