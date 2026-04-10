module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#8bc70a',
        neutral: '#1c1c1d',
        info: {
          light: '#3b82f6',
          dark: '#60a5fa',
        },
        success: {
          light: '#22c55e',
          dark: '#4ade80',
        },
        warning: {
          light: '#f59e0b',
          dark: '#fbbf24',
        },
        error: {
          light: '#ef4444',
          dark: '#f87171',
        },
      },
      backgroundColor: {
        'neutral-dark': '#1c1c1d',
      },
    },
  },
  plugins: [],
}