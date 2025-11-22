import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

const APP_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// fc:miniapp embed metadata for Farcaster/Base App
const miniAppEmbed = JSON.stringify({
  version: '1',
  imageUrl: `${APP_URL}/og-image.png`,
  button: {
    title: 'Find X Friends',
    action: {
      type: 'launch_frame',
      name: 'Find X Friends',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: '#6366f1',
    },
  },
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'Find X Friends on Farcaster',
  description: 'Discover which of your X followers are on Farcaster. Connect with your social network on Web3.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Find X Friends on Farcaster',
    description: 'Discover which of your X followers are on Farcaster',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find X Friends on Farcaster',
    description: 'Discover which of your X followers are on Farcaster',
    images: ['/og-image.png'],
  },
  other: {
    'fc:miniapp': miniAppEmbed,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
