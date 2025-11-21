'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import { base } from 'viem/chains';
import { coinbaseWallet } from 'wagmi/connectors';

// Dynamically import OnchainKit only in paid mode
let OnchainKitProvider: any = null;
if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true') {
  try {
    OnchainKitProvider = require('@coinbase/onchainkit').OnchainKitProvider;
  } catch (e) {
    console.warn('OnchainKit not available');
  }
}

// Check if payments are enabled
const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';

// Wagmi config (only if payments enabled)
const wagmiConfig = PAYMENTS_ENABLED
  ? createConfig({
      chains: [base],
      connectors: [
        coinbaseWallet({
          appName: process.env.NEXT_PUBLIC_PROJECT_NAME || 'Find X Friends',
          preference: 'smartWalletOnly',
        }),
      ],
      transports: {
        [base.id]: http(),
      },
    })
  : null;

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // Free mode: Only SessionProvider
  if (!PAYMENTS_ENABLED || !wagmiConfig) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  // Paid mode: Full Web3 stack
  if (OnchainKitProvider) {
    return (
      <SessionProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <OnchainKitProvider
              apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
              chain={base}
              config={{
                appearance: {
                  name: process.env.NEXT_PUBLIC_PROJECT_NAME || 'Find X Friends',
                  mode: 'auto',
                  theme: 'default',
                },
              }}
            >
              {children}
            </OnchainKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </SessionProvider>
    );
  }

  // Fallback if OnchainKit not available
  return (
    <SessionProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
