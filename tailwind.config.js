/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#EEF7F1',
          100: '#D9EEE0',
          200: '#B3DDC2',
          300: '#84C79E',
          400: '#57AF7C',
          500: '#37945F', // core soft green
          600: '#2A7A4C',
          700: '#22623D',
          800: '#1C4E32',
          900: '#173F29',
        },
        ink: {
          50: '#F6F7F6',
          100: '#EBEDEB',
          200: '#D3D8D4',
          300: '#A9B2AB',
          400: '#7C877E',
          500: '#5B6660',
          600: '#454F49',
          700: '#333B36',
          800: '#242A26',
          900: '#181C19',
        },
        amber: {
          500: '#DB9A2E',
        },
        coral: {
          500: '#DB5A45',
        },
        sky: {
          500: '#3E7FBF',
        },
        violet: {
          500: '#7C63C9',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(24,28,25,0.04), 0 4px 14px rgba(24,28,25,0.06)',
        floating: '0 8px 24px rgba(24,28,25,0.12)',
      },
    },
  },
  plugins: [],
}
