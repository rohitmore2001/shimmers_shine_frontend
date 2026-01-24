/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf7f5',
          100: '#f3e9e4',
          200: '#e7d3cb',
          300: '#d8b7a3',
          400: '#c89a84',
          500: '#b57e68',
          600: '#9a6350',
          700: '#7c4d3d',
          800: '#5d3a2f',
          900: '#3f2821',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'ui-serif', 'Georgia', 'serif'],
        body: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(60, 35, 28, 0.14)',
      },
    },
  },
  plugins: [],
}

