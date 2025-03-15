/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'dark-purple': {
          500: '#6B21A8',
          600: '#581C87',
          700: '#4C1D95',
          800: '#3B0764',
          900: '#2E1065'
        }
      }
    },
  },
  plugins: [],
}
