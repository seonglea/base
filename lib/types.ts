/**
 * Shared TypeScript type definitions
 */

// Twitter/X Types
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

// Farcaster Types
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

// Matched Friend Type
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

// API Response Types
export interface PaymentStatusResponse {
  needsPayment: boolean;
  queryCount: number;
  message?: string;
}

export interface TwitterFollowingResponse {
  data: string[];
  source: 'cache' | 'api';
  count: number;
}

export interface MatchResponse {
  matches: MatchedFriend[];
  count: number;
  total_searched: number;
  match_rate: string;
  source: 'cache' | 'api';
}

export interface FollowResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// App State Types
export type AppStep = 'connect' | 'twitter-input' | 'payment' | 'loading' | 'results';

// Contract Types
export interface QueryStatus {
  needsPayment: boolean;
  queryCount: number;
}
