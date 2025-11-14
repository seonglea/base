'use client';

interface MessageButtonProps {
  fid: number;
  username: string;
}

export function MessageButton({ fid, username }: MessageButtonProps) {
  const handleMessage = () => {
    // Create Farcaster DM intent URL
    const message = encodeURIComponent(`Hey @${username}, I found you through Find X Friends!`);
    const dmUrl = `https://farcaster.xyz/~/inbox/create/${fid}?text=${message}`;

    // Open in new window/tab
    window.open(dmUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleMessage}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Message
    </button>
  );
}
