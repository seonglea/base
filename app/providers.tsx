'use client';

import { SessionProvider } from 'next-auth/react';
import { OnchainKitProvider } from '@coinbase/onchainkit/OnchainKitProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import { base } from 'viem/chains';
import { coinbaseWallet } from 'wagmi/connectors';

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
