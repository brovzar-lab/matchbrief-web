import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0faf4',
          100: '#dcf5e7',
          200: '#bbead0',
          300: '#86d6af',
          400: '#4db885',
          500: '#2D6A4F',
          600: '#265c44',
          700: '#1e4a37',
          800: '#16382a',
          900: '#0f261d',
        },
        slate: {
          500: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
