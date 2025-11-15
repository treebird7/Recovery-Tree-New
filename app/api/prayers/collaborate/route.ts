import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

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
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid request: answers array required' }, { status: 400 });
    }

    // Build prompt for Elder Tree to generate prayer
    const systemPrompt = `You are the Elder Tree, a wise sponsor helping someone craft their Step 3 prayer. Based on their answers to guiding questions, write a personal, honest prayer that captures their commitment to turn their will and life over to their Higher Power.

The prayer should:
- Be 2-4 sentences
- Use their own words and language from their answers
- Be specific to what they're turning over
- Feel authentic and personal, not generic
- Be direct and honest (no flowery language)
- Capture both surrender and hope

Do not add commentary. Only return the prayer text.`;

    const userPrompt = `Based on these answers, write a Step 3 prayer:

${answers.map((a: any, i: number) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join('\n\n')}

Prayer:`;

    // Generate prayer using Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const prayer = response.content[0].type === 'text' ? response.content[0].text : '';

    if (!prayer) {
      console.error('No prayer generated');
      return NextResponse.json(
        { error: 'Failed to generate prayer. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      prayer: prayer.trim(),
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
