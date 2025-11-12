/**
 * Elder Tree Response Caching
 *
 * Caches AI-generated responses to reduce API costs and improve performance.
 * Uses in-memory cache with TTL (time-to-live) expiration.
 *
 * Note: Elder Tree encouragement messages are intentionally NOT cached
 * per IMPROVEMENTS.md design decision - each session should feel fresh.
 * This cache is for other Elder Tree responses (walk sessions, etc.)
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private defaultTTL: number = 3600000) {
    // Default: 1 hour
    // Start cleanup timer to remove expired entries
    this.startCleanup();
  }

  /**
   * Get cached value if exists and not expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Expired - remove and return null
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set cached value with optional custom TTL
   */
  set(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    keys: string[];
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map((e) => e.timestamp);

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  /**
   * Start background cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Stop cleanup interval (for cleanup on shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// ============================================================================
// Cache Instances
// ============================================================================

/**
 * Walk session reflections cache (30 minutes)
 * Caches Elder Tree walk session responses based on session data
 */
export const walkReflectionCache = new Cache<string>(1800000);

/**
 * Question analysis cache (1 hour)
 * Caches Elder Tree question analysis for similar patterns
 */
export const questionAnalysisCache = new Cache<any>(3600000);

/**
 * Prayer collaboration cache (15 minutes)
 * Caches Elder Tree prayer collaboration responses
 */
export const prayerCache = new Cache<string>(900000);

// ============================================================================
// Cache Key Generators
// ============================================================================

/**
 * Generate cache key for walk session reflection
 */
export function getWalkReflectionKey(
  userId: string,
  currentStep: string,
  mood: string,
  sessionType: string
): string {
  // Include step and mood in key, but not userId (to allow cross-user caching of similar experiences)
  return `walk:${currentStep}:${mood}:${sessionType}`;
}

/**
 * Generate cache key for question analysis
 */
export function getQuestionAnalysisKey(
  questionId: string,
  answerLength: number
): string {
  // Cache based on question and rough answer length category
  const lengthCategory =
    answerLength < 50 ? 'short' : answerLength < 200 ? 'medium' : 'long';
  return `question:${questionId}:${lengthCategory}`;
}

/**
 * Generate cache key for prayer collaboration
 */
export function getPrayerKey(prayerText: string): string {
  // Hash prayer text to create deterministic key
  return `prayer:${hashString(prayerText)}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// ============================================================================
// Cache Utilities
// ============================================================================

/**
 * Get or set cached value with async generator function
 */
export async function getOrSet<T>(
  cache: Cache<T>,
  key: string,
  generator: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache
  const cached = cache.get(key);
  if (cached !== null) {
    console.log(`[Cache HIT] ${key}`);
    return cached;
  }

  // Cache miss - generate value
  console.log(`[Cache MISS] ${key}`);
  const value = await generator();

  // Store in cache
  cache.set(key, value, ttl);

  return value;
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateByPattern(
  cache: Cache<any>,
  pattern: string
): number {
  const stats = cache.stats();
  let count = 0;

  for (const key of stats.keys) {
    if (key.includes(pattern)) {
      cache.delete(key);
      count++;
    }
  }

  console.log(`[Cache] Invalidated ${count} entries matching: ${pattern}`);
  return count;
}

/**
 * Get all cache statistics
 */
export function getAllCacheStats() {
  return {
    walkReflection: walkReflectionCache.stats(),
    questionAnalysis: questionAnalysisCache.stats(),
    prayer: prayerCache.stats(),
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  walkReflectionCache.clear();
  questionAnalysisCache.clear();
  prayerCache.clear();
  console.log('[Cache] All caches cleared');
}

// ============================================================================
// Configuration
// ============================================================================

export const CacheConfig = {
  // TTL values in milliseconds
  TTL: {
    WALK_REFLECTION: 1800000, // 30 minutes
    QUESTION_ANALYSIS: 3600000, // 1 hour
    PRAYER: 900000, // 15 minutes
    ENCOURAGEMENT: 0, // Never cache (per design decision)
  },

  // Feature flags
  ENABLED: {
    WALK_REFLECTION: true,
    QUESTION_ANALYSIS: false, // Disabled by default - experimental
    PRAYER: true,
    ENCOURAGEMENT: false, // Never enable per design
  },
} as const;

// ============================================================================
// Cleanup on process exit
// ============================================================================

if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    console.log('[Cache] Shutting down caches...');
    walkReflectionCache.destroy();
    questionAnalysisCache.destroy();
    prayerCache.destroy();
  });
}
