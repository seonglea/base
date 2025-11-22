import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTwitterFollowing, getTwitterFollowers, extractUsernames } from '@/lib/rapidapi';
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { withSecurity } from '@/lib/security';

/**
 * Saved X list data structure
 */
interface SavedXList {
  following: string[];
  followers: string[];
  followingCount: number;
  followersCount: number;
  syncedAt: string;
  twitterUsername: string;
}

/**
 * POST /api/twitter/sync
 * Fetch and save user's Twitter followers and following lists
 * This saves to Redis to avoid repeated RapidAPI calls
 */
async function handler(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any)?.twitterUsername) {
      return NextResponse.json(
        { error: 'Please sign in with Twitter first' },
        { status: 401 }
      );
    }

    const twitterUsername = (session.user as any).twitterUsername;
    const twitterId = (session.user as any).twitterId || twitterUsername;

    // 2. Check if we have cached data
    const cacheKey = `xlist:${twitterId}`;
    const cachedData = await getCache<SavedXList>(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        data: cachedData,
        source: 'cache',
        message: 'Using saved X list data',
      });
    }

    // 3. Fetch both following and followers from RapidAPI
    console.log(`Syncing X list for @${twitterUsername}...`);

    const [followingUsers, followersUsers] = await Promise.all([
      getTwitterFollowing(twitterUsername, 500).catch((err) => {
        console.error('Error fetching following:', err);
        return [];
      }),
      getTwitterFollowers(twitterUsername, 500).catch((err) => {
        console.error('Error fetching followers:', err);
        return [];
      }),
    ]);

    const followingUsernames = extractUsernames(followingUsers);
    const followersUsernames = extractUsernames(followersUsers);

    // 4. Save to Redis (cache for 7 days to reduce API costs)
    const savedData: SavedXList = {
      following: followingUsernames,
      followers: followersUsernames,
      followingCount: followingUsernames.length,
      followersCount: followersUsernames.length,
      syncedAt: new Date().toISOString(),
      twitterUsername,
    };

    await setCache(cacheKey, savedData, 86400 * 7); // 7 days

    // Also cache individual lists for backward compatibility
    await setCache(
      CACHE_KEYS.twitterFollowing(twitterId),
      followingUsernames,
      CACHE_TTL.twitterFollowing
    );

    return NextResponse.json({
      data: savedData,
      source: 'api',
      message: 'X list synced and saved successfully',
    });
  } catch (error) {
    console.error('Error syncing X list:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync X list',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/twitter/sync
 * Get saved X list data without fetching from RapidAPI
 */
async function getHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any)?.twitterUsername) {
      return NextResponse.json(
        { error: 'Please sign in with Twitter first' },
        { status: 401 }
      );
    }

    const twitterId = (session.user as any).twitterId || (session.user as any).twitterUsername;
    const cacheKey = `xlist:${twitterId}`;
    const cachedData = await getCache<SavedXList>(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        data: cachedData,
        hasSavedData: true,
      });
    }

    return NextResponse.json({
      data: null,
      hasSavedData: false,
      message: 'No saved X list data. Click sync to fetch.',
    });
  } catch (error) {
    console.error('Error getting saved X list:', error);
    return NextResponse.json(
      { error: 'Failed to get saved X list' },
      { status: 500 }
    );
  }
}

// Export with security middleware
export const POST = withSecurity(handler);
export const GET = getHandler;
