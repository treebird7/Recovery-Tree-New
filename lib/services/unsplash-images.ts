/**
 * Curated nature image collection from Unsplash
 * Free, fast, reliable alternative to AI image generation
 * Images selected based on mood/journey themes
 */

interface NatureImageCollection {
  [key: string]: string[];
}

// Curated high-quality nature photos from Unsplash
const NATURE_IMAGES: NatureImageCollection = {
  hopeful: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Mountain sunrise - new beginnings
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80', // Forest light rays - clarity
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80', // Mountain lake - calm hope
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80', // Sunrise forest path - moving forward
  ],

  peaceful: [
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80', // Misty lake reflection - serenity
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80', // Quiet forest - stillness
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80', // Birch forest - gentle peace
    'https://images.unsplash.com/photo-1518173835740-f5d6a8a4f2d1?w=1200&q=80', // Foggy woodland - soft calm
  ],

  struggling: [
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80', // Winding forest path - perseverance
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80', // Misty mountain trail - uncertainty
    'https://images.unsplash.com/photo-1476231790875-69f29dd4b45d?w=1200&q=80', // Dense forest - working through
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1200&q=80', // Rocky mountain path - challenge
  ],

  breakthrough: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Mountain vista - achievement
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', // Expansive sky - freedom
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80', // Mountain peaks - reaching heights
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Alpine sunrise - clarity achieved
  ],

  default: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80', // Peaceful forest
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80', // Forest light
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80', // Lake reflection
  ],
};

/**
 * Select a nature image based on user's mood/journey
 * @param mood - The emotional state: hopeful, peaceful, struggling, breakthrough
 * @returns Unsplash image URL
 */
export function selectNatureImage(mood: string = 'peaceful'): string {
  // Get images for this mood, fallback to default
  const moodImages = NATURE_IMAGES[mood.toLowerCase()] || NATURE_IMAGES.default;

  // Select randomly to add variety
  const randomIndex = Math.floor(Math.random() * moodImages.length);

  return moodImages[randomIndex];
}

/**
 * Get multiple images for a mood (for future carousel/selection feature)
 */
export function getImagesForMood(mood: string): string[] {
  return NATURE_IMAGES[mood.toLowerCase()] || NATURE_IMAGES.default;
}

/**
 * Get all available mood categories
 */
export function getAvailableMoods(): string[] {
  return Object.keys(NATURE_IMAGES).filter(key => key !== 'default');
}
