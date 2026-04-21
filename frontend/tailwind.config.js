/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#185FA5',
          50:  '#EAF2FA',
          100: '#CFE0F1',
          200: '#9FC2E3',
          300: '#6FA3D5',
          400: '#3F85C7',
          500: '#185FA5',
          600: '#134C84',
          700: '#0E3963',
          800: '#0A2642',
          900: '#051321',
        },
      },
      boxShadow: {
        'soft':     '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px 0 rgba(15, 23, 42, 0.02)',
        'soft-md':  '0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
        'soft-lg':  '0 10px 30px -6px rgba(15, 23, 42, 0.10), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
        'brand':    '0 10px 30px -10px rgba(24, 95, 165, 0.45)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'float':    'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 400ms ease both',
      },
    },
  },
  plugins: [],
}
