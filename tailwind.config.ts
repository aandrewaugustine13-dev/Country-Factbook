import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B1F3A',
        surface: '#132B4C',
        border: '#2A4A73',
        textPrimary: '#E6EDF5',
        textSecondary: '#B7C7DA',
        accent: '#C7A55B',
      },
    },
  },
  plugins: [],
};

export default config;
