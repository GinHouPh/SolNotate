/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#c0d4ff',
          300: '#9ab7ff',
          400: '#7090ff',
          500: '#4b68fb',
          600: '#3045f2',
          700: '#2534df',
          800: '#242db7',
          900: '#232b8f',
          950: '#171a52',
        },
        gold: {
          50: '#fefbea',
          100: '#fdf4c7',
          200: '#fae991',
          300: '#f7d650',
          400: '#f5c321',
          500: '#e1a912',
          600: '#c3850c',
          700: '#9c620c',
          800: '#814e11',
          900: '#6c4013',
          950: '#3f2108',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  plugins: [],
};