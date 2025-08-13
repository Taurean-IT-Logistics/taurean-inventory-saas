/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Phoenix Color System
        gray: {
          50: '#f5f7fa',
          100: '#eff2f6',
          200: '#e3e6ed',
          300: '#cbd0dd',
          400: '#9fa6bc',
          500: '#8a94ad',
          600: '#6e7891',
          700: '#525b75',
          800: '#3e465b',
          900: '#31374a',
          1000: '#222834',
          1100: '#141824',
        },
        // Phoenix Primary Colors (Blue)
        primary: {
          50: '#F5F8FF',
          100: '#E5EDFF',
          200: '#ADC5FF',
          300: '#85A9FF',
          400: '#6090FF',
          500: '#3874FF', // base blue
          600: '#004DFF',
          700: '#003CC7',
          800: '#0033AA',
          900: '#00267B',
          1000: '#00174D',
        },
        // Phoenix Secondary Colors (Gray-900)
        secondary: {
          50: '#f5f7fa',
          100: '#eff2f6',
          200: '#e3e6ed',
          300: '#cbd0dd',
          400: '#9fa6bc',
          500: '#8a94ad',
          600: '#6e7891',
          700: '#525b75',
          800: '#3e465b',
          900: '#31374a', // secondary base
          1000: '#222834',
          1100: '#141824',
        },
        // Phoenix Success Colors (Green)
        success: {
          50: '#F0FDEC',
          100: '#D9FBD0',
          200: '#BEE8B4',
          300: '#90D67F',
          400: '#51C035',
          500: '#25B003', // base green
          600: '#23890B',
          700: '#1C6C09',
          800: '#115A00',
          900: '#0B3D00',
          1000: '#061F00',
        },
        // Phoenix Danger Colors (Red)
        danger: {
          50: '#FFEDEB',
          100: '#FFE0DB',
          200: '#FABCB3',
          300: '#F48270',
          400: '#FB624A',
          500: '#FA3B1D', // base red
          600: '#CC1B00',
          700: '#B81800',
          800: '#901400',
          900: '#630D00',
          1000: '#380700',
        },
        // Phoenix Warning Colors (Orange)
        warning: {
          50: '#FFF6E0',
          100: '#FFEFCA',
          200: '#FFE6AD',
          300: '#FFCC85',
          400: '#EA9C3C',
          500: '#E5780B', // base orange
          600: '#D6630A',
          700: '#BC3803',
          800: '#901400',
          900: '#630D00',
          1000: '#380700',
        },
        // Phoenix Info Colors (Cyan)
        info: {
          50: '#F0FAFF',
          100: '#C7EBFF',
          200: '#96D9FF',
          300: '#60C6FF',
          400: '#33ACEF',
          500: '#0097EB', // base cyan
          600: '#0080C7',
          700: '#005585',
          800: '#004870',
          900: '#003A5B',
          1000: '#002337',
        },
        // Phoenix Background Colors
        body: {
          50: '#f5f7fa', // body-bg light
          100: '#eff2f6',
          200: '#e3e6ed',
          300: '#cbd0dd',
          400: '#9fa6bc',
          500: '#8a94ad',
          600: '#6e7891',
          700: '#525b75',
          800: '#3e465b',
          900: '#31374a', // body-color light
          1000: '#222834',
          1100: '#141824', // dark theme body-bg
        },
        // Brand Colors
        brand: {
          linkedin: '#0077b5',
          facebook: '#3c5a99',
          twitter: '#1da1f2',
          github: '#333333',
          youtube: '#ff0001',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}