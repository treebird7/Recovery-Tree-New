import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  saveLibraryPrayer,
  saveCustomPrayer,
  markStep3Complete,
  getUserPrayers,
} from '@/lib/services/prayer';

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
    const { prayers, markComplete } = body;

    if (!prayers || !Array.isArray(prayers)) {
      return NextResponse.json({ error: 'Invalid request: prayers array required' }, { status: 400 });
    }

    // Save all prayers
    const savedPrayers = [];
    for (const prayer of prayers) {
      const { type, prayerText, libraryPrayerId, isPrimary, source } = prayer;

      if (type === 'library' && libraryPrayerId) {
        // Save library prayer
        const { data, error } = await saveLibraryPrayer(
          user.id,
          libraryPrayerId,
          prayerText,
          isPrimary || false
        );

        if (error) {
          console.error('Error saving library prayer:', error);
          continue;
        }

        if (data) savedPrayers.push(data);
      } else if (type === 'custom' && prayerText) {
        // Save custom prayer
        const { data, error } = await saveCustomPrayer(
          user.id,
          prayerText,
          source || 'custom',
          isPrimary || false
        );

        if (error) {
          console.error('Error saving custom prayer:', error);
          continue;
        }

        if (data) savedPrayers.push(data);
      }
    }

    // Mark Step 3 complete if requested
    if (markComplete && savedPrayers.length > 0) {
      const { error: completeError } = await markStep3Complete(user.id);

      if (completeError) {
        console.error('Error marking Step 3 complete:', completeError);
        return NextResponse.json(
          { error: 'Prayers saved but failed to mark step complete', savedPrayers },
          { status: 207 }
        );
      }
    }

    // Fetch all user prayers to return updated list
    const { data: allPrayers } = await getUserPrayers(user.id);

    return NextResponse.json({
      success: true,
      savedPrayers,
      allPrayers,
      step3Complete: markComplete && savedPrayers.length > 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
