'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  signerUuid?: string;
}

interface FarcasterAuthContextType {
  user: FarcasterUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMiniApp: boolean;
  signIn: () => void;
  signOut: () => void;
  signerUuid: string | null;
}

const FarcasterAuthContext = createContext<FarcasterAuthContextType | undefined>(undefined);

// Check if running inside Farcaster/Warpcast Mini App
function detectMiniApp(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Farcaster frame context
  const isFarcasterFrame = window.location !== window.parent.location;

  // Check for Warpcast user agent
  const isWarpcast = navigator.userAgent.toLowerCase().includes('warpcast');

  // Check for fc-frame in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const hasFarcasterParam = urlParams.has('fc-frame') || urlParams.has('fid');

  return isFarcasterFrame || isWarpcast || hasFarcasterParam;
}

interface FarcasterAuthProviderProps {
  children: ReactNode;
  clientId?: string;
}

export function FarcasterAuthProvider({ children, clientId }: FarcasterAuthProviderProps) {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [signerUuid, setSignerUuid] = useState<string | null>(null);

  // Detect Mini App environment on mount
  useEffect(() => {
    const miniApp = detectMiniApp();
    setIsMiniApp(miniApp);

    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('farcaster_user');
    const savedSigner = localStorage.getItem('farcaster_signer');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedSigner) {
          setSignerUuid(savedSigner);
        }
      } catch (e) {
        console.error('Failed to parse saved Farcaster user:', e);
      }
    }

    // If Mini App, try to get user context from parent frame
    if (miniApp) {
      getMiniAppContext();
    }

    setIsLoading(false);
  }, []);

  // Get context from Mini App parent frame
  const getMiniAppContext = async () => {
    try {
      // For Farcaster Frames/Mini Apps, the context is passed via postMessage or URL params
      const urlParams = new URLSearchParams(window.location.search);
      const fid = urlParams.get('fid');

      if (fid) {
        // Fetch user data from Neynar using FID
        const response = await fetch(`/api/farcaster/user?fid=${fid}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            const fcUser: FarcasterUser = {
              fid: data.user.fid,
              username: data.user.username,
              displayName: data.user.display_name,
              pfpUrl: data.user.pfp_url,
            };
            setUser(fcUser);
            localStorage.setItem('farcaster_user', JSON.stringify(fcUser));
          }
        }
      }
    } catch (error) {
      console.error('Error getting Mini App context:', error);
    }
  };

  // Sign in with Farcaster (opens Neynar SIWF modal or redirect)
  const signIn = useCallback(async () => {
    setIsLoading(true);

    try {
      // Use Neynar's Sign in with Farcaster
      const NEYNAR_CLIENT_ID = clientId || process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;

      if (!NEYNAR_CLIENT_ID) {
        console.error('Neynar Client ID not configured');
        alert('Farcaster sign-in is not configured. Please set NEXT_PUBLIC_NEYNAR_CLIENT_ID');
        setIsLoading(false);
        return;
      }

      // Redirect to Neynar SIWF
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/farcaster/callback`);
      const siwfUrl = `https://app.neynar.com/login?client_id=${NEYNAR_CLIENT_ID}&redirect_uri=${redirectUri}`;

      window.location.href = siwfUrl;
    } catch (error) {
      console.error('Farcaster sign-in error:', error);
      setIsLoading(false);
    }
  }, [clientId]);

  // Sign out
  const signOut = useCallback(() => {
    setUser(null);
    setSignerUuid(null);
    localStorage.removeItem('farcaster_user');
    localStorage.removeItem('farcaster_signer');
  }, []);

  const value: FarcasterAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isMiniApp,
    signIn,
    signOut,
    signerUuid,
  };

  return (
    <FarcasterAuthContext.Provider value={value}>
      {children}
    </FarcasterAuthContext.Provider>
  );
}

export function useFarcasterAuth() {
  const context = useContext(FarcasterAuthContext);
  if (context === undefined) {
    throw new Error('useFarcasterAuth must be used within a FarcasterAuthProvider');
  }
  return context;
}

// Export a sign-in button component
export function FarcasterSignInButton({ className }: { className?: string }) {
  const { signIn, isLoading, isAuthenticated, user } = useFarcasterAuth();

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={user.pfpUrl}
          alt={user.username}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm text-gray-600">@{user.username}</span>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      disabled={isLoading}
      className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <span className="animate-spin">⏳</span>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
          </svg>
          Sign in with Farcaster
        </>
      )}
    </button>
  );
}
