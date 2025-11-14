'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { PaymentGate } from '@/components/PaymentGate';
import { FriendsList, MatchedFriend } from '@/components/FriendsList';

type Step = 'connect' | 'twitter-input' | 'payment' | 'loading' | 'results';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<Step>('connect');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [friendsData, setFriendsData] = useState<MatchedFriend[]>([]);
  const [totalSearched, setTotalSearched] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && step === 'connect') {
      setStep('twitter-input');
    } else if (!isConnected && step !== 'connect') {
      setStep('connect');
    }
  }, [isConnected]);

  const handlePaymentSuccess = async (txHash?: string) => {
    setStep('loading');
    setError('');

    try {
      // 1. Fetch Twitter following list
      const twitterResponse = await fetch('/api/twitter/following', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          twitterUsername,
          txHash,
        }),
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
        body: JSON.stringify({
          twitterHandles,
          address,
        }),
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
      setStep('payment');
    }
  };

  const handleStartOver = () => {
    setStep('twitter-input');
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
            <div className="text-2xl">🔍</div>
            <h1 className="text-xl font-bold text-gray-900">
              Find X Friends on Farcaster
            </h1>
          </div>
          {isConnected && (
            <Wallet>
              <ConnectWallet />
              <WalletDropdown>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Connect Wallet Step */}
        {step === 'connect' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome!
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to find which of your X friends are on Farcaster.
              </p>
              <div className="mb-4">
                <Wallet>
                  <ConnectWallet className="w-full" />
                </Wallet>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  🎉 First query is completely FREE!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Subsequent queries: $1 USDC on Base
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Twitter Username Input Step */}
        {step === 'twitter-input' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enter Your X Username
            </h2>
            <p className="text-gray-600 mb-6">
              We'll fetch your following list and find matches on Farcaster.
            </p>
            <input
              type="text"
              value={twitterUsername}
              onChange={(e) => setTwitterUsername(e.target.value.replace('@', ''))}
              placeholder="username (without @)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <button
              onClick={() => setStep('payment')}
              disabled={!twitterUsername.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Find Your Friends?
            </h2>
            <p className="text-gray-600 mb-6">
              Looking for X friends of <span className="font-semibold">@{twitterUsername}</span>
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <PaymentGate onSuccess={handlePaymentSuccess} />
            <button
              onClick={() => setStep('twitter-input')}
              className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              ← Change username
            </button>
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
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
          Built with{' '}
          <a
            href="https://onchainkit.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            OnchainKit
          </a>{' '}
          and{' '}
          <a
            href="https://base.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Base
          </a>
        </p>
      </footer>
    </div>
  );
}
