import { Redis } from '@upstash/redis';

/**
 * Initialize Upstash Redis client
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  twitterFollowing: (address: string) => `twitter:following:${address}`,
  farcasterMatch: (address: string) => `farcaster:match:${address}`,
  userProfile: (fid: string) => `farcaster:profile:${fid}`,
};

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  twitterFollowing: 86400, // 24 hours
  farcasterMatch: 3600, // 1 hour
  userProfile: 3600, // 1 hour
};

/**
 * Get cached data
 * @param key - Cache key
 * @returns Cached data or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return data as T;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

/**
 * Set cached data with TTL
 * @param key - Cache key
 * @param value - Data to cache
 * @param ttl - Time to live in seconds
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

/**
 * Delete cached data
 * @param key - Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Error deleting cache:', error);
  }
}

/**
 * Increment a counter
 * @param key - Counter key
 * @returns New counter value
 */
export async function incrementCounter(key: string): Promise<number> {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error('Error incrementing counter:', error);
    return 0;
  }
}
