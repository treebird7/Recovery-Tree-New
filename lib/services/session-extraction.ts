/**
 * Session Extraction Service
 *
 * Uses LLM to extract structured data from completed Elder Tree sessions.
 * Updates user_context and creates session_summaries automatically.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ConversationTurn } from './conversation-manager';
import type { UserContextUpdate } from './user-context';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// Type Definitions
// ============================================================================

export interface SessionExtractionResult {
  profile_updates?: UserContextUpdate;
  session_summary: SessionSummaryData;
}

export interface SessionSummaryData {
  urge_intensity?: number;
  primary_trigger?: string;
  resistance_strategy_used?: string;
  outcome?: 'urge_passed' | 'relapsed' | 'ongoing_struggle' | 'reflection_only';
  key_insights?: string[];
  emotional_state_start?: string;
  emotional_state_end?: string;
  follow_up_needed?: string;
}

// ============================================================================
// Extraction Prompt Template
// ============================================================================

const EXTRACTION_SYSTEM_PROMPT = `You are analyzing a completed Elder Tree recovery session to extract structured data.

CRITICAL INSTRUCTIONS:
1. Only extract information EXPLICITLY stated by the user
2. Do NOT infer or assume - if not mentioned, omit the field
3. For profile_updates, ONLY include NEW or CHANGED information
4. Be conservative - when in doubt, omit rather than guess
5. Return valid JSON only, no preamble or explanation

PROFILE UPDATE RULES:
- has_sponsor: true ONLY if user says "I have a sponsor" or "my sponsor is..."
- sponsor_name: ONLY if explicitly named
- current_step: ONLY if user mentions completing or starting a specific step
- DO NOT update profile based on thinking/planning ("I should get a sponsor" ≠ has_sponsor: true)

SESSION OUTCOME CATEGORIES:
- urge_passed: User resisted urge successfully
- relapsed: User acted out/used
- ongoing_struggle: Urge still present at end of session
- reflection_only: Walk session, no active urge (step work reflection)

PRIVACY SAFEGUARDS:
- DO NOT store graphic details of acting-out behaviors
- Anonymize unnecessary names (keep sponsor/therapist, remove others)
- Focus on recovery-relevant context only`;

function buildExtractionPrompt(
  conversationHistory: ConversationTurn[],
  sessionType: 'walk' | 'mining',
  currentStep: string
): string {
  const transcript = conversationHistory
    .map((turn) => `Elder Tree: ${turn.question}\nUser: ${turn.answer}`)
    .join('\n\n');

  return `Analyze this ${sessionType} session (Step ${currentStep}) and extract data.

SESSION TRANSCRIPT:
${transcript}

Return ONLY valid JSON in this exact format:
{
  "profile_updates": {
    // ONLY include fields that changed or are newly discovered
    // Examples: "current_step": 3, "has_sponsor": true, "sponsor_name": "Mike"
    // Leave empty {} if nothing changed
  },
  "session_summary": {
    "urge_intensity": 0-10 (null if walk session with no urge),
    "primary_trigger": "brief description" (null if none mentioned),
    "resistance_strategy_used": "what they did to resist" (null if N/A),
    "outcome": "urge_passed|relapsed|ongoing_struggle|reflection_only",
    "key_insights": ["insight 1", "insight 2", "insight 3"],
    "emotional_state_start": "how they felt at start",
    "emotional_state_end": "how they felt at end",
    "follow_up_needed": "topic to explore next session" (null if none)
  }
}

IMPORTANT:
- key_insights should be 2-3 specific realizations the user had
- Write insights in second person ("You recognized...", "You see the pattern of...")
- If this is a walk session with no urge, use outcome: "reflection_only" and urge_intensity: null
- Only include profile_updates if something ACTUALLY changed`;
}

// ============================================================================
// Extraction Function
// ============================================================================

/**
 * Extract structured data from a completed session
 *
 * @param conversationHistory - Full session transcript
 * @param sessionType - 'walk' or 'mining'
 * @param currentStep - Step being worked
 * @param retryCount - Internal retry counter
 * @returns Extracted session data or null if extraction fails
 */
export async function extractSessionData(
  conversationHistory: ConversationTurn[],
  sessionType: 'walk' | 'mining',
  currentStep: string,
  retryCount: number = 0
): Promise<SessionExtractionResult | null> {
  try {
    const prompt = buildExtractionPrompt(conversationHistory, sessionType, currentStep);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more consistent extraction
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    const extracted = JSON.parse(content) as SessionExtractionResult;

    // Validate structure
    if (!extracted.session_summary) {
      throw new Error('Missing session_summary in extraction response');
    }

    // Clean up profile_updates if empty
    if (extracted.profile_updates && Object.keys(extracted.profile_updates).length === 0) {
      delete extracted.profile_updates;
    }

    console.log('[Extraction] Success:', {
      hasProfileUpdates: !!extracted.profile_updates,
      outcome: extracted.session_summary.outcome,
      insightCount: extracted.session_summary.key_insights?.length || 0,
    });

    return extracted;
  } catch (error) {
    console.error('[Extraction] Error:', error);

    // Retry once on JSON parse failure
    if (error instanceof SyntaxError && retryCount === 0) {
      console.log('[Extraction] JSON parse failed, retrying...');
      return extractSessionData(conversationHistory, sessionType, currentStep, 1);
    }

    // Return null on failure (session still completes, extraction just skipped)
    return null;
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate extraction result has required fields
 */
export function validateExtraction(result: SessionExtractionResult | null): boolean {
  if (!result) return false;
  if (!result.session_summary) return false;
  if (!result.session_summary.outcome) return false;
  return true;
}

/**
 * Sanitize extraction result (remove sensitive data)
 */
export function sanitizeExtraction(result: SessionExtractionResult): SessionExtractionResult {
  const sanitized = { ...result };

  // Remove graphic details from insights
  if (sanitized.session_summary.key_insights) {
    sanitized.session_summary.key_insights = sanitized.session_summary.key_insights.map(
      (insight) => {
        // Basic sanitization - could be enhanced with more rules
        return insight.slice(0, 200); // Truncate very long insights
      }
    );
  }

  // Truncate very long trigger descriptions
  if (sanitized.session_summary.primary_trigger) {
    sanitized.session_summary.primary_trigger = sanitized.session_summary.primary_trigger.slice(
      0,
      100
    );
  }

  return sanitized;
}

/**
 * Determine if profile updates are significant (warrant Elder Tree acknowledgment)
 */
export function isSignificantChange(updates: UserContextUpdate): boolean {
  const significantFields = [
    'has_sponsor',
    'sponsor_name',
    'in_fellowship',
    'fellowship_name',
    'recovery_start_date',
  ];

  return significantFields.some((field) => field in updates);
}
