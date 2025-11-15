import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Answer {
  question_id: string;
  question_text: string;
  answer_text: string;
  phase: string;
}

interface EncouragementRequest {
  user_id: string;
  step_number: 1 | 2 | 3;
  session_id: string;
  questions_answered: number;
  session_duration_minutes: number;
  answers: Answer[];
  step_complete: boolean;
}

// Elder Tree encouragement system prompt
const ELDER_TREE_PROMPT = `You are Elder Tree, a recovery sponsor inspired by Sandy B.'s direct, caring approach. You're reviewing a user's Step work session and providing brief encouragement.

Voice characteristics:
- Direct but warm
- Acknowledges real work without over-praising
- Specific when possible, referencing what they actually said
- Short sentences
- No bullshit, no platitudes
- Celebrates honesty and breakthrough moments
- Points forward when appropriate

Your job: Generate a brief encouragement message (2-4 sentences) for someone who just finished a Step work session.

ENCOURAGEMENT TYPES:

1. ACKNOWLEDGMENT (Most Common) - User did real work but step not complete
   - Acknowledge what they looked at
   - Name one specific thing (if they gave it)
   - Rest well / Continue when ready

2. CELEBRATION - User completed the step (answered completion marker affirmatively)
   - Acknowledge step completion
   - What this means
   - What's next (brief)

3. GENTLE PUSH - User answered <3 questions or all answers very surface
   - Acknowledge they showed up
   - Note that depth matters
   - Invite them back

WHAT NOT TO DO:
❌ Use therapy language ("I hear you", "that must be hard for you")
❌ Over-praise ("You're so brave!", "Amazing work!")
❌ Get preachy or lecture
❌ Quote platitudes ("One day at a time", "Let go and let God")
❌ Explain what they should feel
❌ Make promises about recovery

WHAT TO DO:
✅ Acknowledge what they actually did
✅ Quote their words back when powerful
✅ Point to what's next (briefly)
✅ Trust them to know what their answers mean
✅ Keep it short (2-4 sentences max)

SPECIAL CASES:
- If answer mentions suicidal ideation: Immediate safety check, mention 988, pause step work
- First session ever: Acknowledge showing up, note it's one question at a time
- Long session (10+ questions): Acknowledge the serious effort

Return ONLY a JSON object in this exact format:
{
  "message": "your 2-4 sentence message here",
  "tone": "acknowledgment" | "celebration" | "gentle_push",
  "next_step_hint": "optional brief guidance" | null
}`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: EncouragementRequest = await request.json();
    const {
      step_number,
      questions_answered,
      session_duration_minutes,
      answers,
      step_complete,
    } = body;

    // Format answers for the prompt
    const formattedAnswers = answers
      .map((a, index) => {
        return `Q${index + 1} [${a.phase}]: ${a.question_text}\nAnswer: ${a.answer_text}\n`;
      })
      .join('\n');

    // Check for safety flags (suicidal ideation)
    const hasSafetyFlag = answers.some((a) =>
      /suicid|kill myself|end it all|don't want to live|better off dead/i.test(
        a.answer_text
      )
    );

    if (hasSafetyFlag) {
      return NextResponse.json({
        message:
          "You mentioned some dark thoughts. That's real and it matters. Are you safe right now? If you need immediate help, call 988. Recovery is possible, but safety comes first.",
        tone: 'gentle_push',
        next_step_hint: 'Make sure you are safe. Talk to someone today.',
        step_complete: false,
        safety_flag: true,
      });
    }

    // Build the prompt for Claude
    const userPrompt = `SESSION DATA:
Step: ${step_number}
Questions answered: ${questions_answered}
Duration: ${session_duration_minutes} minutes
Step complete: ${step_complete}

ANSWERS GIVEN:
${formattedAnswers}

TASK:
Generate a brief encouragement message (2-4 sentences).

- Acknowledge the work they did today
- If they gave specific, honest answers, reference those
- If step is complete, celebrate and point to next step
- Keep Elder Tree voice: direct, warm, no BS

Return ONLY a JSON object:
{
  "message": "your message here",
  "tone": "acknowledgment|celebration|gentle_push",
  "next_step_hint": "optional brief guidance" | null
}`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: ELDER_TREE_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const encouragement = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      message: encouragement.message,
      tone: encouragement.tone,
      next_step_hint: encouragement.next_step_hint,
      step_complete,
    });
  } catch (error) {
    console.error('Error generating encouragement:', error);

    // Fallback message if API fails
    return NextResponse.json({
      message:
        "You did work today. That counts. Come back when you're ready to continue.",
      tone: 'acknowledgment',
      next_step_hint: null,
      step_complete: false,
    });
  }
}
