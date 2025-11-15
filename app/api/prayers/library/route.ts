import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPrayerLibrary } from '@/lib/services/prayer';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch prayer library
    const { data: prayers, error } = await getPrayerLibrary();

    if (error) {
      console.error('Error fetching prayer library:', error);
      return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
    }

    return NextResponse.json({ prayers });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
