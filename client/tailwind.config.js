/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e5ff',
          200: '#b8ceff',
          300: '#8aacff',
          400: '#5c83ff',
          500: '#3a60ff',
          600: '#2845ef',
          700: '#1f33c4',
          800: '#1e2d9a',
          900: '#1f2d7a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
