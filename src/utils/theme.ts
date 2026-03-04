import { ref, computed } from 'vue'

import { carregarDados, salvarDados } from './useDadosApp'

export type ThemeName = 'light' | 'dark' | 'ocean' | 'nature' | 'sunset' | 'space'

interface ThemeInfo {
  name: ThemeName
  label: string
  color: string // Cor representativa para o seletor
}

export const availableThemes: ThemeInfo[] = [
  { name: 'light', label: 'Claro', color: '#f3f4f6' },
  { name: 'dark', label: 'Escuro', color: '#020617' },
  { name: 'ocean', label: 'Oceano', color: '#3b82f6' },
  { name: 'nature', label: 'Natureza', color: '#10b981' },
  { name: 'sunset', label: 'Pôr do Sol', color: '#f59e0b' },
  { name: 'space', label: 'Espaço', color: '#6366f1' },
]

// Estado do tema
const currentTheme = ref<ThemeName>('dark')

// Computed para compatibilidade com código antigo
const isDark = computed(() => ['dark', 'space'].includes(currentTheme.value))

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  text: string
  border: string
  trabalho: string
  folga: string
}

const themes: Record<ThemeName, ThemeColors> = {
  light: {
    primary: '#3B82F6', secondary: '#8B5CF6', background: '#FFFFFF', text: '#1F2937', border: '#E5E7EB', trabalho: '#059669', folga: '#DC2626'
  },
  dark: {
    primary: '#2563EB', secondary: '#1E293B', background: '#020617', text: '#F8FAFC', border: '#1E293B', trabalho: '#EF4444', folga: '#10B981'
  },
  ocean: {
    primary: '#0EA5E9', secondary: '#06B6D4', background: '#F0F9FF', text: '#0C4A6E', border: '#BAE6FD', trabalho: '#0891B2', folga: '#E11D48'
  },
  nature: {
    primary: '#10B981', secondary: '#84CC16', background: '#F0FDF4', text: '#064E3B', border: '#DCFCE7', trabalho: '#059669', folga: '#B91C1C'
  },
  sunset: {
    primary: '#F59E0B', secondary: '#EC4899', background: '#FFFBEB', text: '#78350F', border: '#FEF3C7', trabalho: '#D97706', folga: '#BE123C'
  },
  space: {
    primary: '#818CF8', secondary: '#C084FC', background: '#0F172A', text: '#F1F5F9', border: '#1E293B', trabalho: '#4ADE80', folga: '#FB7185'
  }
}

// Obter cores do tema atual
const getCurrentTheme = (): ThemeColors => {
  return themes[currentTheme.value]
}

// Carregar preferência do usuário do localforage
const loadThemePreference = async () => {
  try {
    const dados = await carregarDados()
    if (dados.tema) {
      // Se era 'sober', migra para 'dark'
      currentTheme.value = dados.tema === 'sober' ? 'dark' : dados.tema as ThemeName
    } else {
      // Tenta detectar preferência do sistema se não houver salvo
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
  } catch (e) {
    console.warn('⚠️ Erro ao carregar tema, usando tema padrão.')
    currentTheme.value = 'dark'
  }

  applyTheme()
}

// Aplicar tema ao documento
const applyTheme = async () => {
  // Remove todas as classes de tema anteriores
  availableThemes.forEach(t => {
    document.documentElement.classList.remove(`theme-${t.name}`)
  })

  // A classe 'dark' é especial para o Tailwind darkMode: 'class'
  document.documentElement.classList.toggle('dark', isDark.value)

  // Adiciona a classe do tema atual
  document.documentElement.classList.add(`theme-${currentTheme.value}`)

  const dados = await carregarDados()
  await salvarDados({ ...dados, tema: currentTheme.value })
}

// Definir tema
const setTheme = async (theme: ThemeName) => {
  currentTheme.value = theme
  await applyTheme()
}

// Alternar entre claro e escuro (simplificado)
const toggleTheme = async () => {
  const newTheme: ThemeName = isDark.value ? 'light' : 'dark'
  await setTheme(newTheme)
}

export { currentTheme, isDark, loadThemePreference, setTheme, toggleTheme, getCurrentTheme, type ThemeColors }
