import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0C1B2E',
        surface: '#132B4C',
        border: '#1E3A5F',
        textPrimary: '#E8EDF4',
        textSecondary: '#9BB0CB',
        accent: '#4AADE0',
        gold: '#C6952B',
      },
    },
  },
  plugins: [],
};

export default config;
