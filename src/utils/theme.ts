import { ref, computed } from 'vue'

import { carregarDados, salvarDados } from './useDadosApp'

export type ThemeName = 'light' | 'dark' | 'ocean' | 'nature' | 'sunset' | 'space'

interface ThemeInfo {
  name: ThemeName
  label: string
  color: string // Cor representativa para o seletor
}

export const availableThemes: ThemeInfo[] = [
  { name: 'light', label: 'Claro', color: '#ffffff' },
  { name: 'dark', label: 'Escuro', color: '#111827' },
  { name: 'ocean', label: 'Oceano', color: '#0ea5e9' },
  { name: 'nature', label: 'Natureza', color: '#10b981' },
  { name: 'sunset', label: 'Pôr do Sol', color: '#f59e0b' },
  { name: 'space', label: 'Espaço', color: '#818cf8' },
]

// Estado global do tema
const currentTheme = ref<ThemeName>('dark')

// Verifica se o tema atual é do tipo escuro (útil para lógica de UI condicional)
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

// Representação em HEX para uso em JS (ex: seletores de cor, canvas, etc.)
const themes: Record<ThemeName, ThemeColors> = {
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

// Obter objeto de cores (HEX) do tema atual
const getCurrentTheme = (): ThemeColors => themes[currentTheme.value]

// Carregar preferência persistente do usuário
const loadThemePreference = async () => {
  try {
    const dados = await carregarDados()
    const temaSalvo = dados.tema === 'sober' ? 'dark' : dados.tema

    if (temaSalvo && availableThemes.some(t => t.name === temaSalvo)) {
      currentTheme.value = temaSalvo as ThemeName
    } else {
      // System default fallback
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
  } catch (e) {
    currentTheme.value = 'dark'
  }
  await applyTheme()
}

// Sincroniza o estado do tema com o DOM e o armazenamento
const applyTheme = async () => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const themeClass = `theme-${currentTheme.value}`

  // Limpar classes de temas anteriores
  availableThemes.forEach(t => {
    const cls = `theme-${t.name}`
    if (root.classList.contains(cls)) {
      root.classList.remove(cls)
    }
  })

  // Aplicar nova classe de tema
  root.classList.add(themeClass)

  // Persistir escolha
  try {
    const dados = await carregarDados()
    await salvarDados({ ...dados, tema: currentTheme.value })
  } catch (e) {
    console.error('Falha ao persistir tema:', e)
  }
}

// Alterar tema programaticamente
const setTheme = async (theme: ThemeName) => {
  currentTheme.value = theme
  await applyTheme()
}

export { currentTheme, isDark, loadThemePreference, setTheme, getCurrentTheme, type ThemeColors }
