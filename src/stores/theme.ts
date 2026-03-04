import { defineStore } from 'pinia'
import {
  currentTheme,
  isDark,
  setTheme,
  loadThemePreference,
  getCurrentTheme,
  availableThemes,
  type ThemeName,
  type ThemeColors
} from '../utils/theme'

export const useThemeStore = defineStore('theme', () => {
  return {
    currentTheme,
    isDark,
    availableThemes,
    loadThemePreference,
    setTheme,
    getCurrentTheme
  }
})
