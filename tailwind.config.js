/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          // Modern dark mode colors
          950: '#18181B', // Background
          925: '#27272A', // Surface/Card
          900: '#3F3F46', // Surface Hover & Border
          800: '#71717A', // Tertiary text
          700: '#A1A1AA', // Secondary text
          600: '#FAFAFA', // Primary text
        },
        sakura: {
          50: '#fef7f0',
          100: '#ffc0cb', // Light pink for sakura
          200: '#fad4bd',
          300: '#f6b896',
          400: '#f1996d',
          500: '#ed7e4a',
          600: '#d46635',
          700: '#b8542a',
          800: '#954424',
          900: '#773920'
        }
      },
      fontFamily: {
        sans: ['Nunito', '"Kosugi Maru"', 'system-ui', 'sans-serif'],
        japanese: ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
        osaka: ['Osaka', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
        kosugi: ['"Kosugi Maru"', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
