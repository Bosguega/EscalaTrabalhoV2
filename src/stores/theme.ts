import { defineStore } from 'pinia'
import { ref } from 'vue'
import { carregarDados, salvarDados } from '../utils/useDadosApp'

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  text: string
  border: string
  trabalho: string
  folga: string
}

interface Theme {
  light: ThemeColors
  dark: ThemeColors
}

const themes: Theme = {
  light: {
    primary: '#3B82F6',    // blue-500
    secondary: '#8B5CF6',  // purple-500
    background: '#FFFFFF',  // white
    text: '#1F2937',       // gray-800
    border: '#E5E7EB',     // gray-200
    trabalho: '#059669',   // emerald-600
    folga: '#DC2626'       // red-600
  },
  dark: {
    primary: '#60A5FA',    // blue-400
    secondary: '#A78BFA',   // purple-400
    background: '#1F2937',  // gray-800
    text: '#F3F4F6',       // gray-100
    border: '#374151',     // gray-700
    trabalho: '#34D399',   // emerald-400
    folga: '#F87171'       // red-400
  }
}

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  // Carregar preferência do usuário do localforage
  async function loadThemePreference() {
    try {
      const dados = await carregarDados()
      if (dados.tema) {
        isDark.value = dados.tema === 'dark'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    } catch (e) {
      console.warn('⚠️ Erro ao carregar tema, usando tema padrão.')
      isDark.value = false
    }
    
    applyTheme()
  }

  // Aplicar tema ao documento
  async function applyTheme() {
    document.documentElement.classList.toggle('dark', isDark.value)
    const dados = await carregarDados()
    await salvarDados({ ...dados, tema: isDark.value ? 'dark' : 'light' })
  }

  // Alternar tema
  async function toggleTheme() {
    isDark.value = !isDark.value
    await applyTheme()
  }

  // Obter cores do tema atual
  function getCurrentTheme(): ThemeColors {
    return isDark.value ? themes.dark : themes.light
  }

  return {
    isDark,
    loadThemePreference,
    toggleTheme,
    getCurrentTheme
  }
}) 