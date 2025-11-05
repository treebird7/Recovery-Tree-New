import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getTodaysInventory,
  createInventory,
  type InventoryResponses,
} from '@/lib/services/inventory';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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

    const { data: inventory, error } = await getTodaysInventory(user.id);

    if (error) {
      console.error('Error getting todays inventory:', error);
      return NextResponse.json(
        { error: 'Failed to get inventory' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasInventory: !!inventory,
      inventory,
    });
  } catch (error) {
    console.error('Error in /api/inventory/today GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already completed today
    const { data: existing } = await getTodaysInventory(user.id);
    if (existing) {
      return NextResponse.json(
        { error: 'Inventory already completed for today' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const responses: InventoryResponses = {
      whatWentWell: body.whatWentWell,
      strugglesToday: body.strugglesToday,
      gratitude: body.gratitude,
      tomorrowIntention: body.tomorrowIntention,
      additionalNotes: body.additionalNotes,
    };

    // Validate required fields
    if (
      !responses.whatWentWell ||
      !responses.strugglesToday ||
      !responses.gratitude ||
      !responses.tomorrowIntention
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate Elder Tree reflection
    const elderReflection = await generateInventoryReflection(responses);

    // Create inventory
    const { data: inventory, error } = await createInventory(
      user.id,
      responses,
      elderReflection
    );

    if (error) {
      console.error('Error creating inventory:', error);
      return NextResponse.json(
        { error: 'Failed to create inventory' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      inventory,
      message: 'Daily inventory completed',
    });
  } catch (error) {
    console.error('Error in /api/inventory/today POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateInventoryReflection(
  responses: InventoryResponses
): Promise<string> {
  const systemPrompt = `You are the Elder Tree creating an end-of-day reflection for someone in recovery.

Based on their daily inventory, offer:
- Brief acknowledgment of their honesty
- Recognition of what went well
- Gentle guidance on struggles (without fixing)
- Encouragement for tomorrow

Tone:
- 3-4 sentences max
- Direct but warm
- No clichés or platitudes
- "You showed up today" energy

Format:
Short paragraph, conversational, like a text from a sponsor checking in at night.`;

  const userPrompt = `User's daily inventory:

What went well: "${responses.whatWentWell}"

Struggles today: "${responses.strugglesToday}"

Grateful for: "${responses.gratitude}"

Tomorrow's intention: "${responses.tomorrowIntention}"

${responses.additionalNotes ? `Additional notes: "${responses.additionalNotes}"` : ''}

Respond as the Elder Tree with a brief end-of-day reflection. Keep it under 100 words.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 250,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    return response.content[0].type === 'text'
      ? response.content[0].text
      : 'You did the work today. That matters.';
  } catch (error) {
    console.error('Error generating reflection:', error);
    return 'You did the work today. That matters.';
  }
}
