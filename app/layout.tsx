import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { CompareNavButton } from '@/components/CompareNavButton';

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

function WorldFactbookLogo() {
  return (
    <svg
      viewBox="0 0 512 512"
      className="site-logo"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="256" cy="220" r="150" stroke="currentColor" strokeWidth="4.5" />
      <ellipse cx="256" cy="220" rx="104" ry="150" stroke="currentColor" strokeWidth="2.2" />
      <ellipse cx="256" cy="220" rx="56" ry="150" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="256" cy="220" rx="150" ry="104" stroke="currentColor" strokeWidth="2.2" />
      <ellipse cx="256" cy="220" rx="150" ry="56" stroke="currentColor" strokeWidth="1.6" />
      <line
        x1="256"
        y1="70"
        x2="256"
        y2="370"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        fill="currentColor"
        d="M170 145 L182 138 L198 134 L214 136 L228 142 L238 150 L244 160 L242 168 L235 174 L228 178 L220 181 L214 186 L209 192 L202 197 L194 198 L186 195 L180 190 L175 184 L170 180 L165 176 L161 170 L160 162 L163 154 L170 145 Z"
      />
      <path
        fill="currentColor"
        d="M274 153 L283 149 L292 149 L300 152 L306 157 L309 163 L308 169 L304 173 L298 176 L292 178 L287 181 L284 185 L280 187 L275 186 L270 182 L268 176 L269 169 L272 161 L274 153 Z"
      />
      <path
        fill="currentColor"
        d="M300 154 L312 150 L326 150 L339 153 L350 158 L359 165 L363 173 L362 181 L357 187 L349 191 L340 194 L331 195 L322 195 L315 193 L309 191 L304 189 L300 184 L297 178 L297 171 L299 163 L300 154 Z"
      />
      <path
        d="M171 305 C146 283, 132 249, 134 209 C136 171, 153 140, 181 117"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M341 305 C366 283, 380 249, 378 209 C376 171, 359 140, 331 117"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
              <WorldFactbookLogo />
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
