/**
 * RapidAPI client for Twitter/X data
 * You'll need to subscribe to a Twitter API service on RapidAPI
 * Example: https://rapidapi.com/Glavier/api/twitter-api45
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'twitter-api45.p.rapidapi.com';

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

export interface TwitterFollowing {
  users: TwitterUser[];
  next_cursor?: string;
}

/**
 * Get user's following list from Twitter/X
 * Note: This is a simplified example. Actual implementation depends on
 * the specific RapidAPI service you're using.
 *
 * @param username - Twitter username (without @)
 * @param maxResults - Maximum number of results to fetch
 * @returns Array of Twitter users the user is following
 */
export async function getTwitterFollowing(
  username: string,
  maxResults: number = 100
): Promise<TwitterUser[]> {
  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/following.php?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse response based on your API's format
    // This is a generic example
    if (data.following) {
      return data.following.slice(0, maxResults);
    }

    return [];
  } catch (error) {
    console.error('Error fetching Twitter following:', error);
    throw error;
  }
}

/**
 * Get user's followers list from Twitter/X
 * @param username - Twitter username (without @)
 * @param maxResults - Maximum number of results to fetch
 * @returns Array of Twitter users following the user
 */
export async function getTwitterFollowers(
  username: string,
  maxResults: number = 100
): Promise<TwitterUser[]> {
  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/followers.php?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.followers) {
      return data.followers.slice(0, maxResults);
    }

    return [];
  } catch (error) {
    console.error('Error fetching Twitter followers:', error);
    throw error;
  }
}

/**
 * Get user profile from Twitter/X
 * @param username - Twitter username (without @)
 * @returns Twitter user profile
 */
export async function getTwitterProfile(
  username: string
): Promise<TwitterUser | null> {
  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/user.php?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Error fetching Twitter profile:', error);
    return null;
  }
}

/**
 * Extract usernames from a list of Twitter users
 * @param users - Array of Twitter users
 * @returns Array of usernames
 */
export function extractUsernames(users: TwitterUser[]): string[] {
  return users.map((user) => user.username);
}
