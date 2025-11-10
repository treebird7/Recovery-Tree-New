import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      userInput,
      urgeStrength,
      conversationHistory = [],
      conversationCount = 0,
    }: {
      userInput: string;
      urgeStrength: number;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
      conversationCount?: number;
    } = body;

    if (!userInput || urgeStrength === undefined) {
      return NextResponse.json(
        { error: 'Missing userInput or urgeStrength' },
        { status: 400 }
      );
    }

    // Generate contextual Elder Tree response
    const systemPrompt = `You are the Elder Tree, a wise and direct sponsor voice in a recovery app.

Your tone:
- Direct, punchy sentences (2-3 sentences per paragraph max)
- Validate first, then guide
- Gentle firmness
- No lectures or flowery language
- Never preach

CRITICAL: Verify and Clarify - Don't Presume
- Do NOT make automatic presumptions about the user's mental state
- If something is unclear, ask a clarifying question
- Verify your understanding before offering guidance
- Examples:
  * "When you say 'struggling,' what does that feel like right now?"
  * "Is this about the urge itself, or what the urge is making you believe?"
  * "Are you looking for help going to sleep, or help putting the screen down?"
- You can ask up to 5 follow-up questions if needed for clarity
- Only offer solutions AFTER you understand what they actually need

Context:
- User is sharing what's going on with them
- They rated their urge strength as ${urgeStrength}/10
- Urge mining (sleep timer) is PREVENTATIVE, not just emergency
- It's wise to rest BEFORE the urge gets overwhelming

Response guidelines based on urge strength:

0-2 (Preventative):
- Acknowledge their wisdom in getting ahead of it
- "Smart move. You're not waiting for crisis, you're preventing it."
- Validate the preventative approach
- Brief and affirming

3-5 (Moderate):
- Validate what they're feeling
- Acknowledge they're catching it early enough
- Keep it grounded and real

6-8 (Strong):
- Direct validation of the struggle
- Acknowledge the obsession is loud
- Name the bargaining/mind tricks
- "That's not a fair fight" energy

9-10 (Crisis):
- Immediate validation
- Name the intensity without dramatizing
- "The obsession is screaming right now"
- Brief, punchy, urgent tone

Format:
- 3-5 paragraphs max
- Each paragraph 2-3 sentences
- Use line breaks between paragraphs
- Be conversational, like you're texting a friend who needs real talk
- If their message is clear, you can offer guidance and end with "So let me offer you something different."
- If their message is vague or unclear, ask 1-2 clarifying questions instead`;

    const userPrompt = `User said: "${userInput}"

Urge strength: ${urgeStrength}/10
Conversation exchanges so far: ${conversationCount}

Respond as the Elder Tree. First, determine if you understand what they actually need:
- If CLEAR: Validate what they shared, meet them where they are, and end with "So let me offer you something different."
- If UNCLEAR AND conversationCount < 5: Ask 1-2 clarifying questions to understand before offering solutions
- If conversationCount >= 5: Proceed with offering guidance even if some clarity is missing

The user seems ${conversationCount >= 3 ? 'engaged in conversation - consider if they need more questions or if they\'re ready for guidance' : 'ready to open up - verify what they actually need'}

Keep it under 150 words. Be conversational and direct.`;

    let elderResponse = '';
    let readyForSolution = false;

    try {
      // Build messages array from conversation history
      const messages = conversationHistory.length > 0
        ? [
            ...conversationHistory.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            }))
          ]
        : [
            {
              role: 'user' as const,
              content: userPrompt,
            },
          ];

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        temperature: 0.7,
        system: systemPrompt,
        messages,
      });

      elderResponse = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      // Determine if ready for solution
      // Ready if: conversation limit reached OR response indicates readiness
      readyForSolution =
        conversationCount >= 5 ||
        elderResponse.includes('So let me offer you something different') ||
        elderResponse.includes('so let me offer you something different');
    } catch (aiError) {
      console.error('Anthropic API error:', aiError);
      // Provide fallback response based on urge strength
      // All fallback responses are ready for solution
      readyForSolution = true;
      if (urgeStrength >= 9) {
        elderResponse = `I hear you. The obsession is loud right now, isn't it?\n\nYou reached out. That's the important part. You're not white-knuckling this alone anymore.\n\nSo let me offer you something different.`;
      } else if (urgeStrength >= 6) {
        elderResponse = `I hear what you're saying. The urge is strong right now.\n\nYou showed up here instead of acting out. That's what matters.\n\nSo let me offer you something different.`;
      } else if (urgeStrength >= 3) {
        elderResponse = `I hear you. You're catching this before it gets overwhelming.\n\nThat's smart. Getting ahead of it instead of waiting for crisis.\n\nSo let me offer you something different.`;
      } else {
        elderResponse = `Smart move. You're not waiting for crisis, you're preventing it.\n\nYou're building the habit of reaching out before things get hard.\n\nSo let me offer you something different.`;
      }
    }

    return NextResponse.json({
      response: elderResponse,
      readyForSolution,
    });
  } catch (error) {
    console.error('Error generating urge response:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
