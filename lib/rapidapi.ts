/**
 * RapidAPI client for Twitter/X data
 * Supports multiple RapidAPI services:
 * - twitter241.p.rapidapi.com (Twttr API)
 * - twitter-api45.p.rapidapi.com
 * - Others
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'twitter241.p.rapidapi.com';

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  rest_id?: string;
  screen_name?: string;
}

export interface TwitterFollowing {
  users: TwitterUser[];
  next_cursor?: string;
}

/**
 * Get the appropriate endpoint based on the RapidAPI host
 */
function getFollowingEndpoint(host: string, username: string, count: number): string {
  // twitter241.p.rapidapi.com (Twttr API by davethebeast)
  if (host.includes('twitter241')) {
    return `https://${host}/user-followings?username=${encodeURIComponent(username)}&count=${count}`;
  }
  // twitter-api45.p.rapidapi.com
  if (host.includes('twitter-api45')) {
    return `https://${host}/following.php?username=${encodeURIComponent(username)}`;
  }
  // twitter154.p.rapidapi.com
  if (host.includes('twitter154')) {
    return `https://${host}/api/v1/following?username=${encodeURIComponent(username)}&limit=${count}`;
  }
  // Default fallback
  return `https://${host}/user-followings?username=${encodeURIComponent(username)}&count=${count}`;
}

/**
 * Parse response based on the API service
 */
function parseFollowingResponse(data: any, host: string): TwitterUser[] {
  // twitter241 response format
  if (host.includes('twitter241')) {
    if (data.result?.timeline?.instructions) {
      const entries = data.result.timeline.instructions
        .flatMap((inst: any) => inst.entries || [])
        .filter((entry: any) => entry.content?.itemContent?.user_results?.result)
        .map((entry: any) => {
          const user = entry.content.itemContent.user_results.result;
          const legacy = user.legacy || {};
          return {
            id: user.rest_id || user.id,
            username: legacy.screen_name || legacy.name,
            name: legacy.name || legacy.screen_name,
            profile_image_url: legacy.profile_image_url_https,
          };
        });
      return entries;
    }
    // Alternative format
    if (data.following || data.users) {
      return (data.following || data.users).map((user: any) => ({
        id: user.rest_id || user.id || user.id_str,
        username: user.screen_name || user.username,
        name: user.name,
        profile_image_url: user.profile_image_url_https || user.profile_image_url,
      }));
    }
  }

  // twitter-api45 response format
  if (host.includes('twitter-api45')) {
    if (data.following) {
      return data.following;
    }
  }

  // Generic format
  if (Array.isArray(data)) {
    return data.map((user: any) => ({
      id: user.rest_id || user.id || user.id_str,
      username: user.screen_name || user.username,
      name: user.name,
      profile_image_url: user.profile_image_url_https || user.profile_image_url,
    }));
  }

  if (data.data) {
    return data.data.map((user: any) => ({
      id: user.rest_id || user.id || user.id_str,
      username: user.screen_name || user.username,
      name: user.name,
      profile_image_url: user.profile_image_url_https || user.profile_image_url,
    }));
  }

  return [];
}

/**
 * Get user's following list from Twitter/X via RapidAPI
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
    const endpoint = getFollowingEndpoint(RAPIDAPI_HOST, username, maxResults);

    console.log('Fetching from RapidAPI:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidAPI error response:', response.status, errorText);
      throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('RapidAPI response keys:', Object.keys(data));

    const users = parseFollowingResponse(data, RAPIDAPI_HOST);
    return users.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching Twitter following:', error);
    throw error;
  }
}

/**
 * Get the appropriate followers endpoint based on the RapidAPI host
 */
function getFollowersEndpoint(host: string, username: string, count: number): string {
  // twitter241.p.rapidapi.com (Twttr API)
  if (host.includes('twitter241')) {
    return `https://${host}/user-followers?username=${encodeURIComponent(username)}&count=${count}`;
  }
  // twitter-api45.p.rapidapi.com
  if (host.includes('twitter-api45')) {
    return `https://${host}/followers.php?username=${encodeURIComponent(username)}`;
  }
  // Default fallback
  return `https://${host}/user-followers?username=${encodeURIComponent(username)}&count=${count}`;
}

/**
 * Parse followers response based on the API service
 */
function parseFollowersResponse(data: any, host: string): TwitterUser[] {
  // twitter241 response format - same structure as following
  if (host.includes('twitter241')) {
    if (data.result?.timeline?.instructions) {
      const entries = data.result.timeline.instructions
        .flatMap((inst: any) => inst.entries || [])
        .filter((entry: any) => entry.content?.itemContent?.user_results?.result)
        .map((entry: any) => {
          const user = entry.content.itemContent.user_results.result;
          const legacy = user.legacy || {};
          return {
            id: user.rest_id || user.id,
            username: legacy.screen_name || legacy.name,
            name: legacy.name || legacy.screen_name,
            profile_image_url: legacy.profile_image_url_https,
          };
        });
      return entries;
    }
    if (data.followers || data.users) {
      return (data.followers || data.users).map((user: any) => ({
        id: user.rest_id || user.id || user.id_str,
        username: user.screen_name || user.username,
        name: user.name,
        profile_image_url: user.profile_image_url_https || user.profile_image_url,
      }));
    }
  }

  // twitter-api45 response format
  if (host.includes('twitter-api45')) {
    if (data.followers) {
      return data.followers;
    }
  }

  // Generic format
  if (Array.isArray(data)) {
    return data.map((user: any) => ({
      id: user.rest_id || user.id || user.id_str,
      username: user.screen_name || user.username,
      name: user.name,
      profile_image_url: user.profile_image_url_https || user.profile_image_url,
    }));
  }

  return [];
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
    const endpoint = getFollowersEndpoint(RAPIDAPI_HOST, username, maxResults);

    console.log('Fetching followers from RapidAPI:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidAPI followers error response:', response.status, errorText);
      throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('RapidAPI followers response keys:', Object.keys(data));

    const users = parseFollowersResponse(data, RAPIDAPI_HOST);
    return users.slice(0, maxResults);
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
