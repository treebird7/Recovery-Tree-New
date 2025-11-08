import * as fal from '@fal-ai/serverless-client';
import { ConversationTurn } from './conversation-manager';

// Configure FAL client
fal.config({
  credentials: process.env.FAL_API_KEY,
});

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
 * Build nature-focused prompt based on mood
 */
function buildNaturePrompt(mood: Mood): string {
  const prompts: Record<Mood, string> = {
    hopeful:
      'Sunrise through a misty forest, golden light filtering through tall trees, dewdrops on leaves, rays of sunlight breaking through morning fog, photorealistic nature photography, serene and uplifting, 8k quality',

    struggling:
      'Winding forest path through dense woods, soft overcast light, moss-covered stones, ancient trees providing shelter, gentle and safe atmosphere, photorealistic nature photography, peaceful and grounding, 8k quality',

    breakthrough:
      'Mountain vista with clearing storm clouds, dramatic light breaking through, vast landscape below, sense of elevation and clarity, photorealistic nature photography, inspiring and expansive, 8k quality',

    peaceful:
      'Quiet lake at dawn, perfect reflections on still water, surrounding pine forest, morning mist hovering over water surface, photorealistic nature photography, tranquil and calming, 8k quality',

    reflective:
      'Autumn forest with golden and amber leaves, dappled sunlight through canopy, tree reflecting on small pond, sense of change and beauty, photorealistic nature photography, warm and contemplative, 8k quality',
  };

  return prompts[mood];
}

/**
 * Generate a nature image using FAL.ai Flux Realism
 */
export async function generateNatureImage(
  conversationHistory: ConversationTurn[],
  preWalkMood?: string
): Promise<{ imageUrl: string | null; error: string | null }> {
  try {
    // Analyze mood from conversation
    const mood = analyzeMood(conversationHistory);
    const prompt = buildNaturePrompt(mood);

    console.log(`Generating image for mood: ${mood}`);

    // Call FAL.ai API
    const result = await fal.subscribe('fal-ai/flux-realism', {
      input: {
        prompt,
        negative_prompt:
          'people, faces, humans, animals, text, watermark, buildings, cars, urban, artificial structures, signs',
        image_size: 'landscape_16_9',
        num_inference_steps: 28,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: true,
        seed: Math.floor(Math.random() * 1000000), // Random seed for variety
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('Image generation in progress...');
        }
      },
    });

    // Extract image URL from result
    console.log('FAL.ai result:', JSON.stringify(result, null, 2));

    // Type assertion for FAL.ai response
    const typedResult = result as { data?: { images?: { url: string }[] } };

    if (typedResult.data && typedResult.data.images && typedResult.data.images.length > 0) {
      const imageUrl = typedResult.data.images[0].url;
      console.log('Image generated successfully:', imageUrl);
      return { imageUrl, error: null };
    }

    console.error('FAL.ai returned no images. Full result:', result);
    return {
      imageUrl: null,
      error: 'No image generated from FAL.ai',
    };
  } catch (error) {
    console.error('FAL.ai image generation error:', error);
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
    const fullPrompt = `${customPrompt}, photorealistic nature photography, beautiful natural lighting, 8k quality`;

    const result = await fal.subscribe('fal-ai/flux-realism', {
      input: {
        prompt: fullPrompt,
        negative_prompt:
          'people, faces, humans, animals, text, watermark, buildings, cars, urban, artificial structures',
        image_size: 'landscape_16_9',
        num_inference_steps: 28,
        guidance_scale: 7.5,
        num_images: 1,
      },
    });

    // Type assertion for FAL.ai response
    const typedResult = result as { data?: { images?: { url: string }[] } };

    if (typedResult.data && typedResult.data.images && typedResult.data.images.length > 0) {
      return { imageUrl: typedResult.data.images[0].url, error: null };
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
