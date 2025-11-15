import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/contract';
import { getTwitterFollowing, extractUsernames } from '@/lib/rapidapi';
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';
import { withSecurity } from '@/lib/security';

/**
 * POST /api/twitter/following
 * Get user's Twitter following list
 * Requires payment verification (except for first query)
 *
 * SECURITY: Protected with rate limiting and origin verification
 * API keys (RAPIDAPI_KEY) are only used server-side and never exposed to client
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, twitterUsername, txHash } = body;

    // Validation
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

    // Sanitize input to prevent injection
    const sanitizedUsername = twitterUsername
      .replace(/[^a-zA-Z0-9_]/g, '')
      .substring(0, 15);

    if (sanitizedUsername.length === 0) {
      return NextResponse.json(
        { error: 'Invalid Twitter username' },
        { status: 400 }
      );
    }

    // 1. Verify payment (on-chain verification)
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
    // IMPORTANT: RAPIDAPI_KEY is only available server-side
    // It's never included in the client JavaScript bundle
    const followingUsers = await getTwitterFollowing(sanitizedUsername, 200);
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

// Export with security middleware
export const POST = withSecurity(handler);
