/**
 * Twitter API v2 client using OAuth 2.0 access token
 * This replaces RapidAPI with direct Twitter API calls
 */

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

/**
 * Get user's following list from Twitter API v2
 * Uses the authenticated user's access token
 *
 * @param accessToken - Twitter OAuth 2.0 access token
 * @param userId - Twitter user ID
 * @param maxResults - Maximum number of results to fetch (max 1000)
 * @returns Array of Twitter users the user is following
 */
export async function getTwitterFollowingWithToken(
  accessToken: string,
  userId: string,
  maxResults: number = 100
): Promise<TwitterUser[]> {
  const allUsers: TwitterUser[] = [];
  let paginationToken: string | null = null;

  try {
    // Twitter API v2 allows max 1000 per request
    const perPage = Math.min(maxResults, 1000);

    do {
      const url = new URL(`https://api.twitter.com/2/users/${userId}/following`);
      url.searchParams.set('max_results', String(Math.min(perPage, maxResults - allUsers.length)));
      url.searchParams.set('user.fields', 'id,username,name,profile_image_url');

      if (paginationToken) {
        url.searchParams.set('pagination_token', paginationToken);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Twitter API error:', response.status, errorText);

        if (response.status === 401) {
          throw new Error('Twitter access token expired. Please sign in again.');
        }
        if (response.status === 429) {
          throw new Error('Twitter API rate limit exceeded. Please try again later.');
        }
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        allUsers.push(...data.data);
      }

      // Check for pagination
      paginationToken = data.meta?.next_token || null;

    } while (paginationToken && allUsers.length < maxResults);

    return allUsers.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching Twitter following:', error);
    throw error;
  }
}

/**
 * Get authenticated user's profile from Twitter API v2
 *
 * @param accessToken - Twitter OAuth 2.0 access token
 * @returns Twitter user profile
 */
export async function getTwitterMe(accessToken: string): Promise<TwitterUser | null> {
  try {
    const response = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=id,username,name,profile_image_url',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.data || null;
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
