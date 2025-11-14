'use client';

import { useState } from 'react';

interface FollowButtonProps {
  fid: number;
  username: string;
}

export function FollowButton({ fid, username }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      // Note: In a real implementation, you would need a signer UUID
      // from the user's authenticated Farcaster session
      const response = await fetch('/api/farcaster/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerUuid: 'user-signer-uuid', // This should come from auth
          targetFid: fid,
        }),
      });

      if (response.ok) {
        setIsFollowing(true);
      } else {
        console.error('Failed to follow user');
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFollowing) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed"
      >
        Following
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
    >
      {isLoading ? 'Following...' : 'Follow'}
    </button>
  );
}
