/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#6366F1',
        'accent-light': '#A5B4FC',
        'accent-dark': '#4338CA',
        match: '#10B981',
        partial: '#F59E0B',
        miss: '#EF4444',
      },
    },
  },
  plugins: [],
};
