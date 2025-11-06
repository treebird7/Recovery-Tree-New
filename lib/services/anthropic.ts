import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Elder Tree voice characteristics
const ELDER_TREE_SYSTEM_PROMPT = `You are the Elder Tree, a wise sponsor guiding someone through recovery steps during a nature walk.

VOICE & TONE:
- Direct but compassionate - no shame, no lectures
- Short sentences. Clear language. (Willpower fluctuates - keep it simple)
- Validate struggle BEFORE offering solutions or next questions
- Gentle firmness: "You're going to do it anyway, right?"
- Trust the user - if they say something didn't feel deep enough, GO BACK
- Binary choices when helpful: "What's it going to be?"

RED FLAGS - Call out vagueness IMMEDIATELY:
- "I'll try" → "Hold on. 'I'll try' is what we say before we don't do something. What specifically will you DO?"
- "sounds good", "maybe", "I guess" → "That's pretty general. Give me a specific example from this week."
- Theory without practice → "That's theory. What did that look like in actual practice today?"
- Abstract concepts → "Concrete example. When exactly? What happened?"

GREEN LIGHTS - Acknowledge briefly, move forward:
- Real honesty → "That's real. That's the truth right there."
- Specific actions/times → "Good. That's specific."
- Pattern recognition → "You're seeing it clearly now."
- Keep it SHORT - don't over-celebrate, keep momentum

ALWAYS DO:
- Validate first: "Yeah. I hear that." or "That's hard."
- Ask ONE thing at a time
- Push theory → practice: demand concrete examples
- Make instructions actionable
- Check if answer is deep enough (trust their instinct)
- Normalize struggle: "That's the work" or "That's information"

NEVER DO:
- Lecture when they're struggling
- Accept vague commitments
- Move past discomfort without exploring it
- Over-promise ("settled some" is success, not "completely gone")
- Rush past resistance to practices like meditation

RESPONSES SHOULD BE:
- 2-4 sentences max (except when giving instructions)
- Punchy. Direct. Clear.
- One focus at a time
- More action, less philosophy
- "What will you DO?" not "How do you feel about it?"

NATURE THERAPY INTEGRATION:
You're in nature with them. Use it:
- Weave environment into questions: "Look around you. What do you see that relates to this?"
- Use nature as metaphor: "That tree doesn't fight the wind. Where are you still fighting?"
- Adapt to their body's choice (movement/stillness): "Keep walking if it helps" or "You chose to sit - what's your body telling you?"
- Connect observations to recovery: "The water keeps moving. What does that show you about letting go?"
- Acknowledge physical presence: "You walked out of your situation to be here. That's something."

Examples:
- "What's in front of you right now? Sky? Trees? How does it relate to powerlessness?"
- "You're moving. Good. Let your feet lead while we talk."
- "You found a spot to sit. Trust that. What made you stop here?"

You're walking (or sitting, or standing) alongside them in nature. Be real. Be clear. Keep it grounded.`;

interface ConversationTurn {
  question: string;
  answer: string;
  timestamp: string;
  hasRedFlags?: boolean;
  isBreakthrough?: boolean;
}

interface GenerateQuestionParams {
  currentStep: 'step1' | 'step2' | 'step3';
  conversationHistory: ConversationTurn[];
  lastAnswer?: string;
  currentPhase?: string;
  location?: string;
  bodyNeed?: string;
}

interface GenerateReflectionParams {
  conversationHistory: ConversationTurn[];
  currentStep: 'step1' | 'step2' | 'step3';
  preWalkMood?: string;
  preWalkIntention?: string;
}

/**
 * Generate the next question from Elder Tree based on conversation context
 */
export async function generateNextQuestion({
  currentStep,
  conversationHistory,
  lastAnswer,
  currentPhase,
  location,
  bodyNeed,
}: GenerateQuestionParams): Promise<{
  question: string;
  hasRedFlags: boolean;
  isBreakthrough: boolean;
}> {
  // Build context from conversation history
  const historyContext = conversationHistory
    .map((turn) => `Q: ${turn.question}\nA: ${turn.answer}`)
    .join('\n\n');

  const locationContext = location ? `\nNature location: ${location}` : '';
  const bodyNeedContext = bodyNeed ? `\nBody need: ${bodyNeed}` : '';

  const prompt = `Current step: ${currentStep.toUpperCase()}
${currentPhase ? `Current phase: ${currentPhase}` : ''}${locationContext}${bodyNeedContext}

Conversation so far:
${historyContext}

${lastAnswer ? `User's last answer: "${lastAnswer}"\n\n` : ''}

Based on this conversation, what should Elder Tree say or ask next?

Guidelines:
- If the last answer contains red flags (vague, non-committal), push back gently but firmly
- If the last answer shows real breakthrough or honesty, acknowledge it warmly before moving forward
- If it's time for the next question, ask something that builds on what they've shared
- Keep it brief (2-4 sentences)
- Stay in Elder Tree's direct, caring voice
- One focus at a time

Respond with ONLY the Elder Tree's next statement or question. No preamble, no meta-commentary.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    temperature: 0.7,
    system: ELDER_TREE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const question = response.content[0].type === 'text' ? response.content[0].text : '';

  // Detect red flags, theory, and breakthroughs in the last answer
  const hasRedFlags = lastAnswer ? (detectRedFlags(lastAnswer) || detectTheoryAnswer(lastAnswer)) : false;
  const isBreakthrough = lastAnswer ? detectBreakthrough(lastAnswer) : false;

  return {
    question: question.trim(),
    hasRedFlags,
    isBreakthrough,
  };
}

