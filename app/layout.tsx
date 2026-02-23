import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THE WORLD FACTBOOK — Reference Edition 2026',
  description: 'Comprehensive, authoritative country profiles and statistics. Open-source replacement for the CIA World Factbook.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
