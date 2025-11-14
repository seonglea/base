import { NextRequest, NextResponse } from 'next/server';
import { bulkFindUsersByTwitterHandles } from '@/lib/neynar';
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

export interface MatchedFriend {
  twitterHandle: string;
  farcasterUser: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    follower_count: number;
    following_count: number;
  };
}

/**
 * POST /api/farcaster/match
 * Match Twitter handles with Farcaster users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { twitterHandles, address } = body;

    if (!twitterHandles || !Array.isArray(twitterHandles)) {
      return NextResponse.json(
        { error: 'twitterHandles array is required' },
        { status: 400 }
      );
    }

    if (twitterHandles.length === 0) {
      return NextResponse.json({
        matches: [],
        count: 0,
      });
    }

    // Check cache if address provided
    if (address) {
      const cacheKey = CACHE_KEYS.farcasterMatch(address);
      const cachedData = await getCache<MatchedFriend[]>(cacheKey);

      if (cachedData) {
        return NextResponse.json({
          matches: cachedData,
          count: cachedData.length,
          source: 'cache',
        });
      }
    }

    // Bulk search for Farcaster users
    const userMap = await bulkFindUsersByTwitterHandles(twitterHandles);

    // Format matches
    const matches: MatchedFriend[] = [];
    userMap.forEach((farcasterUser, twitterHandle) => {
      matches.push({
        twitterHandle,
        farcasterUser: {
          fid: farcasterUser.fid,
          username: farcasterUser.username,
          display_name: farcasterUser.display_name,
          pfp_url: farcasterUser.pfp_url,
          follower_count: farcasterUser.follower_count,
          following_count: farcasterUser.following_count,
        },
      });
    });

    // Sort by follower count (most popular first)
    matches.sort(
      (a, b) => b.farcasterUser.follower_count - a.farcasterUser.follower_count
    );

    // Cache results if address provided
    if (address && matches.length > 0) {
      const cacheKey = CACHE_KEYS.farcasterMatch(address);
      await setCache(cacheKey, matches, CACHE_TTL.farcasterMatch);
    }

    return NextResponse.json({
      matches,
      count: matches.length,
      total_searched: twitterHandles.length,
      match_rate: `${((matches.length / twitterHandles.length) * 100).toFixed(1)}%`,
      source: 'api',
    });
  } catch (error) {
    console.error('Error matching Farcaster users:', error);
    return NextResponse.json(
      {
        error: 'Failed to match Farcaster users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
