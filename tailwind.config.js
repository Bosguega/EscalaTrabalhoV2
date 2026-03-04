/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Mantém compatibilidade futura com dark: utilities

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
      },

      // Preparação para evolução futura de temas
      borderRadius: {
        base: 'var(--radius-base, 0.5rem)',
      },

      boxShadow: {
        card: 'var(--shadow-card, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
      }
    },
  },

  plugins: [],
}