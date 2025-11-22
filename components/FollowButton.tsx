'use client';

import { useState, useEffect } from 'react';

interface FollowButtonProps {
  fid: number;
  username: string;
}

export function FollowButton({ fid, username }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signerUuid, setSignerUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get signer from localStorage
  useEffect(() => {
    const signer = localStorage.getItem('farcaster_signer');
    setSignerUuid(signer);
  }, []);

  const handleFollow = async () => {
    if (!signerUuid) {
      setError('Please sign in with Farcaster first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/farcaster/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerUuid,
          targetFid: fid,
        }),
      });

      if (response.ok) {
        setIsFollowing(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to follow user');
      }
    } catch (error) {
      console.error('Error following user:', error);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFollowing) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-green-100 text-green-600 text-sm font-medium rounded-lg cursor-not-allowed"
      >
        ✓ Following
      </button>
    );
  }

  // No signer - show disabled state
  if (!signerUuid) {
    return (
      <button
        disabled
        title="Sign in with Farcaster to follow users"
        className="px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
      >
        Follow
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleFollow}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {isLoading ? 'Following...' : 'Follow'}
      </button>
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
}
