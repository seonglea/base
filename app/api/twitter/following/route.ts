import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTwitterFollowing, extractUsernames } from '@/lib/rapidapi';
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { withSecurity } from '@/lib/security';

/**
 * POST /api/twitter/following
 * Get authenticated user's Twitter following list
 *
 * SECURITY:
 * - Requires Twitter OAuth authentication
 * - Only fetches logged-in user's own data
 * - Protected with rate limiting and origin verification
 * - API keys only used server-side
 */
async function handler(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.twitterUsername) {
      return NextResponse.json(
        { error: 'Please sign in with Twitter first' },
        { status: 401 }
      );
    }

    const twitterUsername = (session.user as any).twitterUsername;
    const twitterId = (session.user as any).twitterId || twitterUsername;

    // 2. Check cache first
    const cacheKey = CACHE_KEYS.twitterFollowing(twitterId);
    const cachedData = await getCache<string[]>(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        data: cachedData,
        source: 'cache',
        count: cachedData.length,
        username: twitterUsername,
      });
    }

    // 3. Fetch from RapidAPI
    // IMPORTANT: RAPIDAPI_KEY is only available server-side
    const followingUsers = await getTwitterFollowing(twitterUsername, 200);
    const usernames = extractUsernames(followingUsers);

    // 4. Cache the results (24 hours)
    await setCache(cacheKey, usernames, CACHE_TTL.twitterFollowing);

    return NextResponse.json({
      data: usernames,
      source: 'api',
      count: usernames.length,
      username: twitterUsername,
    });
  } catch (error) {
    console.error('Error fetching Twitter following:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Twitter following list',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Export with security middleware
export const POST = withSecurity(handler);
