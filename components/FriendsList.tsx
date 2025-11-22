'use client';

import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { FollowButton } from './FollowButton';
import { MessageButton } from './MessageButton';
import { ShareButton } from './ShareButton';
import { base } from 'viem/chains';

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

interface FriendsListProps {
  friends: MatchedFriend[];
  totalSearched?: number;
}

export function FriendsList({ friends, totalSearched }: FriendsListProps) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😢</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No matches found
        </h3>
        <p className="text-gray-600">
          None of your X friends are on Farcaster yet.
          <br />
          Be the first to invite them!
        </p>
      </div>
    );
  }

  const matchRate = totalSearched
    ? ((friends.length / totalSearched) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {friends.length} {friends.length === 1 ? 'Friend' : 'Friends'} Found!
            </h2>
            {totalSearched && (
              <p className="text-sm text-gray-600">
                {matchRate}% of your X following ({totalSearched} total)
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ShareButton
              matchCount={friends.length}
              totalSearched={totalSearched || friends.length}
            />
            <div className="text-4xl">🎉</div>
          </div>
        </div>
      </div>

      {/* Friends Grid */}
      <div className="grid gap-4">
        {friends.map((friend) => (
          <FriendCard key={friend.farcasterUser.fid} friend={friend} />
        ))}
      </div>
    </div>
  );
}

function FriendCard({ friend }: { friend: MatchedFriend }) {
  const { farcasterUser, twitterHandle } = friend;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={farcasterUser.pfp_url}
            alt={farcasterUser.display_name}
            className="w-16 h-16 rounded-full"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {farcasterUser.display_name}
            </h3>
          </div>

          <p className="text-sm text-gray-600 mb-1">@{farcasterUser.username}</p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            <span>
              {farcasterUser.follower_count.toLocaleString()} followers
            </span>
            <span>•</span>
            <span>
              {farcasterUser.following_count.toLocaleString()} following
            </span>
          </div>

          {/* Twitter Handle Badge */}
          <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>@{twitterHandle}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <FollowButton fid={farcasterUser.fid} username={farcasterUser.username} />
          <MessageButton fid={farcasterUser.fid} username={farcasterUser.username} />
        </div>
      </div>
    </div>
  );
}