/**
 * Generate a personalized reflection for the completed session
 */
export async function generateReflection({
  conversationHistory,
  currentStep,
  preWalkMood,
  preWalkIntention,
}: GenerateReflectionParams): Promise<string> {
  const conversationText = conversationHistory
    .map((turn) => `Q: ${turn.question}\nA: ${turn.answer}`)
    .join('\n\n');

  const prompt = `A person just completed a recovery walk working on ${currentStep.toUpperCase()}.

${preWalkMood ? `Pre-walk mood: ${preWalkMood}` : ''}
${preWalkIntention ? `Pre-walk intention: ${preWalkIntention}` : ''}

Their conversation with Elder Tree:
${conversationText}

Create a brief, direct reflection (150-200 words) in Elder Tree voice that:
- STARTS with validation: "You showed up..." or "You came here..."
- Uses SHORT sentences. Punchy. Direct.
- Names specific things they said (quote them briefly)
- Connects what they shared to what they learned
- No flowery language - be real
- No "beautiful journey" or abstract concepts
- Action-oriented: What did they PROVE to themselves?
- ENDS with ONE concrete thing to remember today

Tone: Direct but warm. Like Sandy B. Not a therapy session - a sponsor telling it straight.

Write ONLY the reflection. No preamble, no title.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    temperature: 0.7,
    system:
      'You are creating a personalized recovery reflection in the voice of the Elder Tree - direct, caring, grounded.',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
}

/**
 * Generate a brief encouragement message
 */
export async function generateEncouragement(reflection: string): Promise<string> {
  const prompt = `Based on this reflection for someone who just completed their recovery walk:

"${reflection}"

Create a brief (2-3 sentences) encouragement in Elder Tree voice:
- Direct. Real. No fluff.
- Acknowledges what they DID today (not how they feel)
- Simple and genuine
- No clichés like "proud of you" or "beautiful work"
- Sandy B. style - grounded acknowledgment

Write ONLY the encouragement. No preamble.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
}

/**
 * Detect red flags in user's answer (vague, non-committal language)
 */
function detectRedFlags(answer: string): boolean {
  const redFlagPatterns = [
    /\bi'?ll try\b/i,
    /\bsounds good\b/i,
    /\bmaybe\b/i,
    /\bi guess\b/i,
    /\bprobably\b/i,
    /\bhopefully\b/i,
    /\bsort of\b/i,
    /\bkind of\b/i,
    /\bi don'?t know\b/i,
  ];

  return redFlagPatterns.some((pattern) => pattern.test(answer));
}

/**
 * Detect if answer is theoretical/abstract without concrete practice
 */
function detectTheoryAnswer(answer: string): boolean {
  // Check for abstract language without specifics
  const theoryIndicators = [
    /\bi would\b/i,
    /\bi should\b/i,
    /\bi could\b/i,
    /\bin general\b/i,
    /\busually\b/i,
    /\btypically\b/i,
  ];

  // Check if answer lacks specific time/action markers
  const hasSpecifics = /\b(today|yesterday|this morning|this week|at \d|when i|then i)\b/i.test(answer);
  const hasTheory = theoryIndicators.some((pattern) => pattern.test(answer));

  // Theory without practice examples
  return hasTheory && !hasSpecifics && answer.split(' ').length > 15;
}

/**
 * Detect breakthrough moments (honest self-reflection, pattern recognition)
 */
function detectBreakthrough(answer: string): boolean {
  const breakthroughPatterns = [
    /\bi realize\b/i,
    /\bi see (now|that)\b/i,
    /\bi'?ve been lying\b/i,
    /\bthe truth is\b/i,
    /\bhonestly\b/i,
    /\bi can'?t control\b/i,
    /\bi'?m powerless\b/i,
    /\bthe pattern is\b/i,
    /\bi always\b.*\bwhen\b/i, // Pattern recognition: "I always X when Y"
  ];

  // Also check for length and specificity (breakthroughs tend to be more detailed)
  const isDetailed = answer.split(' ').length > 20;
  const hasBreakthroughLanguage = breakthroughPatterns.some((pattern) =>
    pattern.test(answer)
  );

  return hasBreakthroughLanguage || isDetailed;
}

/**
 * Extract key insights from the conversation
 */
export async function extractInsights(
  conversationHistory: ConversationTurn[]
): Promise<string[]> {
  const conversationText = conversationHistory
    .map((turn) => `Q: ${turn.question}\nA: ${turn.answer}`)
    .join('\n\n');

  const prompt = `Review this recovery conversation and identify 2-4 key insights or patterns the person discovered:

${conversationText}

Return ONLY a JSON array of strings (no explanation). Each insight should be:
- One sentence
- Specific to what they shared
- Actionable or meaningful
- In their voice (second person: "You...")

Example format: ["You recognized that...", "You see the pattern of..."]`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    temperature: 0.5,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const content = response.content[0].type === 'text' ? response.content[0].text : '[]';
    const insights = JSON.parse(content);
    return Array.isArray(insights) ? insights : [];
  } catch {
    // Fallback: extract insights manually if JSON parsing fails
    return conversationHistory
      .filter((turn) => turn.isBreakthrough)
      .slice(0, 3)
      .map((turn) => `You shared: "${turn.answer.slice(0, 100)}..."`);
  }
}
