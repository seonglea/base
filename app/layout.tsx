import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Find X Friends on Farcaster',
  description: 'Discover which of your X followers are on Farcaster. First query FREE, then $1 USDC per query on Base.',
  openGraph: {
    title: 'Find X Friends on Farcaster',
    description: 'Discover which of your X followers are on Farcaster',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
