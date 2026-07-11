import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { CompareNavButton } from '@/components/CompareNavButton';
import { InstitutionalGlobe } from '@/components/InstitutionalGlobe';

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The World Factbook — Reference Edition 2026',
  description:
    'A modern, open-source reference for country profiles and statistics — inspired by the CIA World Factbook.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plex.variable}>
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="site-brand" aria-label="The World Factbook home">
              <InstitutionalGlobe variant="mark" className="site-logo" />
              <div className="site-brand-text">
                <span className="site-brand-title">The World Factbook</span>
                <span className="site-brand-sub">Reference Edition 2026</span>
              </div>
            </Link>

            <nav className="site-nav" aria-label="Primary">
              <Link href="/" className="nav-link">
                Dashboard
              </Link>
              <Link href="/compare" className="nav-link nav-link-compare">
                <CompareNavButton />
              </Link>
              <Link href="/map" className="nav-link">
                Map
              </Link>
              <Link href="/pyramids" className="nav-link">
                Pyramids
              </Link>
              <Link href="/quiz" className="nav-link">
                Quiz
              </Link>
              <Link href="/daily" className="nav-link nav-link-accent">
                Daily
              </Link>
            </nav>
          </div>
        </header>

        <main className="site-main">{children}</main>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <p>
              Open reference data from the CIA World Factbook archive and mledoze/countries.
              Independent project — not affiliated with any government agency.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
