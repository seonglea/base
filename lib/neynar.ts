/**
 * Neynar API client for Farcaster interactions
 * Documentation: https://docs.neynar.com/
 */

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';
const NEYNAR_BASE_URL = 'https://api.neynar.com/v2';

export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  verifications?: string[];
  follower_count: number;
  following_count: number;
}

export interface VerifiedAccount {
  platform: string;
  username: string;
}

/**
 * Search for Farcaster users by username
 * @param username - Username to search for
 * @returns Array of matching users
 */
export async function searchFarcasterUsers(
  username: string
): Promise<FarcasterUser[]> {
  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/farcaster/user/search?q=${encodeURIComponent(username)}`,
      {
        headers: {
          'api_key': NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result?.users || [];
  } catch (error) {
    console.error('Error searching Farcaster users:', error);
    return [];
  }
}

/**
 * Get Farcaster user by FID
 * @param fid - Farcaster ID
 * @returns User data
 */
export async function getFarcasterUser(fid: number): Promise<FarcasterUser | null> {
  try {
    const response = await fetch(
      `${NEYNAR_BASE_URL}/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          'api_key': NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.users?.[0] || null;
  } catch (error) {
    console.error('Error getting Farcaster user:', error);
    return null;
  }
}

/**
 * Get user's verified accounts (including Twitter/X)
 * @param fid - Farcaster ID
 * @returns Array of verified accounts
 */
export async function getVerifiedAccounts(
  fid: number
): Promise<VerifiedAccount[]> {
  try {
    const user = await getFarcasterUser(fid);
    if (!user) return [];

    const verifiedAccounts: VerifiedAccount[] = [];

    // Note: Neynar V2 API stores Twitter handles in user profile
    // You may need to check user.profile.bio or connected_accounts
    // This is a simplified version

    return verifiedAccounts;
  } catch (error) {
    console.error('Error getting verified accounts:', error);
    return [];
  }
}

/**
 * Follow a user on Farcaster
 * @param signerUuid - Signer UUID for the action
 * @param targetFid - FID of user to follow
 * @returns Success status
 */
export async function followUser(
  signerUuid: string,
  targetFid: number
): Promise<boolean> {
  try {
    const response = await fetch(`${NEYNAR_BASE_URL}/farcaster/user/follow`, {
      method: 'POST',
      headers: {
        'api_key': NEYNAR_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signer_uuid: signerUuid,
        target_fids: [targetFid],
      }),
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
}

/**
 * Search for users by verified Twitter/X handle
 * @param twitterHandle - Twitter/X username (without @)
 * @returns Matching Farcaster user or null
 */
export async function findUserByTwitterHandle(
  twitterHandle: string
): Promise<FarcasterUser | null> {
  try {
    // Search by username first (many users use same handle)
    const users = await searchFarcasterUsers(twitterHandle);

    if (users.length === 0) return null;

    // For now, return first match
    // In production, you'd want to verify the Twitter connection
    return users[0];
  } catch (error) {
    console.error('Error finding user by Twitter handle:', error);
    return null;
  }
}

/**
 * Bulk search for users by Twitter handles
 * @param twitterHandles - Array of Twitter/X usernames
 * @returns Map of Twitter handle to Farcaster user
 */
export async function bulkFindUsersByTwitterHandles(
  twitterHandles: string[]
): Promise<Map<string, FarcasterUser>> {
  const results = new Map<string, FarcasterUser>();

  // Process in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < twitterHandles.length; i += batchSize) {
    const batch = twitterHandles.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (handle) => {
        const user = await findUserByTwitterHandle(handle);
        if (user) {
          results.set(handle, user);
        }
      })
    );

    // Rate limiting delay
    if (i + batchSize < twitterHandles.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
