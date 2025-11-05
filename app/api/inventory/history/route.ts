import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInventoryHistory } from '@/lib/services/inventory';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get limit from query params (default 30)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const { data: inventories, error } = await getInventoryHistory(user.id, limit);

    if (error) {
      console.error('Error getting inventory history:', error);
      return NextResponse.json(
        { error: 'Failed to get history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      inventories: inventories || [],
    });
  } catch (error) {
    console.error('Error in /api/inventory/history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
