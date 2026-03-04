/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        trabalho: 'rgb(var(--color-trabalho) / <alpha-value>)',
        folga: 'rgb(var(--color-folga) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}