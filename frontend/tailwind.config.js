/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
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
    },
  },
  plugins: [],
}
