'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit/OnchainKitProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
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
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
          chain={base}
          config={{
            appearance: {
              name: process.env.NEXT_PUBLIC_PROJECT_NAME || 'Find X Friends',
              logo: '/logo.png',
              mode: 'auto',
              theme: 'default',
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
