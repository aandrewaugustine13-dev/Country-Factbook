import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F7F4EE',
          soft: '#FBF9F5',
          muted: '#EFE9DF',
        },
        ink: {
          DEFAULT: '#1A2332',
          secondary: '#5A6A7A',
          muted: '#8A96A3',
        },
        navy: {
          DEFAULT: '#0D2B45',
          deep: '#0A2238',
          soft: '#1A3A56',
        },
        sky: {
          DEFAULT: '#1B6CA8',
          bright: '#2B8BC9',
          soft: '#E8F2FA',
        },
        teal: {
          DEFAULT: '#2A7F7A',
          soft: '#E6F3F2',
        },
        gold: {
          DEFAULT: '#B8860B',
          soft: '#F7F0DD',
        },
        surface: '#FFFFFF',
        border: '#E5DFD4',
      },
      fontFamily: {
        sans: [
          'var(--font-plex)',
          'IBM Plex Sans',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13, 43, 69, 0.04), 0 8px 24px rgba(13, 43, 69, 0.06)',
        'card-hover':
          '0 2px 4px rgba(13, 43, 69, 0.06), 0 12px 32px rgba(13, 43, 69, 0.1)',
        nav: '0 1px 0 rgba(13, 43, 69, 0.06)',
      },
      borderRadius: {
        card: '0.75rem',
        pill: '999px',
      },
    },
  },
  plugins: [],
};

export default config;
