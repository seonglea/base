'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FriendsList, MatchedFriend } from '@/components/FriendsList';
import { useFarcasterAuth, FarcasterSignInButton } from '@/lib/farcaster-auth';

// Conditional imports for paid mode
const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';

let useAccount: any = () => ({ address: null, isConnected: false });
let ConnectWallet: any = null;
let Wallet: any = null;
let WalletDropdown: any = null;
let WalletDropdownDisconnect: any = null;
let PaymentGate: any = null;

if (PAYMENTS_ENABLED) {
  try {
    const wagmi = require('wagmi');
    useAccount = wagmi.useAccount;

    const onchainkit = require('@coinbase/onchainkit/wallet');
    ConnectWallet = onchainkit.ConnectWallet;
    Wallet = onchainkit.Wallet;
    WalletDropdown = onchainkit.WalletDropdown;
    WalletDropdownDisconnect = onchainkit.WalletDropdownDisconnect;

    PaymentGate = require('@/components/PaymentGate').PaymentGate;
  } catch (e) {
    console.warn('Payment mode dependencies not available');
  }
}

type Step = 'signin' | 'farcaster-signin' | 'connect-wallet' | 'ready' | 'payment' | 'loading' | 'results';

export default function Home() {
  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();
  const farcasterAuth = useFarcasterAuth();
  const [step, setStep] = useState<Step>('signin');
  const [friendsData, setFriendsData] = useState<MatchedFriend[]>([]);
  const [totalSearched, setTotalSearched] = useState(0);
  const [error, setError] = useState('');

  // Handle Farcaster auth callback (from URL params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('farcaster_auth') === 'success') {
      // Store Farcaster user data from callback
      const fid = urlParams.get('fid');
      const signerUuid = urlParams.get('signer_uuid');
      const username = urlParams.get('fc_username');
      const displayName = urlParams.get('fc_display_name');
      const pfpUrl = urlParams.get('fc_pfp_url');

      if (fid && username) {
        const fcUser = {
          fid: parseInt(fid),
          username,
          displayName: displayName || username,
          pfpUrl: pfpUrl || '',
          signerUuid: signerUuid || undefined,
        };
        localStorage.setItem('farcaster_user', JSON.stringify(fcUser));
        if (signerUuid) {
          localStorage.setItem('farcaster_signer', signerUuid);
        }
        // Clean URL
        window.history.replaceState({}, '', '/');
        window.location.reload();
      }
    }
  }, []);

  // Update step based on auth state
  useEffect(() => {
    if (status === 'loading' || farcasterAuth.isLoading) return;

    if (PAYMENTS_ENABLED) {
      // Paid mode: Twitter + Farcaster + Wallet required
      if (status === 'authenticated' && farcasterAuth.isAuthenticated && isConnected) {
        if (step === 'signin' || step === 'farcaster-signin' || step === 'connect-wallet') {
          setStep('payment');
        }
      } else if (status === 'authenticated' && farcasterAuth.isAuthenticated && !isConnected) {
        if (step === 'signin' || step === 'farcaster-signin') {
          setStep('connect-wallet');
        }
      } else if (status === 'authenticated' && !farcasterAuth.isAuthenticated) {
        if (step === 'signin') {
          setStep('farcaster-signin');
        }
      }
    } else {
      // Free mode: Twitter + Farcaster
      if (status === 'authenticated' && farcasterAuth.isAuthenticated) {
        if (step === 'signin' || step === 'farcaster-signin') {
          setStep('ready');
        }
      } else if (status === 'authenticated' && !farcasterAuth.isAuthenticated) {
        if (step === 'signin') {
          setStep('farcaster-signin');
        }
      }
    }
  }, [status, farcasterAuth.isAuthenticated, farcasterAuth.isLoading, isConnected, step]);

  const handleFindFriends = async (txHash?: string) => {
    setStep('loading');
    setError('');

    try {
      // 1. Fetch Twitter following list
      const twitterResponse = await fetch('/api/twitter/following', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      });

      if (!twitterResponse.ok) {
        const errorData = await twitterResponse.json();
        throw new Error(errorData.error || 'Failed to fetch Twitter data');
      }

      const twitterData = await twitterResponse.json();
      const twitterHandles = twitterData.data;

      // 2. Match with Farcaster users
      const matchResponse = await fetch('/api/farcaster/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitterHandles }),
      });

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.error || 'Failed to match Farcaster users');
      }

      const matchData = await matchResponse.json();
      setFriendsData(matchData.matches);
      setTotalSearched(matchData.total_searched);
      setStep('results');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep(PAYMENTS_ENABLED ? 'payment' : 'ready');
    }
  };

  const handleStartOver = () => {
    setStep(PAYMENTS_ENABLED ? 'payment' : 'ready');
    setFriendsData([]);
    setTotalSearched(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo emoji - simple and always works */}
            <div className="text-2xl">🔍</div>
            <h1 className="text-xl font-bold text-gray-900">
              Find X Friends on Farcaster
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Twitter user */}
            {session && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <span className="text-blue-500">𝕏</span>
                @{(session.user as any)?.twitterUsername}
              </div>
            )}
            {/* Farcaster user */}
            {farcasterAuth.isAuthenticated && farcasterAuth.user && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <span className="text-purple-500">⌐◨-◨</span>
                @{farcasterAuth.user.username}
              </div>
            )}
            {PAYMENTS_ENABLED && isConnected && (
              <Wallet>
                <ConnectWallet />
                <WalletDropdown>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            )}
            {(session || farcasterAuth.isAuthenticated) && (
              <button
                onClick={() => {
                  signOut();
                  farcasterAuth.signOut();
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Sign In Step */}
        {step === 'signin' && status !== 'loading' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome!
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in with Twitter to find which of your friends are on Farcaster.
              </p>
              <button
                onClick={() => signIn('twitter')}
                className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Sign in with Twitter
              </button>
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  {PAYMENTS_ENABLED ? '🎉 First query FREE!' : '🎉 Completely FREE!'}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {PAYMENTS_ENABLED
                    ? 'Then $1 USDC per query'
                    : 'No payments, no wallet needed'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Farcaster Sign In Step */}
        {step === 'farcaster-signin' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">⌐◨-◨</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Farcaster
              </h2>
              <p className="text-gray-600 mb-2">
                ✅ Twitter connected as @{(session?.user as any)?.twitterUsername}
              </p>
              <p className="text-gray-600 mb-6">
                Now sign in with Farcaster to follow and message your friends.
              </p>
              <FarcasterSignInButton className="w-full justify-center" />
              <div className="mt-4 text-xs text-gray-500">
                {farcasterAuth.isMiniApp ? (
                  <span className="text-green-600">✓ Running in Farcaster app</span>
                ) : (
                  <span>Running as standalone web app</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Connect Wallet Step (Paid mode only) */}
        {PAYMENTS_ENABLED && step === 'connect-wallet' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">👛</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your Base wallet to enable payments.
              </p>
              <Wallet>
                <ConnectWallet className="w-full" />
              </Wallet>
            </div>
          </div>
        )}

        {/* Ready Step (Free mode) */}
        {!PAYMENTS_ENABLED && step === 'ready' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Find Your Friends?
            </h2>
            <p className="text-gray-600 mb-6">
              We'll search through your Twitter following list and find matches on Farcaster.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <button
              onClick={() => handleFindFriends()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Find My X Friends (FREE)
            </button>
          </div>
        )}

        {/* Payment Step (Paid mode) */}
        {PAYMENTS_ENABLED && step === 'payment' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Find Your Friends?
            </h2>
            <p className="text-gray-600 mb-6">
              Looking for X friends of @{session?.user?.twitterUsername}
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <PaymentGate onSuccess={handleFindFriends} />
          </div>
        )}

        {/* Loading Step */}
        {step === 'loading' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Finding Your Friends...
            </h2>
            <p className="text-gray-600">
              This may take a moment as we search through your X following list.
            </p>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handleStartOver}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Search Again
              </button>
            </div>
            <FriendsList friends={friendsData} totalSearched={totalSearched} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>
          Built for{' '}
          <a
            href="https://base.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Base
          </a>
          {' '}&amp;{' '}
          <a
            href="https://farcaster.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Farcaster
          </a>
          {PAYMENTS_ENABLED && ' • Powered by USDC on Base'}
        </p>
      </footer>
    </div>
  );
}
