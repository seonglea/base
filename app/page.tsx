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

// Saved X list data structure
interface SavedXList {
  following: string[];
  followers: string[];
  followingCount: number;
  followersCount: number;
  syncedAt: string;
  twitterUsername: string;
}

type Step = 'signin' | 'farcaster-signin' | 'connect-wallet' | 'sync-xlist' | 'ready' | 'payment' | 'loading' | 'results';
type SearchType = 'following' | 'followers';

export default function Home() {
  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();
  const farcasterAuth = useFarcasterAuth();
  const [step, setStep] = useState<Step>('signin');
  const [friendsData, setFriendsData] = useState<MatchedFriend[]>([]);
  const [totalSearched, setTotalSearched] = useState(0);
  const [error, setError] = useState('');

  // X List state
  const [savedXList, setSavedXList] = useState<SavedXList | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('following');

  // Handle Farcaster auth callback (from URL params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('farcaster_auth') === 'success') {
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
          pfpUrl: pfpUrl ? decodeURIComponent(pfpUrl) : '',
          signerUuid: signerUuid || undefined,
        };
        localStorage.setItem('farcaster_user', JSON.stringify(fcUser));
        if (signerUuid) {
          localStorage.setItem('farcaster_signer', signerUuid);
        }
        window.history.replaceState({}, '', '/');
        window.location.reload();
      }
    }
  }, []);

  // Check for saved X list on mount
  useEffect(() => {
    if (status === 'authenticated') {
      checkSavedXList();
    }
  }, [status]);

  // Update step based on auth state
  useEffect(() => {
    if (status === 'loading' || farcasterAuth.isLoading) return;

    if (PAYMENTS_ENABLED) {
      // Paid mode: Twitter + Farcaster + Wallet required
      if (status === 'authenticated' && farcasterAuth.isAuthenticated && isConnected) {
        if (step === 'signin' || step === 'farcaster-signin' || step === 'connect-wallet') {
          setStep('sync-xlist');
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
          setStep('sync-xlist');
        }
      } else if (status === 'authenticated' && !farcasterAuth.isAuthenticated) {
        if (step === 'signin') {
          setStep('farcaster-signin');
        }
      }
    }
  }, [status, farcasterAuth.isAuthenticated, farcasterAuth.isLoading, isConnected, step]);

  // Check if we have saved X list data
  const checkSavedXList = async () => {
    try {
      const response = await fetch('/api/twitter/sync');
      const data = await response.json();
      if (data.hasSavedData && data.data) {
        setSavedXList(data.data);
      }
    } catch (err) {
      console.error('Error checking saved X list:', err);
    }
  };

  // Sync X list (fetch followers + following and save)
  const handleSyncXList = async () => {
    setIsSyncing(true);
    setError('');

    try {
      const response = await fetch('/api/twitter/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync X list');
      }

      const data = await response.json();
      setSavedXList(data.data);
    } catch (err) {
      console.error('Error syncing X list:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSyncing(false);
    }
  };

  // Find friends using saved or fresh data
  const handleFindFriends = async (txHash?: string) => {
    setStep('loading');
    setError('');

    try {
      // Get the appropriate list based on searchType
      let twitterHandles: string[] = [];

      if (savedXList) {
        // Use saved data
        twitterHandles = searchType === 'following' ? savedXList.following : savedXList.followers;
      } else {
        // Fetch from API (fallback)
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
        twitterHandles = twitterData.data;
      }

      if (twitterHandles.length === 0) {
        throw new Error(`No ${searchType} found. Please sync your X list first.`);
      }

      // Match with Farcaster users
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
      setStep('sync-xlist');
    }
  };

  const handleStartOver = () => {
    setStep('sync-xlist');
    setFriendsData([]);
    setTotalSearched(0);
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔍</div>
            <h1 className="text-xl font-bold text-gray-900">
              Find X Friends on Farcaster
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <span className="text-blue-500">𝕏</span>
                @{(session.user as any)?.twitterUsername}
              </div>
            )}
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

        {/* Sync X List Step */}
        {step === 'sync-xlist' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📋 X List
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Saved Data Status */}
            {savedXList ? (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 font-medium mb-2">
                    ✅ X 리스트 저장됨
                  </p>
                  <div className="text-xs text-green-700 space-y-1">
                    <p>팔로잉: {savedXList.followingCount}명</p>
                    <p>팔로워: {savedXList.followersCount}명</p>
                    <p>저장일: {formatDate(savedXList.syncedAt)}</p>
                  </div>
                </div>

                {/* Search Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검색 대상 선택
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSearchType('following')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                        searchType === 'following'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">팔로잉</div>
                      <div className="text-xs text-gray-500">
                        {savedXList.followingCount}명
                      </div>
                    </button>
                    <button
                      onClick={() => setSearchType('followers')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                        searchType === 'followers'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">팔로워</div>
                      <div className="text-xs text-gray-500">
                        {savedXList.followersCount}명
                      </div>
                    </button>
                  </div>
                </div>

                {/* Find Friends Button */}
                <button
                  onClick={() => handleFindFriends()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-3"
                >
                  🔍 {searchType === 'following' ? '팔로잉' : '팔로워'} 중 Farcaster 친구 찾기
                </button>

                {/* Re-sync Button */}
                <button
                  onClick={handleSyncXList}
                  disabled={isSyncing}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {isSyncing ? '동기화 중...' : '🔄 X 리스트 다시 가져오기'}
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    아직 저장된 X 리스트가 없습니다.
                    <br />
                    아래 버튼을 클릭하여 팔로워/팔로잉 리스트를 가져오세요.
                  </p>
                </div>

                <button
                  onClick={handleSyncXList}
                  disabled={isSyncing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      X 리스트 가져오는 중...
                    </>
                  ) : (
                    <>
                      📥 X 리스트 가져오기 및 저장
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  팔로워와 팔로잉 리스트를 가져와서 7일간 저장합니다.
                  <br />
                  이후에는 저장된 데이터를 사용하여 API 비용을 절약합니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading Step */}
        {step === 'loading' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Farcaster 친구 찾는 중...
            </h2>
            <p className="text-gray-600">
              {searchType === 'following' ? '팔로잉' : '팔로워'} 목록에서 Farcaster 사용자를 검색하고 있습니다.
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
                다시 검색
              </button>
              <span className="text-sm text-gray-500">
                {searchType === 'following' ? '팔로잉' : '팔로워'} 검색 결과
              </span>
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
