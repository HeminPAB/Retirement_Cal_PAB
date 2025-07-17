/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0991b1',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        background: '#ffffff',
        foreground: '#1f2937',
        muted: '#6b7280',
        accent: '#22d3ee',
        border: '#e5e7eb',
        secondary: '#f9fafb',
        input: '#ffffff',
        blue: {
          50: '#f0f9fb',
          100: '#e0f3f7',
          200: '#b9e6ef',
          300: '#8dd6e3',
          400: '#4dc0d5',
          500: '#0991b1',
          600: '#0991b1',
          700: '#0991b1',
          800: '#0991b1',
          900: '#0991b1',
        },
      },
      fontFamily: {
        sans: ['Lexend', 'Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 