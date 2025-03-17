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
        },
        'theme': {
          'dark': {
            'bg': {
              'primary': 'var(--theme-bg-primary)',
              'secondary': 'var(--theme-bg-secondary)',
              'tertiary': 'var(--theme-bg-tertiary)',
            },
            'text': {
              'primary': 'var(--theme-text-primary)',
              'secondary': 'var(--theme-text-secondary)',
              'tertiary': 'var(--theme-text-tertiary)',
            },
            'border': 'var(--theme-border)',
          },
          'light': {
            'bg': {
              'primary': 'var(--theme-bg-primary)',
              'secondary': 'var(--theme-bg-secondary)',
              'tertiary': 'var(--theme-bg-tertiary)',
            },
            'text': {
              'primary': 'var(--theme-text-primary)',
              'secondary': 'var(--theme-text-secondary)',
              'tertiary': 'var(--theme-text-tertiary)',
            },
            'border': 'var(--theme-border)',
          }
        }
      },
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'light': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
