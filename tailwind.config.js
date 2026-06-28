/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
  primary: {
    50: '#f0f4ff',
    100: '#e0e9fe',
    300: '#a5b4fc',   // ← ADD (used in page.tsx)
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',   // ← ADD (used in button-primary active)
    900: '#312e81',
  },
  accent: {
    50: '#fdf8f1',
    500: '#f59e0b',
    600: '#d97706',
  },
  success: {
    100: '#d1fae5',   // ← ADD (used in badge-success)
    500: '#10b981',
    600: '#059669',
    800: '#065f46',   // ← ADD (used in badge-success text)
  },
  warning: {
    100: '#fef3c7',   // ← ADD (used in badge-warning)
    500: '#f59e0b',
    600: '#d97706',
    800: '#92400e',   // ← ADD (used in badge-warning text)
  },
  danger: {
    50:  '#fef2f2',   // ← ADD (used in login/register error bg)
    100: '#fee2e2',   // ← ADD (used in badge-danger)
    200: '#fecaca',   // ← ADD (used in login/register error border)
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',   // ← ADD (used in button-danger hover)
    800: '#991b1b',   // ← ADD (used in badge-danger text)
  },
  // neutral stays the same...
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sohne', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        gutter: '1.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}