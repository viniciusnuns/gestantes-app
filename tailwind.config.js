/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm, caring palette for pregnant women
        primary: {
          50: '#FAF5F2',
          100: '#F5EBE7',
          200: '#E8D5CF',
          300: '#D4A5A5', // Main warm rose
          400: '#C48A8A',
          500: '#B07070',
          600: '#9B5C5C',
          700: '#7A4848',
          800: '#5C3838',
          900: '#3E2828',
        },
        secondary: {
          50: '#FAF6FB',
          100: '#F3EBF7',
          200: '#E1CDED',
          300: '#C4A8D9', // Soft purple
          400: '#B08BC4',
          500: '#9B6FB0',
          600: '#7B5A94',
          700: '#6B4C83',
          800: '#533969',
          900: '#3A2850',
        },
        accent: {
          50: '#FEF8F2',
          100: '#FEF0E5',
          200: '#FDD9C2',
          300: '#F5C89A', // Warm peach/golden
          400: '#F0B870',
          500: '#EAA857',
          600: '#D49442',
          700: '#B87D35',
          800: '#8F6129',
          900: '#664621',
        },
        warm: {
          50: '#FBF8F4', // Warm white background
          100: '#F7F3ED',
          200: '#EFEAE3',
          300: '#E7DDD4',
          400: '#DDD0C7',
          500: '#D4CACA',
          600: '#C4BDBA',
        },
        text: {
          primary: '#5C4C5C',
          secondary: '#8B7B8B',
          light: '#A89BA9',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.35s ease-out',
      },
    },
  },
  plugins: [],
}
