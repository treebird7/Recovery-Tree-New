/**
 * Context Builder Service
 *
 * Builds Elder Tree context prompt from user profile and recent session summaries.
 * Target: ~600 tokens max, hard cap at 800 tokens.
 */

import type { UserContext, SessionSummary } from './user-context';

interface ContextPromptOptions {
  maxTokens?: number;
  includeRecentSessions?: boolean;
  sessionLimit?: number;
}

/**
 * Build context prompt for Elder Tree injection
 *
 * @param profile - User's persistent context profile
 * @param recentSessions - Recent session summaries (default: last 3)
 * @param options - Configuration options
 * @returns Formatted context string for prompt injection
 */
export function buildContextPrompt(
  profile: UserContext | null,
  recentSessions: SessionSummary[] = [],
  options: ContextPromptOptions = {}
): string {
  const {
    maxTokens = 600,
    includeRecentSessions = true,
    sessionLimit = 3,
  } = options;

  // If no profile, return empty string (new user)
  if (!profile) {
    return '';
  }

  const parts: string[] = [];

  // Part 1: Core identity (always include if available)
  const identityParts: string[] = [];

  if (profile.preferred_name || profile.addiction_type) {
    const name = profile.preferred_name || 'User';
    const addiction = profile.addiction_type || 'addiction';
    identityParts.push(`${name} is in recovery from ${addiction}`);
  }

  if (profile.current_step) {
    identityParts.push(`Currently working Step ${profile.current_step}`);
  }

  if (profile.recovery_start_date) {
    const days = getDaysSince(profile.recovery_start_date);
    if (days >= 0) {
      identityParts.push(`${days} days in recovery`);
    }
  }

  if (identityParts.length > 0) {
    parts.push(`USER CONTEXT:\n- ${identityParts.join('\n- ')}`);
  }

  // Part 2: Support system (if exists)
  const supportParts: string[] = [];

  if (profile.has_sponsor && profile.sponsor_name) {
    supportParts.push(`Sponsor: ${profile.sponsor_name}`);
  } else if (profile.has_sponsor) {
    supportParts.push('Has a sponsor');
  }

  if (profile.in_fellowship && profile.fellowship_name) {
    supportParts.push(`Fellowship: ${profile.fellowship_name}`);
  } else if (profile.in_fellowship) {
    supportParts.push('Attending fellowship meetings');
  }

  if (profile.has_therapist) {
    supportParts.push('Working with therapist');
  }

  if (supportParts.length > 0) {
    parts.push(`Support: ${supportParts.join(', ')}`);
  }

  // Part 3: Triggers and zones (top 3 each for brevity)
  if (profile.known_triggers && Array.isArray(profile.known_triggers) && profile.known_triggers.length > 0) {
    const topTriggers = profile.known_triggers.slice(0, 3);
    parts.push(`Key triggers: ${topTriggers.join(', ')}`);
  }

  if (profile.red_zone_behaviors && Array.isArray(profile.red_zone_behaviors) && profile.red_zone_behaviors.length > 0) {
    const redZones = profile.red_zone_behaviors.slice(0, 3);
    parts.push(`Red zone: ${redZones.join(', ')}`);
  }

  if (profile.green_zone_behaviors && Array.isArray(profile.green_zone_behaviors) && profile.green_zone_behaviors.length > 0) {
    const greenZones = profile.green_zone_behaviors.slice(0, 3);
    parts.push(`Green zone: ${greenZones.join(', ')}`);
  }

  // Part 4: Recent momentum (if sessions exist and enabled)
  if (includeRecentSessions && recentSessions.length > 0) {
    const sessionSummaries = recentSessions
      .slice(0, sessionLimit)
      .map((session) => {
        const date = formatDateShort(session.completed_at);
        const outcome = session.outcome || 'completed';
        const intensity = session.urge_intensity ? ` (intensity ${session.urge_intensity}/10)` : '';
        return `${date}: ${outcome}${intensity}`;
      });

    if (sessionSummaries.length > 0) {
      parts.push(`\nRECENT MOMENTUM:\n- ${sessionSummaries.join('\n- ')}`);
    }
  }

  // Part 5: Conversation cues (follow-up needed from last session)
  const lastSession = recentSessions[0];
  if (lastSession?.follow_up_needed) {
    parts.push(`\nFOLLOW-UP: ${lastSession.follow_up_needed}`);
  }

  // Join all parts
  const fullContext = parts.join('\n');

  // Token budget check (estimate: ~4 chars per token)
  const estimatedTokens = estimateTokenCount(fullContext);

  if (estimatedTokens > maxTokens) {
    // Fallback: compress to essentials only
    return buildCompressedContext(profile, recentSessions);
  }

  return fullContext;
}

/**
 * Build compressed context when full context exceeds token budget
 */
function buildCompressedContext(
  profile: UserContext,
  recentSessions: SessionSummary[]
): string {
  const parts: string[] = [];

  // Essential identity only
  const name = profile.preferred_name || 'User';
  const step = profile.current_step || 'recovery';
  parts.push(`USER CONTEXT: ${name}, Step ${step}`);

  // Top trigger only
  if (profile.known_triggers && Array.isArray(profile.known_triggers) && profile.known_triggers.length > 0) {
    parts.push(`Key trigger: ${profile.known_triggers[0]}`);
  }

  // Last session only
  if (recentSessions.length > 0) {
    const last = recentSessions[0];
    const date = formatDateShort(last.completed_at);
    const outcome = last.outcome || 'completed';
    parts.push(`Last session (${date}): ${outcome}`);
  }

  return parts.join('\n');
}

/**
 * Estimate token count (rough approximation: ~4 chars per token)
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate days since a given date
 */
function getDaysSince(dateString: string | Date): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format date in short format (e.g., "Nov 14")
 */
function formatDateShort(dateString: string | Date): string {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

/**
 * Generate cache key for context (for caching context lookups)
 */
export function getContextCacheKey(userId: string): string {
  return `context:${userId}`;
}
