import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { CompareNavButton } from '@/components/CompareNavButton';

export const metadata: Metadata = {
  title: 'THE WORLD FACTBOOK — Reference Edition 2026',
  description: 'Comprehensive, authoritative country profiles and statistics. Open-source replacement for the CIA World Factbook.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top-nav">
          <div className="container top-nav-inner">
            <Link href="/">Factbook</Link>
            <CompareNavButton />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
