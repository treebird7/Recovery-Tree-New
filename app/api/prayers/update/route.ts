import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateUserPrayer, deleteUserPrayer } from '@/lib/services/prayer';

// Update prayer (mark as primary or edit text)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prayerId, prayerText, isPrimary } = body;

    if (!prayerId) {
      return NextResponse.json({ error: 'Prayer ID required' }, { status: 400 });
    }

    const updates: { prayerText?: string; isPrimary?: boolean } = {};
    if (prayerText !== undefined) updates.prayerText = prayerText;
    if (isPrimary !== undefined) updates.isPrimary = isPrimary;

    const { error } = await updateUserPrayer(prayerId, user.id, updates);

    if (error) {
      console.error('Error updating prayer:', error);
      return NextResponse.json({ error: 'Failed to update prayer' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete prayer
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prayerId = searchParams.get('id');

    if (!prayerId) {
      return NextResponse.json({ error: 'Prayer ID required' }, { status: 400 });
    }

    const { error } = await deleteUserPrayer(prayerId, user.id);

    if (error) {
      console.error('Error deleting prayer:', error);
      return NextResponse.json({ error: 'Failed to delete prayer' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
