/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          500: '#3b5fe0',
          600: '#2f4cc4',
          700: '#263da0',
        },
      },
    },
  },
  plugins: [],
}
