import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F5F7FB',
        border: '#C8D3E0',
        textPrimary: '#1A1D2B',
        textSecondary: '#5A6678',
        accent: '#4B92DB',
        gold: '#C6952B',
      },
    },
  },
  plugins: [],
};

export default config;
