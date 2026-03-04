
import type { ThemeName, ThemeColors, ThemeInfo } from '../types/theme'

export { type ThemeName, type ThemeColors, type ThemeInfo }

export const availableThemes: ThemeInfo[] = [
  { name: 'light', label: 'Claro', color: '#ffffff', dark: false },
  { name: 'dark', label: 'Escuro', color: '#111827', dark: true },
  { name: 'ocean', label: 'Oceano', color: '#0ea5e9', dark: false },
  { name: 'nature', label: 'Natureza', color: '#10b981', dark: false },
  { name: 'sunset', label: 'Pôr do Sol', color: '#f59e0b', dark: false },
  { name: 'space', label: 'Espaço', color: '#818cf8', dark: true },
]

// Representação em HEX para uso em componentes que necessitam de valores HEX (ex: seletores, canvas)
export const themesColors: Record<ThemeName, ThemeColors> = {
  light: {
    primary: '#3b82f6', secondary: '#8b5cf6', background: '#ffffff', text: '#1f2937', border: '#e5e7eb', trabalho: '#059669', folga: '#dc2626'
  },
  dark: {
    primary: '#2563eb', secondary: '#1e293b', background: '#111827', text: '#ffffff', border: '#374151', trabalho: '#f87171', folga: '#34d399'
  },
  ocean: {
    primary: '#0ea5e9', secondary: '#06b6d4', background: '#f0f9ff', text: '#0c4a6e', border: '#bae6fd', trabalho: '#0891b2', folga: '#e11d48'
  },
  nature: {
    primary: '#10b981', secondary: '#84cc16', background: '#f0fdf4', text: '#064e3b', border: '#dcfce7', trabalho: '#059669', folga: '#b91c1c'
  },
  sunset: {
    primary: '#f59e0b', secondary: '#ec4899', background: '#fffbeb', text: '#78350f', border: '#fef3c7', trabalho: '#d97706', folga: '#be123c'
  },
  space: {
    primary: '#818cf8', secondary: '#c084fc', background: '#0f172a', text: '#f1f5f9', border: '#1e293b', trabalho: '#4ade80', folga: '#fb7185'
  }
}
