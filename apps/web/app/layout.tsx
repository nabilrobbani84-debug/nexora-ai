import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NEXORA AI',
    template: '%s | NEXORA AI',
  },
  description: 'Enterprise omnichannel customer intelligence and retention platform.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={GeistSans.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
