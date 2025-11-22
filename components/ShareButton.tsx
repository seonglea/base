'use client';

import { useState } from 'react';

interface ShareButtonProps {
  matchCount: number;
  totalSearched: number;
  className?: string;
}

/**
 * Share button that opens Farcaster compose with pre-filled text
 * Uses the Warpcast intent URL for sharing
 */
export function ShareButton({ matchCount, totalSearched, className }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);

    const matchRate = totalSearched > 0 ? ((matchCount / totalSearched) * 100).toFixed(1) : '0';
    const appUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;

    // Create share text
    const shareText = `I found ${matchCount} of my X friends on Farcaster! (${matchRate}% match rate)

Discover your X friends on Farcaster too:`;

    // Try MiniKit composeCast first (if in Mini App context)
    if (typeof window !== 'undefined' && (window as any).farcaster?.composeCast) {
      try {
        await (window as any).farcaster.composeCast({
          text: shareText,
          embeds: [appUrl],
        });
        setIsSharing(false);
        return;
      } catch (e) {
        console.log('MiniKit composeCast not available, falling back to intent URL');
      }
    }

    // Fallback to Warpcast intent URL
    const intentUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(appUrl)}`;

    window.open(intentUrl, '_blank', 'noopener,noreferrer');
    setIsSharing(false);
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2 ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      {isSharing ? 'Sharing...' : 'Share Results'}
    </button>
  );
}
