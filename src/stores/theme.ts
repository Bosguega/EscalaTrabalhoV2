import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  availableThemes,
  themesColors,
  type ThemeName,
  type ThemeColors
} from '../utils/theme'
import { atualizarDados, carregarDados } from '../utils/useDadosApp'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>('dark')

  const isDark = computed(() =>
    availableThemes.find(t => t.name === currentTheme.value)?.dark ?? false
  )

  const getCurrentTheme = (): ThemeColors => themesColors[currentTheme.value]

  const applyTheme = async () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement

      availableThemes.forEach(t =>
        root.classList.remove(`theme-${t.name}`)
      )

      root.classList.add(`theme-${currentTheme.value}`)
      root.classList.toggle('dark', isDark.value)
    }

    try {
      await atualizarDados({ tema: currentTheme.value })
    } catch (e) {
      console.error('Erro ao salvar tema:', e)
      throw e
    }
  }

  const loadThemePreference = async () => {
    try {
      const dados = await carregarDados()
      if (dados.tema && availableThemes.some(t => t.name === dados.tema)) {
        currentTheme.value = dados.tema
      } else if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        currentTheme.value = prefersDark ? 'dark' : 'light'
      }
    } catch (e) {
      currentTheme.value = 'dark'
    }
    await applyTheme()
  }

  const setTheme = async (theme: ThemeName) => {
    if (!availableThemes.some(t => t.name === theme)) return
    currentTheme.value = theme
    await applyTheme()
  }

  return {
    currentTheme,
    isDark,
    availableThemes,
    loadThemePreference,
    setTheme,
    getCurrentTheme
  }
})
