import '@/styles/globals.css';
import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import Background from '@/components/background';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import LocalFont from 'next/font/local';
import type { ReactNode } from 'react';

const inter = LocalFont({
  src: '../../public/fonts/Inter-Regular.ttf',
  variable: '--font-sans',
  weight: '400',
});

const calSans = LocalFont({
  src: '../../public/fonts/CalSans-SemiBold.ttf',
  variable: '--font-calsans',
});

export const metadata: Metadata = {
  ...defaultMetadata,
  keywords: ['Eric Leung', 'ericleung.hk', 'portfolio', 'links'],
  icons: {
    icon: '/icon.svg?v=2',
    shortcut: '/icon.svg?v=2',
    apple: '/apple-icon.svg?v=2',
  },
  twitter: {
    ...twitterMetadata,
  },
  openGraph: {
    ...ogMetadata,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  themeColor: '#f97316',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${calSans.variable} font-sans`}>
        <Background />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
