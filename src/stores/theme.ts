import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  availableThemes,
  themesColors,
  type ThemeName,
  type ThemeColors
} from '../utils/theme'
import { carregarDados, salvarDados } from '../utils/useDadosApp'

export const useThemeStore = defineStore('theme', () => {
  // Estado
  const currentTheme = ref<ThemeName>('dark')

  // Getters
  const isDark = computed(() =>
    availableThemes.find(t => t.name === currentTheme.value)?.dark ?? false
  )

  // Obter objeto de cores (HEX) do tema atual para JS
  const getCurrentTheme = (): ThemeColors => themesColors[currentTheme.value]

  // Actions
  const applyTheme = async () => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    // Remove todos os temas anteriores
    availableThemes.forEach(t =>
      root.classList.remove(`theme-${t.name}`)
    )

    // Adiciona tema atual
    root.classList.add(`theme-${currentTheme.value}`)

    // Sincroniza classe 'dark' para compatibilidade com Tailwind utilities
    root.classList.toggle('dark', isDark.value)

    // Persistir
    try {
      const dados = await carregarDados()
      await salvarDados({ ...dados, tema: currentTheme.value })
    } catch (e) {
      console.error('Erro ao salvar tema:', e)
    }
  }

  const loadThemePreference = async () => {
    try {
      const dados = await carregarDados()
      if (dados.tema && availableThemes.some(t => t.name === dados.tema)) {
        currentTheme.value = dados.tema
      } else {
        // Fallback para sistema
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
