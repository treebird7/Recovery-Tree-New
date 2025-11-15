import { createClient } from '../supabase/server';

export interface PrayerLibrary {
  id: string;
  prayer_text: string;
  source: 'generated' | 'traditional' | 'community';
  category: string;
  author: string | null;
  created_at: string;
  is_active: boolean;
}

export interface UserPrayer {
  id: string;
  user_id: string;
  prayer_text: string;
  source: 'library_selected' | 'custom' | 'elder_tree_collaborative';
  library_prayer_id: string | null;
  is_primary: boolean;
  created_at: string;
  selected_at: string;
  updated_at: string;
}

/**
 * Get all active prayers from the library
 */
export async function getPrayerLibrary(): Promise<{
  data: PrayerLibrary[] | null;
  error: any;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('prayer_library')
    .select('*')
    .eq('is_active', true)
    .eq('category', 'step_3')
    .order('created_at', { ascending: true });

  return { data, error };
}

/**
 * Get all prayers for a user
 */
export async function getUserPrayers(userId: string): Promise<{
  data: UserPrayer[] | null;
  error: any;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_prayers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get user's primary prayer
 */
export async function getUserPrimaryPrayer(userId: string): Promise<{
  data: UserPrayer | null;
  error: any;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_prayers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single();

  return { data, error };
}

/**
 * Save a library prayer selection
 */
export async function saveLibraryPrayer(
  userId: string,
  libraryPrayerId: string,
  prayerText: string,
  isPrimary: boolean = false
): Promise<{ data: UserPrayer | null; error: any }> {
  const supabase = await createClient();

  // If setting as primary, unset other primary prayers
  if (isPrimary) {
    await supabase
      .from('user_prayers')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true);
  }

  const { data, error } = await supabase
    .from('user_prayers')
    .insert({
      user_id: userId,
      prayer_text: prayerText,
      source: 'library_selected',
      library_prayer_id: libraryPrayerId,
      is_primary: isPrimary,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Save a custom prayer
 */
export async function saveCustomPrayer(
  userId: string,
  prayerText: string,
  source: 'custom' | 'elder_tree_collaborative' = 'custom',
  isPrimary: boolean = false
): Promise<{ data: UserPrayer | null; error: any }> {
  const supabase = await createClient();

  // If setting as primary, unset other primary prayers
  if (isPrimary) {
    await supabase
      .from('user_prayers')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true);
  }

  const { data, error } = await supabase
    .from('user_prayers')
    .insert({
      user_id: userId,
      prayer_text: prayerText,
      source,
      library_prayer_id: null,
      is_primary: isPrimary,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a user prayer (mark as primary, edit text, etc.)
 */
export async function updateUserPrayer(
  prayerId: string,
  userId: string,
  updates: {
    prayerText?: string;
    isPrimary?: boolean;
  }
): Promise<{ error: any }> {
  const supabase = await createClient();

  // If setting as primary, unset other primary prayers first
  if (updates.isPrimary) {
    await supabase
      .from('user_prayers')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true)
      .neq('id', prayerId);
  }

  const updateData: any = {};
  if (updates.prayerText !== undefined) updateData.prayer_text = updates.prayerText;
  if (updates.isPrimary !== undefined) updateData.is_primary = updates.isPrimary;

  const { error } = await supabase
    .from('user_prayers')
    .update(updateData)
    .eq('id', prayerId)
    .eq('user_id', userId);

  return { error };
}

/**
 * Delete a user prayer
 */
export async function deleteUserPrayer(
  prayerId: string,
  userId: string
): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_prayers')
    .delete()
    .eq('id', prayerId)
    .eq('user_id', userId);

  return { error };
}

/**
 * Mark Step 3 as complete for user
 */
export async function markStep3Complete(userId: string): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('users')
    .update({
      step_3_completed: true,
      current_step: 3, // Keep on step 3 until steps 4-12 are implemented
    })
    .eq('id', userId);

  return { error };
}

/**
 * Get user's step progress
 */
export async function getUserStepProgress(userId: string): Promise<{
  data: {
    current_step: number;
    step_1_completed: boolean;
    step_2_completed: boolean;
    step_3_completed: boolean;
  } | null;
  error: any;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('current_step, step_1_completed, step_2_completed, step_3_completed')
    .eq('id', userId)
    .single();

  return { data, error };
}
