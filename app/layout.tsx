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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="top-nav">
          <div className="container top-nav-inner">
            <Link href="/" className="nav-home">The World Factbook</Link>
            <nav className="nav-links">
              <Link href="/compare" className="nav-link">
                <CompareNavButton />
              </Link>
              <Link href="/quiz" className="nav-link">Quiz</Link>
              <Link href="/daily" className="nav-link">Daily</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
