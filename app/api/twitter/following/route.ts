import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/contract';
import { getTwitterFollowing, extractUsernames } from '@/lib/rapidapi';
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

/**
 * POST /api/twitter/following
 * Get user's Twitter following list
 * Requires payment verification (except for first query)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, twitterUsername, txHash } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!twitterUsername) {
      return NextResponse.json(
        { error: 'Twitter username is required' },
        { status: 400 }
      );
    }

    // 1. Verify payment
    const isPaymentValid = await verifyPayment(address, txHash);

    if (!isPaymentValid) {
      return NextResponse.json(
        { error: 'Payment verification failed. Please complete payment first.' },
        { status: 403 }
      );
    }

    // 2. Check cache first
    const cacheKey = CACHE_KEYS.twitterFollowing(address);
    const cachedData = await getCache<string[]>(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        data: cachedData,
        source: 'cache',
        count: cachedData.length,
      });
    }

    // 3. Fetch from RapidAPI
    const followingUsers = await getTwitterFollowing(twitterUsername, 200);
    const usernames = extractUsernames(followingUsers);

    // 4. Cache the results
    await setCache(cacheKey, usernames, CACHE_TTL.twitterFollowing);

    return NextResponse.json({
      data: usernames,
      source: 'api',
      count: usernames.length,
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
