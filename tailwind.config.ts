import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
      },
      colors: {
        background: '#F6F4EE',
        surface: '#ECE9E1',
        border: '#AAB6C7',
        textPrimary: '#1B2635',
        textSecondary: '#4E5F77',
        accent: '#4A86C5',
        gold: '#C6952B',
      },
    },
  },
  plugins: [],
};

export default config;
