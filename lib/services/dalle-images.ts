/**
 * DALL-E Image Generation Service
 *
 * Generates nature images using OpenAI's DALL-E 3 API
 * Replaces FAL.ai for more reliable image generation
 */

import OpenAI from 'openai';
import { ConversationTurn } from './conversation-manager';

export type Mood = 'hopeful' | 'struggling' | 'breakthrough' | 'peaceful' | 'reflective';

/**
 * Analyze conversation to determine emotional mood
 */
export function analyzeMood(conversationHistory: ConversationTurn[]): Mood {
  const recentAnswers = conversationHistory
    .slice(-3)
    .map((turn) => turn.answer.toLowerCase())
    .join(' ');

  // Check for breakthrough moments
  const breakthroughCount = conversationHistory.filter((turn) => turn.isBreakthrough).length;
  if (breakthroughCount >= 2) {
    return 'breakthrough';
  }

  // Check for struggling indicators
  const strugglingWords = ['hard', 'difficult', 'struggling', 'overwhelmed', 'exhausted', 'tired'];
  const hasStrugglingWords = strugglingWords.some((word) => recentAnswers.includes(word));
  if (hasStrugglingWords) {
    return 'struggling';
  }

  // Check for hopeful indicators
  const hopefulWords = [
    'hope',
    'better',
    'grateful',
    'ready',
    'willing',
    'want to',
    'trying to change',
  ];
  const hasHopefulWords = hopefulWords.some((word) => recentAnswers.includes(word));
  if (hasHopefulWords) {
    return 'hopeful';
  }

  // Check for reflective indicators
  const reflectiveWords = ['realize', 'understand', 'see now', 'learning', 'aware'];
  const hasReflectiveWords = reflectiveWords.some((word) => recentAnswers.includes(word));
  if (hasReflectiveWords) {
    return 'reflective';
  }

  // Default to peaceful
  return 'peaceful';
}

/**
 * Build nature-focused prompt based on mood for DALL-E 3
 */
function buildNaturePrompt(mood: Mood): string {
  const prompts: Record<Mood, string> = {
    hopeful:
      'A photorealistic nature scene of a sunrise through a misty forest. Golden light filters through tall trees, dewdrops glisten on leaves, and rays of sunlight break through morning fog. The atmosphere is serene and uplifting, evoking hope and new beginnings. High quality landscape photography style.',

    struggling:
      'A photorealistic nature scene of a winding forest path through dense woods. Soft overcast light illuminates moss-covered stones and ancient trees that provide shelter. The atmosphere is gentle and safe, evoking a sense of grounding and protection. High quality landscape photography style.',

    breakthrough:
      'A photorealistic nature scene of a mountain vista with clearing storm clouds. Dramatic light breaks through the clouds, illuminating a vast landscape below with a sense of elevation and clarity. The atmosphere is inspiring and expansive, evoking moments of realization. High quality landscape photography style.',

    peaceful:
      'A photorealistic nature scene of a quiet lake at dawn. Perfect reflections shimmer on still water, surrounded by a pine forest. Morning mist hovers over the water surface. The atmosphere is tranquil and calming, evoking deep peace. High quality landscape photography style.',

    reflective:
      'A photorealistic nature scene of an autumn forest with golden and amber leaves. Dappled sunlight filters through the canopy, and a tree reflects in a small pond. The atmosphere is warm and contemplative, evoking a sense of change and beauty. High quality landscape photography style.',
  };

  return prompts[mood];
}

/**
 * Generate a nature image using OpenAI DALL-E 3
 */
export async function generateNatureImage(
  conversationHistory: ConversationTurn[],
  preWalkMood?: string
): Promise<{ imageUrl: string | null; error: string | null }> {
  try {
    // Initialize OpenAI client (must be inside function, not module-level - FUCKBOARD lesson #2)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Analyze mood from conversation
    const mood = analyzeMood(conversationHistory);
    const prompt = buildNaturePrompt(mood);

    console.log(`Generating image with DALL-E 3 for mood: ${mood}`);

    // Call OpenAI DALL-E 3 API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024', // Landscape format
      quality: 'standard', // or 'hd' for higher quality (more expensive)
      style: 'natural', // Natural photographic style
    });

    // Extract image URL from response
    const imageUrl = response.data?.[0]?.url;

    if (imageUrl) {
      console.log('Image generated successfully with DALL-E 3');
      return { imageUrl, error: null };
    }

    console.error('DALL-E 3 returned no image URL');
    return {
      imageUrl: null,
      error: 'No image generated from DALL-E 3',
    };
  } catch (error) {
    console.error('DALL-E 3 image generation error:', error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return {
        imageUrl: null,
        error: `OpenAI API Error: ${error.message}`,
      };
    }

    return {
      imageUrl: null,
      error: error instanceof Error ? error.message : 'Unknown error generating image',
    };
  }
}

/**
 * Generate a nature image with a custom prompt (fallback option)
 */
export async function generateCustomNatureImage(
  customPrompt: string
): Promise<{ imageUrl: string | null; error: string | null }> {
  try {
    // Initialize OpenAI client (must be inside function, not module-level - FUCKBOARD lesson #2)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const fullPrompt = `A photorealistic nature scene: ${customPrompt}. High quality landscape photography style with beautiful natural lighting.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'natural',
    });

    const imageUrl = response.data?.[0]?.url;

    if (imageUrl) {
      return { imageUrl, error: null };
    }

    return { imageUrl: null, error: 'No image generated' };
  } catch (error) {
    return {
      imageUrl: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get mood description for UI display
 */
export function getMoodDescription(mood: Mood): string {
  const descriptions: Record<Mood, string> = {
    hopeful: 'Your journey today feels full of hope and new beginnings.',
    struggling: 'You showed up today even when it was hard. That takes courage.',
    breakthrough: 'Today brought clarity and important realizations.',
    peaceful: 'You found peace and presence on your walk today.',
    reflective: 'Today was about understanding and self-awareness.',
  };

  return descriptions[mood];
}
