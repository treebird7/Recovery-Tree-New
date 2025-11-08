import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSessionHistory, getUserSessionCount } from '@/lib/queries/sessions';

/**
 * GET /api/sessions/history
 *
 * Fetches user's session history with filtering, pagination, and sorting.
 * Returns list of completed sessions with preview and stats.
 *
 * @param request.query.type - Optional filter: 'walk' or 'mining'
 * @param request.query.limit - Results per page (1-100, default 50)
 * @param request.query.offset - Pagination offset (default 0)
 * @param request.query.startDate - Filter sessions after this date (ISO 8601)
 * @param request.query.endDate - Filter sessions before this date (ISO 8601)
 *
 * @returns sessions - Array of session summaries with preview
 * @returns pagination - Total count, limit, offset
 * @returns 401 if not authenticated
 * @returns 400 if invalid parameters (type, limit, dates)
 * @returns 500 if database query fails
 *
 * Features:
 * - Sorted by completion date (most recent first)
 * - Preview truncated to 100 characters
 * - Duration calculated from timestamps
 * - RLS enforced (users only see own sessions)
 * - Parallel queries for performance
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Validate and parse type parameter
    let type: 'walk' | 'mining' | undefined;
    if (typeParam) {
      if (!['walk', 'mining'].includes(typeParam)) {
        return NextResponse.json(
          { error: 'Invalid type parameter. Must be "walk" or "mining"' },
          { status: 400 }
        );
      }
      type = typeParam as 'walk' | 'mining';
    }

    // Validate and parse limit parameter
    let limit = 50; // Default
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return NextResponse.json(
          { error: 'Invalid limit parameter. Must be between 1 and 100' },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Validate and parse offset parameter
    let offset = 0; // Default
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam, 10);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          { error: 'Invalid offset parameter. Must be >= 0' },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Validate and parse date parameters
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid startDate parameter. Must be valid ISO 8601 date' },
          { status: 400 }
        );
      }
    }

    if (endDateParam) {
      endDate = new Date(endDateParam);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid endDate parameter. Must be valid ISO 8601 date' },
          { status: 400 }
        );
      }
    }

    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { error: 'startDate must be before or equal to endDate' },
        { status: 400 }
      );
    }

    // Fetch session history and total count in parallel
    const [sessions, totalCount] = await Promise.all([
      getUserSessionHistory(user.id, { type, limit, offset, startDate, endDate }),
      getUserSessionCount(user.id, { type, startDate, endDate }),
    ]);

    // Format response according to API schema
    const formattedSessions = sessions.map((session) => {
      // Calculate duration in minutes
      let durationMinutes = 0;
      if (session.completed_at && session.started_at) {
        const start = new Date(session.started_at);
        const end = new Date(session.completed_at);
        durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      }

      // For mining sessions, use the stored duration if available
      if (session.session_type === 'mining' && session.mining_duration_minutes) {
        durationMinutes = session.mining_duration_minutes;
      }

      // Create preview from final_reflection (first 100 characters)
      let preview = '';
      if (session.final_reflection) {
        preview = session.final_reflection.length > 100
          ? session.final_reflection.substring(0, 100) + '...'
          : session.final_reflection;
      }

      return {
        id: session.id,
        session_type: session.session_type,
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration_minutes: durationMinutes,
        coins_earned: session.coins_earned || 0,
        preview,
      };
    });

    return NextResponse.json({
      sessions: formattedSessions,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error in /api/sessions/history:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
